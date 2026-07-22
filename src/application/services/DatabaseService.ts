import { existsSync, copyFileSync, statSync } from "fs";
import { StorageLocator, type StorageLocation } from "../../infrastructure/storage/StorageLocator";
import { SQLiteDatabase } from "../../infrastructure/database/SQLiteDatabase";
import { SyncTracker } from "../../infrastructure/sync/SyncTracker";

export class DatabaseService {
  private readonly locator = new StorageLocator();
  private storage: StorageLocation;
  private database: SQLiteDatabase;
  private tracker: SyncTracker;

  constructor() {
    this.storage = this.locator.locate();
    this.resolveDatabase();
    this.database = new SQLiteDatabase(this.storage.dbPath);
    this.tracker = new SyncTracker(this.storage.dbPath);
    this.tracker.init();
  }

  getDatabase(): SQLiteDatabase {
    return this.database;
  }

  getStorage(): StorageLocation {
    return this.storage;
  }

  getTracker(): SyncTracker {
    return this.tracker;
  }

  reload(): { dbPath: string; usesDrive: boolean } {
    this.database.close();
    this.resolveDatabase();
    this.database = new SQLiteDatabase(this.storage.dbPath);
    this.tracker = new SyncTracker(this.storage.dbPath);
    this.tracker.init();
    return { dbPath: this.storage.dbPath, usesDrive: this.storage.usesDrive };
  }

  private resolveDatabase(): void {
    if (this.storage.usesDrive) {
      const localExists = existsSync(this.storage.dbPath);
      const backupExists = existsSync(this.storage.backupPath);

      if (backupExists && localExists) {
        const localMtime = statSync(this.storage.dbPath).mtime.getTime();
        const backupMtime = statSync(this.storage.backupPath).mtime.getTime();
        if (backupMtime > localMtime) {
          copyFileSync(this.storage.backupPath, this.storage.dbPath);
          return;
        }
      }

      if (backupExists && !localExists) {
        copyFileSync(this.storage.backupPath, this.storage.dbPath);
      }
    } else {
      const localExists = existsSync(this.storage.dbPath);
      const backupExists = existsSync(this.storage.backupPath);

      if (backupExists && localExists) {
        const localMtime = statSync(this.storage.dbPath).mtime.getTime();
        const backupMtime = statSync(this.storage.backupPath).mtime.getTime();
        if (backupMtime > localMtime) {
          copyFileSync(this.storage.backupPath, this.storage.dbPath);
        }
      } else if (backupExists && !localExists) {
        copyFileSync(this.storage.backupPath, this.storage.dbPath);
      }
    }
  }
}
