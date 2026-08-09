use std::fs;
use std::io::Cursor;
use std::path::{Path, PathBuf};
use calamine::Reader;
use tauri::{command, AppHandle, Manager, Runtime};

const APP_NAME: &str = "EconomiaCasera";
const DB_NAME: &str = "economiacasera.db";
const BACKUP_NAME: &str = "economiacasera_backup.db";
const RECEIPTS_DIR: &str = "receipts";
const MAX_RECEIPT_BYTES: usize = 10 * 1024 * 1024;

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

fn app_data_dir<R: Runtime>(app: &AppHandle<R>) -> PathBuf {
    app.path()
        .app_data_dir()
        .unwrap_or_else(|_| home_dir().join(APP_NAME))
}

fn db_path<R: Runtime>(app: &AppHandle<R>) -> PathBuf {
    app_data_dir(app).join(DB_NAME)
}

fn receipts_path<R: Runtime>(app: &AppHandle<R>) -> PathBuf {
    app_data_dir(app).join(RECEIPTS_DIR)
}

fn backup_path() -> PathBuf {
    home_dir().join(APP_NAME).join("backup").join(BACKUP_NAME)
}

fn backup_receipts_path() -> PathBuf {
    home_dir().join(APP_NAME).join("backup").join(RECEIPTS_DIR)
}

fn drive_db_path(drive_folder: &Path) -> PathBuf {
    drive_folder.join(APP_NAME).join(DB_NAME)
}

fn drive_receipts_path(drive_folder: &Path) -> PathBuf {
    drive_folder.join(APP_NAME).join(RECEIPTS_DIR)
}

fn drive_sync_path(drive_folder: &Path) -> PathBuf {
    drive_folder.join(APP_NAME).join("sync.json")
}

fn ensure_parent(path: &Path) {
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
}

fn ensure_dir(path: &Path) {
    let _ = fs::create_dir_all(path);
}

fn file_mtime(path: &Path) -> Option<u64> {
    fs::metadata(path)
        .ok()
        .and_then(|m| m.modified().ok())
        .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
        .map(|d| d.as_secs())
}

fn copy_file(source: &Path, target: &Path) -> Result<(), String> {
    ensure_parent(target);
    fs::copy(source, target)
        .map(|_| ())
        .map_err(|e| e.to_string())
}

fn copy_dir_contents(source: &Path, target: &Path) -> Result<(), String> {
    if !source.is_dir() {
        return Ok(());
    }
    ensure_dir(target);
    for entry in fs::read_dir(source).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let dest = target.join(entry.file_name());
        if path.is_dir() {
            copy_dir_contents(&path, &dest)?;
        } else {
            copy_file(&path, &dest)?;
        }
    }
    Ok(())
}

fn normalize_extension(extension: &str) -> Result<String, String> {
    let ext = extension.trim().trim_start_matches('.').to_lowercase();
    match ext.as_str() {
        "jpg" | "jpeg" | "png" | "webp" => Ok(if ext == "jpeg" {
            "jpg".to_string()
        } else {
            ext
        }),
        _ => Err("Formato de imagen no soportado".to_string()),
    }
}

fn sanitize_relative_receipt_path(relative_path: &str) -> Result<PathBuf, String> {
    let trimmed = relative_path.trim().replace('\\', "/");
    if trimmed.is_empty()
        || trimmed.contains("..")
        || Path::new(&trimmed).is_absolute()
        || !trimmed.starts_with("receipts/")
    {
        return Err("Ruta de ticket no válida".to_string());
    }
    Ok(PathBuf::from(trimmed))
}

fn mime_for_extension(ext: &str) -> &'static str {
    match ext {
        "png" => "image/png",
        "webp" => "image/webp",
        _ => "image/jpeg",
    }
}

fn sync_receipts_from_local<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let local = receipts_path(app);
    let backup = backup_receipts_path();
    if local.is_dir() {
        copy_dir_contents(&local, &backup)?;
    }

    if let Some(drive_root) = find_google_drive() {
        let drive_receipts = drive_receipts_path(&drive_root);
        if local.is_dir() {
            copy_dir_contents(&local, &drive_receipts)?;
        }
    }

    Ok(())
}

fn sync_receipts_from_drive_to_local<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    if let Some(drive_root) = find_google_drive() {
        let drive_receipts = drive_receipts_path(&drive_root);
        let local = receipts_path(app);
        if drive_receipts.is_dir() {
            copy_dir_contents(&drive_receipts, &local)?;
        }
    }
    Ok(())
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
            let _ = copy_dir_contents(&drive_receipts_path(drive_root), &backup_receipts_path());
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
        sync_receipts_from_drive_to_local(&app)?;
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
        copy_dir_contents(&receipts_path(&app), &drive_receipts_path(drive_root))?;

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

    sync_receipts_from_local(&app)?;
    Ok(())
}

