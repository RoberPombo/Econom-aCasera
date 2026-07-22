import { existsSync, statSync, copyFileSync } from "fs";
import type { StorageLocation } from "../../infrastructure/storage/StorageLocator";
import { SyncTracker, ConflictError } from "../../infrastructure/sync/SyncTracker";

export class ConflictService {
  private tracker: SyncTracker;

  constructor(
    private storage: StorageLocation,
    tracker?: SyncTracker
  ) {
    this.tracker = tracker || new SyncTracker(storage.dbPath);
    this.tracker.init();
  }

  rebind(storage: StorageLocation, tracker: SyncTracker): void {
    this.storage = storage;
    this.tracker = tracker;
  }

  hasConflict(): boolean {
    return this.tracker.hasExternalChange();
  }

  check(): void {
    if (this.tracker.hasExternalChange()) {
      throw new ConflictError("Los datos han cambiado en otro dispositivo. Recarga o fuerza la sobrescritura.");
    }
  }

  afterWrite(): void {
    this.tracker.update();
    this.syncToBackup();
  }

  reload(): { dbPath: string; usesDrive: boolean } {
    this.tracker.refresh();
    return { dbPath: this.storage.dbPath, usesDrive: this.storage.usesDrive };
  }

  forceOverwrite(): { dbPath: string; usesDrive: boolean } {
    copyFileSync(this.storage.backupPath, this.storage.dbPath);
    this.tracker.refresh();
    return { dbPath: this.storage.dbPath, usesDrive: this.storage.usesDrive };
  }

  private syncToBackup(): void {
    if (existsSync(this.storage.dbPath)) {
      copyFileSync(this.storage.dbPath, this.storage.backupPath);
    }
  }
}
