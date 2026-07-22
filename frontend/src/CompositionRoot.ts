import { ApiTransactionRepository } from "./data/ApiTransactionRepository";
import { ApiCategoryRepository } from "./data/ApiCategoryRepository";
import { ApiSettingsRepository } from "./data/ApiSettingsRepository";
import { ApiDbInfoRepository } from "./data/ApiDbInfoRepository";
import { ApiExcelRepository } from "./data/ApiExcelRepository";
import {
  GetTransactionsUseCase,
  CreateTransactionUseCase,
  UpdateTransactionUseCase,
  DeleteTransactionUseCase,
  GetSummaryUseCase,
  GetCategoriesUseCase,
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  GetSettingsUseCase,
  UpdateSettingsUseCase,
  GetDbInfoUseCase,
  ReloadDatabaseUseCase,
  ForceOverwriteUseCase,
  ImportExcelUseCase,
} from "./domain/usecases";

export class CompositionRoot {
  private static instance: CompositionRoot;

  private transactionRepository = new ApiTransactionRepository();
  private categoryRepository = new ApiCategoryRepository();
  private settingsRepository = new ApiSettingsRepository();
  private dbInfoRepository = new ApiDbInfoRepository();
  private excelRepository = new ApiExcelRepository();

  private constructor() {}

  static getInstance(): CompositionRoot {
    if (!CompositionRoot.instance) {
      CompositionRoot.instance = new CompositionRoot();
    }
    return CompositionRoot.instance;
  }

  provideGetTransactionsUseCase() {
    return new GetTransactionsUseCase(this.transactionRepository);
  }

  provideCreateTransactionUseCase() {
    return new CreateTransactionUseCase(this.transactionRepository);
  }

  provideUpdateTransactionUseCase() {
    return new UpdateTransactionUseCase(this.transactionRepository);
  }

  provideDeleteTransactionUseCase() {
    return new DeleteTransactionUseCase(this.transactionRepository);
  }

  provideGetSummaryUseCase() {
    return new GetSummaryUseCase(this.transactionRepository);
  }

  provideGetCategoriesUseCase() {
    return new GetCategoriesUseCase(this.categoryRepository);
  }

  provideCreateCategoryUseCase() {
    return new CreateCategoryUseCase(this.categoryRepository);
  }

  provideUpdateCategoryUseCase() {
    return new UpdateCategoryUseCase(this.categoryRepository);
  }

  provideDeleteCategoryUseCase() {
    return new DeleteCategoryUseCase(this.categoryRepository);
  }

  provideGetSettingsUseCase() {
    return new GetSettingsUseCase(this.settingsRepository);
  }

  provideUpdateSettingsUseCase() {
    return new UpdateSettingsUseCase(this.settingsRepository);
  }

  provideUpdateThemeUseCase() {
    return new UpdateSettingsUseCase(this.settingsRepository);
  }

  provideGetDbInfoUseCase() {
    return new GetDbInfoUseCase(this.dbInfoRepository);
  }

  provideReloadDatabaseUseCase() {
    return new ReloadDatabaseUseCase(this.dbInfoRepository);
  }

  provideForceOverwriteUseCase() {
    return new ForceOverwriteUseCase(this.dbInfoRepository);
  }

  provideImportExcelUseCase() {
    return new ImportExcelUseCase(this.excelRepository);
  }
}
