import { DatabaseService } from "./services/DatabaseService";
import { ConflictService } from "./services/ConflictService";
import { SQLiteTransactionRepository } from "../infrastructure/repositories/SQLiteTransactionRepository";
import { SQLiteCategoryRepository } from "../infrastructure/repositories/SQLiteCategoryRepository";
import { SQLiteSettingsRepository } from "../infrastructure/repositories/SQLiteSettingsRepository";
import {
  TransactionUseCases,
  CategoryUseCases,
  SettingsUseCases,
} from "../domain";

export class AppContainer {
  private readonly databaseService = new DatabaseService();
  private readonly conflictService: ConflictService;

  readonly transactionUseCases: TransactionUseCases;
  readonly categoryUseCases: CategoryUseCases;
  readonly settingsUseCases: SettingsUseCases;

  constructor() {
    const db = this.databaseService.getDatabase();
    const storage = this.databaseService.getStorage();
    const tracker = this.databaseService.getTracker();

    this.conflictService = new ConflictService(storage, tracker);

    const transactionRepo = new SQLiteTransactionRepository(db);
    const categoryRepo = new SQLiteCategoryRepository(db);
    const settingsRepo = new SQLiteSettingsRepository(db);

    this.transactionUseCases = new TransactionUseCases(transactionRepo);
    this.categoryUseCases = new CategoryUseCases(categoryRepo);
    this.settingsUseCases = new SettingsUseCases(settingsRepo);
  }

  getDbInfo() {
    return {
      ...this.databaseService.getStorage(),
      hasConflict: this.conflictService.hasConflict(),
    };
  }

  checkConflict(): void {
    this.conflictService.check();
  }

  afterWrite(): void {
    this.conflictService.afterWrite();
  }

  reloadDatabase(): { dbPath: string; usesDrive: boolean } {
    const result = this.databaseService.reload();
    const storage = this.databaseService.getStorage();
    const tracker = this.databaseService.getTracker();
    this.conflictService.rebind(storage, tracker);
    return result;
  }

  forceOverwrite(): { dbPath: string; usesDrive: boolean } {
    return this.conflictService.forceOverwrite();
  }
}
