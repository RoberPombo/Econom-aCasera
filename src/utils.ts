import { homedir } from "os";
import path from "path";
import { mkdirSync, existsSync, statSync, copyFileSync, readdirSync } from "fs";

export function getAppName(): string {
  return "Gastos";
}

export function getLocalDataDir(): string {
  const platform = process.platform;
  let dir: string;

  if (platform === "win32") {
    dir = path.join(process.env.APPDATA || path.join(homedir(), "AppData", "Roaming"), getAppName());
  } else if (platform === "darwin") {
    dir = path.join(homedir(), "Library", "Application Support", getAppName());
  } else {
    dir = path.join(homedir(), ".local", "share", getAppName());
  }

  mkdirSync(dir, { recursive: true });
  return dir;
}

export function getLocalBackupDir(): string {
  const dir = path.join(homedir(), getAppName(), "backup");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function findGoogleDriveFolder(): string | null {
  const home = homedir();
  const candidates: string[] = [];

  if (process.platform === "win32") {
    candidates.push(
      path.join(home, "Google Drive"),
      path.join(home, "Drive", "Mi unidad"),
      path.join(home, "Drive", "My Drive"),
      path.join(home, "Drive"),
      path.join(process.env.USERPROFILE || home, "Google Drive"),
      path.join(process.env.USERPROFILE || home, "Drive")
    );
  } else if (process.platform === "darwin") {
    candidates.push(
      path.join(home, "Google Drive"),
      path.join(home, "Drive", "Mi unidad"),
      path.join(home, "Drive", "My Drive"),
      path.join(home, "Drive")
    );
  } else {
    candidates.push(
      path.join(home, "Google Drive"),
      path.join(home, "Drive", "Mi unidad"),
      path.join(home, "Drive", "My Drive"),
      path.join(home, "Drive")
    );
  }

  for (const folder of candidates) {
    if (existsSync(folder) && statSync(folder).isDirectory()) {
      // Verificar que parezca una carpeta de Drive buscando algún indicador
      if (looksLikeDriveFolder(folder)) {
        return folder;
      }
    }
  }

  return null;
}

function looksLikeDriveFolder(folder: string): boolean {
  try {
    const entries = readdirSync(folder);
    // Google Drive siempre tiene archivos/carpetas o al menos está vacío pero accesible
    // No hacemos comprobaciones estrictas para no falsear negativos
    return true;
  } catch {
    return false;
  }
}

export function getDbLocation(): {
  dbPath: string;
  backupPath: string;
  usesDrive: boolean;
  driveFolder: string | null;
} {
  const driveFolder = findGoogleDriveFolder();
  const localDataDir = getLocalDataDir();
  const localBackupDir = getLocalBackupDir();

  if (driveFolder) {
    const appFolder = path.join(driveFolder, getAppName());
    mkdirSync(appFolder, { recursive: true });
    const dbPath = path.join(appFolder, "gastos.db");
    const backupPath = path.join(localDataDir, "gastos_local_backup.db");
    return { dbPath, backupPath, usesDrive: true, driveFolder: appFolder };
  }

  const dbPath = path.join(localDataDir, "gastos.db");
  const backupPath = path.join(localBackupDir, "gastos_backup.db");
  return { dbPath, backupPath, usesDrive: false, driveFolder: null };
}

export function isPackaged(): boolean {
  return !process.argv[1]?.endsWith(".ts");
}

export function getStaticDir(): string {
  const baseDir = isPackaged() ? path.dirname(process.execPath) : process.cwd();
  return path.join(baseDir, "dist");
}

export function copyIfNewer(source: string, target: string): boolean {
  if (!existsSync(source)) return false;
  mkdirSync(path.dirname(target), { recursive: true });

  if (!existsSync(target)) {
    copyFileSync(source, target);
    return true;
  }

  const sourceStat = statSync(source);
  const targetStat = statSync(target);

  if (sourceStat.mtime > targetStat.mtime || sourceStat.size !== targetStat.size) {
    copyFileSync(source, target);
    return true;
  }

  return false;
}

export function getFileAgeMs(filePath: string): number {
  if (!existsSync(filePath)) return Infinity;
  return Date.now() - statSync(filePath).mtime.getTime();
}

export function getFileModTime(filePath: string): Date | null {
  if (!existsSync(filePath)) return null;
  return statSync(filePath).mtime;
}
