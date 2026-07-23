use std::fs;
use std::path::PathBuf;
use tauri::{command, AppHandle, Manager, Runtime};

const APP_NAME: &str = "EconomiaCasera";
const DB_NAME: &str = "economiacasera.db";
const BACKUP_NAME: &str = "economiacasera_backup.db";

#[derive(serde::Serialize)]
pub struct DbInfo {
    db_path: String,
    backup_path: String,
    uses_drive: bool,
    drive_folder: Option<String>,
    has_conflict: bool,
}

#[derive(serde::Serialize)]
pub struct ReloadResult {
    ok: bool,
    db_path: String,
    uses_drive: bool,
}

fn home_dir() -> PathBuf {
    dirs::home_dir().unwrap_or_else(|| PathBuf::from("."))
}

fn find_google_drive() -> Option<PathBuf> {
    let home = home_dir();
    let candidates = [
        home.join("Google Drive"),
        home.join("Drive").join("Mi unidad"),
        home.join("Drive").join("My Drive"),
        home.join("Drive"),
    ];
    for candidate in candidates.iter() {
        if candidate.is_dir() {
            return Some(candidate.clone());
        }
    }
    None
}

fn db_path<R: Runtime>(app: &AppHandle<R>) -> PathBuf {
    app.path().app_data_dir().unwrap_or_else(|_| home_dir().join(APP_NAME)).join(DB_NAME)
}

fn backup_path() -> PathBuf {
    home_dir().join(APP_NAME).join("backup").join(BACKUP_NAME)
}

fn drive_db_path(drive_folder: &PathBuf) -> PathBuf {
    drive_folder.join(APP_NAME).join(DB_NAME)
}

fn drive_sync_path(drive_folder: &PathBuf) -> PathBuf {
    drive_folder.join(APP_NAME).join("sync.json")
}

fn ensure_parent(path: &PathBuf) {
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
}

fn file_mtime(path: &PathBuf) -> Option<u64> {
    fs::metadata(path)
        .ok()
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
}

fn copy_file(source: &PathBuf, target: &PathBuf) -> Result<(), String> {
    ensure_parent(target);
    fs::copy(source, target)
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_db_info<R: Runtime>(app: AppHandle<R>) -> Result<DbInfo, String> {
    let db = db_path(&app);
    let backup = backup_path();
    let drive = find_google_drive();
    let uses_drive = drive.is_some();
    let drive_folder = drive.as_ref().map(|d| d.to_string_lossy().to_string());

    if let Some(ref drive_root) = drive {
        let drive_db = drive_db_path(drive_root);
        if drive_db.exists() && db.exists() {
            let drive_mtime = file_mtime(&drive_db).unwrap_or(0);
            let local_mtime = file_mtime(&db).unwrap_or(0);
            let _ = copy_file(&drive_db, &backup);
            if drive_mtime > local_mtime + 2 {
                return Ok(DbInfo {
                    db_path: db.to_string_lossy().to_string(),
                    backup_path: backup.to_string_lossy().to_string(),
                    uses_drive,
                    drive_folder,
                    has_conflict: true,
                });
            }
        }
    }

    Ok(DbInfo {
        db_path: db.to_string_lossy().to_string(),
        backup_path: backup.to_string_lossy().to_string(),
        uses_drive,
        drive_folder,
        has_conflict: false,
    })
}

#[command]
pub async fn reload_database<R: Runtime>(app: AppHandle<R>) -> Result<ReloadResult, String> {
    let db = db_path(&app);
    let drive = find_google_drive();
    let uses_drive = drive.is_some();

    if let Some(ref drive_root) = drive {
        let drive_db = drive_db_path(drive_root);
        if drive_db.exists() {
            ensure_parent(&db);
            copy_file(&drive_db, &db)?;
        }
    }

    Ok(ReloadResult {
        ok: true,
        db_path: db.to_string_lossy().to_string(),
        uses_drive,
    })
}

#[command]
pub async fn force_overwrite<R: Runtime>(app: AppHandle<R>) -> Result<ReloadResult, String> {
    let db = db_path(&app);
    let drive = find_google_drive();
    let uses_drive = drive.is_some();

    if let Some(ref drive_root) = drive {
        let drive_db = drive_db_path(drive_root);
        ensure_parent(&drive_db);
        copy_file(&db, &drive_db)?;

        let sync = drive_sync_path(drive_root);
        let _ = fs::write(&sync, "{}")
            .map_err(|e| e.to_string())
            .map(|_| ());
    }

    Ok(ReloadResult {
        ok: true,
        db_path: db.to_string_lossy().to_string(),
        uses_drive,
    })
}

#[command]
pub async fn sync_database<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let db = db_path(&app);
    let backup = backup_path();
    if db.exists() {
        ensure_parent(&backup);
        copy_file(&db, &backup)?;
    }

    if let Some(drive_root) = find_google_drive() {
        let drive_db = drive_db_path(&drive_root);
        if db.exists() {
            ensure_parent(&drive_db);
            copy_file(&db, &drive_db)?;
        }
    }

    Ok(())
}
