import { homedir } from "os";
import path from "path";
import { mkdirSync, existsSync, statSync, readdirSync } from "fs";

const APP_NAME = "Gastos";

export interface StorageLocation {
  dbPath: string;
  backupPath: string;
  usesDrive: boolean;
  driveFolder: string | null;
}

export class StorageLocator {
  locate(): StorageLocation {
    const driveFolder = this.findGoogleDriveFolder();
    const localDataDir = this.getLocalDataDir();

    if (driveFolder) {
      const appFolder = path.join(driveFolder, APP_NAME);
      mkdirSync(appFolder, { recursive: true });
      const dbPath = path.join(appFolder, "gastos.db");
      const backupPath = path.join(localDataDir, "gastos_local_backup.db");
      return { dbPath, backupPath, usesDrive: true, driveFolder: appFolder };
    }

    const dbPath = path.join(localDataDir, "gastos.db");
    const backupPath = path.join(this.getLocalBackupDir(), "gastos_backup.db");
    return { dbPath, backupPath, usesDrive: false, driveFolder: null };
  }

  private getLocalDataDir(): string {
    const platform = process.platform;
    let dir: string;

    if (platform === "win32") {
      dir = path.join(process.env.APPDATA || path.join(homedir(), "AppData", "Roaming"), APP_NAME);
    } else if (platform === "darwin") {
      dir = path.join(homedir(), "Library", "Application Support", APP_NAME);
    } else {
      dir = path.join(homedir(), ".local", "share", APP_NAME);
    }

    mkdirSync(dir, { recursive: true });
    return dir;
  }

  private getLocalBackupDir(): string {
    const dir = path.join(homedir(), APP_NAME, "backup");
    mkdirSync(dir, { recursive: true });
    return dir;
  }

  private findGoogleDriveFolder(): string | null {
    const home = homedir();
    const candidates: string[] = [
      path.join(home, "Google Drive"),
      path.join(home, "Drive", "Mi unidad"),
      path.join(home, "Drive", "My Drive"),
      path.join(home, "Drive"),
    ];

    for (const folder of candidates) {
      if (existsSync(folder) && statSync(folder).isDirectory()) {
        return folder;
      }
    }

    return null;
  }

  getStaticDir(): string {
    const isPackaged = !process.argv[1]?.endsWith(".ts");
    const baseDir = isPackaged ? path.dirname(process.execPath) : process.cwd();
    return path.join(baseDir, "dist");
  }
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

export function getFileModTime(filePath: string): Date | null {
  if (!existsSync(filePath)) return null;
  return statSync(filePath).mtime;
}

export function exists(filePath: string): boolean {
  return existsSync(filePath);
}

function copyFileSync(source: string, target: string) {
  const content = require("fs").readFileSync(source);
  require("fs").writeFileSync(target, content);
}
