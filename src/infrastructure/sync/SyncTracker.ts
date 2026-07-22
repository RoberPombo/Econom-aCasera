import { existsSync, readFileSync, writeFileSync, statSync, copyFileSync } from "fs";
import { randomUUID } from "crypto";

interface SyncInfo {
  timestamp: number;
  deviceId: string;
}

export class SyncTracker {
  private readonly deviceId = randomUUID();
  private lastKnownTimestamp = 0;

  constructor(private readonly dbPath: string) {}

  get syncPath(): string {
    return this.dbPath + ".sync";
  }

  init(): void {
    if (existsSync(this.syncPath)) {
      try {
        const info = JSON.parse(readFileSync(this.syncPath, "utf-8")) as SyncInfo;
        this.lastKnownTimestamp = info.timestamp || 0;
      } catch {
        this.lastKnownTimestamp = 0;
      }
    }
    if (this.lastKnownTimestamp === 0 && existsSync(this.dbPath)) {
      this.lastKnownTimestamp = statSync(this.dbPath).mtime.getTime();
    }
  }

  update(): void {
    const now = Date.now();
    const info: SyncInfo = { timestamp: now, deviceId: this.deviceId };
    writeFileSync(this.syncPath, JSON.stringify(info, null, 2));
    this.lastKnownTimestamp = now;
  }

  hasExternalChange(): boolean {
    if (!existsSync(this.syncPath)) {
      if (!existsSync(this.dbPath)) return false;
      const currentMtime = statSync(this.dbPath).mtime.getTime();
      return currentMtime > this.lastKnownTimestamp + 1000;
    }

    try {
      const info = JSON.parse(readFileSync(this.syncPath, "utf-8")) as SyncInfo;
      if (info.deviceId === this.deviceId) return false;
      return info.timestamp > this.lastKnownTimestamp;
    } catch {
      return false;
    }
  }

  refresh(): void {
    if (existsSync(this.syncPath)) {
      try {
        const info = JSON.parse(readFileSync(this.syncPath, "utf-8")) as SyncInfo;
        this.lastKnownTimestamp = info.timestamp || 0;
      } catch {
        this.lastKnownTimestamp = 0;
      }
    }
    if (existsSync(this.dbPath)) {
      this.lastKnownTimestamp = Math.max(this.lastKnownTimestamp, statSync(this.dbPath).mtime.getTime());
    }
  }

  copyDatabase(source: string, target: string): void {
    copyFileSync(source, target);
  }
}

export class ConflictError extends Error {
  constructor(message = "Conflict detected") {
    super(message);
    this.name = "ConflictError";
  }
}