#[command]
pub async fn save_receipt<R: Runtime>(
    app: AppHandle<R>,
    transaction_id: i64,
    bytes: Vec<u8>,
    extension: String,
) -> Result<String, String> {
    if bytes.is_empty() {
        return Err("La imagen está vacía".to_string());
    }
    if bytes.len() > MAX_RECEIPT_BYTES {
        return Err("La imagen supera el tamaño máximo de 10 MB".to_string());
    }

    let ext = normalize_extension(&extension)?;
    let relative = format!("receipts/{}.{}", transaction_id, ext);
    let absolute = app_data_dir(&app).join(&relative);
    ensure_parent(&absolute);

    // Remove previous receipt files for this transaction (any extension).
    let dir = receipts_path(&app);
    if dir.is_dir() {
        let prefix = format!("{}.", transaction_id);
        if let Ok(entries) = fs::read_dir(&dir) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with(&prefix) {
                    let _ = fs::remove_file(entry.path());
                }
            }
        }
    }

    fs::write(&absolute, &bytes).map_err(|e| e.to_string())?;
    Ok(relative.replace('\\', "/"))
}

#[command]
pub async fn read_receipt<R: Runtime>(
    app: AppHandle<R>,
    relative_path: String,
) -> Result<String, String> {
    let relative = sanitize_relative_receipt_path(&relative_path)?;
    let absolute = app_data_dir(&app).join(&relative);
    if !absolute.exists() {
        return Err("No se encontró la foto del ticket".to_string());
    }

    let bytes = fs::read(&absolute).map_err(|e| e.to_string())?;
    let ext = absolute
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("jpg")
        .to_lowercase();
    let mime = mime_for_extension(&ext);
    let encoded = base64_encode(&bytes);
    Ok(format!("data:{};base64,{}", mime, encoded))
}

#[command]
pub async fn delete_receipt<R: Runtime>(
    app: AppHandle<R>,
    relative_path: String,
) -> Result<(), String> {
    let relative = sanitize_relative_receipt_path(&relative_path)?;
    let absolute = app_data_dir(&app).join(&relative);
    if absolute.exists() {
        fs::remove_file(&absolute).map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn base64_encode(bytes: &[u8]) -> String {
    const TABLE: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::with_capacity((bytes.len() + 2) / 3 * 4);
    for chunk in bytes.chunks(3) {
        let b0 = chunk[0] as u32;
        let b1 = if chunk.len() > 1 { chunk[1] as u32 } else { 0 };
        let b2 = if chunk.len() > 2 { chunk[2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(TABLE[((triple >> 18) & 0x3F) as usize] as char);
        out.push(TABLE[((triple >> 12) & 0x3F) as usize] as char);
        if chunk.len() > 1 {
            out.push(TABLE[((triple >> 6) & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
        if chunk.len() > 2 {
            out.push(TABLE[(triple & 0x3F) as usize] as char);
        } else {
            out.push('=');
        }
    }
    out
}

#[command]
pub async fn read_excel_cells(file_bytes: Vec<u8>) -> Result<Vec<Vec<serde_json::Value>>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut workbook = calamine::open_workbook_auto_from_rs(Cursor::new(file_bytes))
            .map_err(|e| format!("El archivo no es un Excel válido: {e}"))?;
        let sheet_name = workbook
            .sheet_names()
            .first()
            .cloned()
            .ok_or_else(|| "El Excel no contiene hojas".to_string())?;
        let range = workbook
            .worksheet_range(&sheet_name)
            .map_err(|e| e.to_string())?;
        let mut rows = Vec::with_capacity(range.rows().len());
        for row in range.rows() {
            let cells: Vec<serde_json::Value> = row
                .iter()
                .map(|cell| match cell {
                    calamine::Data::Empty => serde_json::Value::Null,
                    calamine::Data::Int(i) => serde_json::Value::from(*i),
                    calamine::Data::Float(f) => serde_json::json!(f),
                    calamine::Data::String(s) => serde_json::Value::from(s.as_str()),
                    calamine::Data::Bool(b) => serde_json::Value::from(*b),
                    calamine::Data::DateTime(dt) => {
                        let (y, m, d, _, _, _, _) = dt.to_ymd_hms_milli();
                        serde_json::Value::from(format!("{y:04}-{m:02}-{d:02}"))
                    }
                    calamine::Data::DateTimeIso(s) => serde_json::Value::from(s.to_string()),
                    calamine::Data::DurationIso(s) => serde_json::Value::from(s.to_string()),
                    calamine::Data::Error(_) => serde_json::Value::Null,
                })
                .collect();
            rows.push(cells);
        }
        Ok(rows)
    })
    .await
    .map_err(|e| e.to_string())?
}
