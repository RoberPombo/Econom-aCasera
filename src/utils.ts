import { homedir } from "os";
import path from "path";
import { mkdirSync } from "fs";

export function getAppDataDir(): string {
  if (process.env.APP_DATA_DIR) return process.env.APP_DATA_DIR;

  const platform = process.platform;
  let dir: string;

  if (platform === "win32") {
    dir = path.join(process.env.APPDATA || path.join(homedir(), "AppData", "Roaming"), "Gastos");
  } else if (platform === "darwin") {
    dir = path.join(homedir(), "Library", "Application Support", "Gastos");
  } else {
    dir = path.join(homedir(), ".local", "share", "Gastos");
  }

  mkdirSync(dir, { recursive: true });
  return dir;
}

export function isPackaged(): boolean {
  return !process.argv[1]?.endsWith(".ts");
}

export function getStaticDir(): string {
  const baseDir = isPackaged() ? path.dirname(process.execPath) : process.cwd();
  return path.join(baseDir, "dist");
}
