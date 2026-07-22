import { existsSync, readFileSync, writeFileSync, statSync, copyFileSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getDbLocation } from "./utils";

interface SyncInfo {
  timestamp: number;
  deviceId: string;
}

const { dbPath } = getDbLocation();
const syncPath = dbPath + ".sync";
const deviceId = randomUUID();

let lastKnownTimestamp = 0;

export function initSyncTracking(): void {
  if (existsSync(syncPath)) {
    try {
      const info = JSON.parse(readFileSync(syncPath, "utf-8")) as SyncInfo;
      lastKnownTimestamp = info.timestamp || 0;
    } catch {
      lastKnownTimestamp = 0;
    }
  }
  if (lastKnownTimestamp === 0 && existsSync(dbPath)) {
    lastKnownTimestamp = statSync(dbPath).mtime.getTime();
  }
}

export function updateSyncTimestamp(): void {
  const now = Date.now();
  const info: SyncInfo = { timestamp: now, deviceId };
  writeFileSync(syncPath, JSON.stringify(info, null, 2));
  lastKnownTimestamp = now;
}

export function checkExternalChange(): boolean {
  if (!existsSync(syncPath)) {
    // Si no hay sync, usamos el mtime del archivo de BD
    if (!existsSync(dbPath)) return false;
    const currentMtime = statSync(dbPath).mtime.getTime();
    return currentMtime > lastKnownTimestamp + 1000; // tolerancia de 1s
  }

  try {
    const info = JSON.parse(readFileSync(syncPath, "utf-8")) as SyncInfo;
    if (info.deviceId === deviceId) return false;
    return info.timestamp > lastKnownTimestamp;
  } catch {
    return false;
  }
}

export function getLastKnownTimestamp(): number {
  return lastKnownTimestamp;
}

export function refreshLastKnownTimestamp(): void {
  if (existsSync(syncPath)) {
    try {
      const info = JSON.parse(readFileSync(syncPath, "utf-8")) as SyncInfo;
      lastKnownTimestamp = info.timestamp || 0;
    } catch {
      lastKnownTimestamp = 0;
    }
  }
  if (existsSync(dbPath)) {
    lastKnownTimestamp = Math.max(lastKnownTimestamp, statSync(dbPath).mtime.getTime());
  }
}

export function getSyncPaths(): { syncPath: string; dbPath: string } {
  return { syncPath, dbPath };
}

export function copyDatabase(source: string, target: string): void {
  copyFileSync(source, target);
}
