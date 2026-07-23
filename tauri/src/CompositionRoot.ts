import { TauriTransactionRepository } from "./data/TauriTransactionRepository";
import { TauriCategoryRepository } from "./data/TauriCategoryRepository";
import { TauriSettingsRepository } from "./data/TauriSettingsRepository";
import { TauriDbInfoRepository } from "./data/TauriDbInfoRepository";
import { TauriExcelRepository } from "./data/TauriExcelRepository";
import { TauriPersonRepository } from "./data/TauriPersonRepository";
import { TauriUpdateRepository } from "./data/TauriUpdateRepository";
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
  GetPersonsUseCase,
  CreatePersonUseCase,
  UpdatePersonUseCase,
  DeletePersonUseCase,
  CheckForUpdateUseCase,
  DownloadUpdateUseCase,
} from "./domain/usecases";

export class CompositionRoot {
  private static instance: CompositionRoot;

  private transactionRepository = new TauriTransactionRepository();
  private categoryRepository = new TauriCategoryRepository();
  private settingsRepository = new TauriSettingsRepository();
  private dbInfoRepository = new TauriDbInfoRepository();
  private excelRepository = new TauriExcelRepository();
  private personRepository = new TauriPersonRepository();
  private updateRepository = new TauriUpdateRepository();

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

  provideGetPersonsUseCase() {
    return new GetPersonsUseCase(this.personRepository);
  }

  provideCreatePersonUseCase() {
    return new CreatePersonUseCase(this.personRepository);
  }

  provideUpdatePersonUseCase() {
    return new UpdatePersonUseCase(this.personRepository);
  }

  provideDeletePersonUseCase() {
    return new DeletePersonUseCase(this.personRepository);
  }

  provideCheckForUpdateUseCase() {
    return new CheckForUpdateUseCase(this.updateRepository);
  }

  provideDownloadUpdateUseCase() {
    return new DownloadUpdateUseCase(this.updateRepository);
  }
}
