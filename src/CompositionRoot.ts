import { TauriTransactionRepository } from "./data/TauriTransactionRepository";
import { TauriCategoryRepository } from "./data/TauriCategoryRepository";
import { TauriSettingsRepository } from "./data/TauriSettingsRepository";
import { TauriDbInfoRepository } from "./data/TauriDbInfoRepository";
import { TauriImportRepository } from "./data/TauriImportRepository";
import { TauriPersonRepository } from "./data/TauriPersonRepository";
import { TauriUpdateRepository } from "./data/TauriUpdateRepository";
import { TauriReceiptRepository } from "./data/TauriReceiptRepository";
import {
  GetTransactionsUseCase,
  GetTransactionsByDateUseCase,
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
  PreviewImportUseCase,
  ConfirmImportUseCase,
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
  private importRepository = new TauriImportRepository();
  private personRepository = new TauriPersonRepository();
  private updateRepository = new TauriUpdateRepository();
  private receiptRepository = new TauriReceiptRepository();

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

  provideGetTransactionsByDateUseCase() {
    return new GetTransactionsByDateUseCase(this.transactionRepository);
  }

  provideCreateTransactionUseCase() {
    return new CreateTransactionUseCase(
      this.transactionRepository,
      this.receiptRepository,
      this.dbInfoRepository
    );
  }

  provideUpdateTransactionUseCase() {
    return new UpdateTransactionUseCase(
      this.transactionRepository,
      this.receiptRepository,
      this.dbInfoRepository
    );
  }

  provideDeleteTransactionUseCase() {
    return new DeleteTransactionUseCase(
      this.transactionRepository,
      this.receiptRepository,
      this.dbInfoRepository
    );
  }

  provideReceiptRepository() {
    return this.receiptRepository;
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

  providePreviewImportUseCase() {
    return new PreviewImportUseCase(this.importRepository);
  }

  provideConfirmImportUseCase() {
    return new ConfirmImportUseCase(this.importRepository);
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
