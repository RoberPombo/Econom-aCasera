import type { CompositionRoot } from "../../CompositionRoot";
import type {
  Category,
  Person,
  Settings,
  Transaction,
} from "../../domain/entities";
import type { UpdateInfo } from "../../domain/repositories/UpdateRepository";
import {
  CheckForUpdateUseCase,
  ConfirmImportUseCase,
  CreateCategoryUseCase,
  CreatePersonUseCase,
  CreateTransactionUseCase,
  DeleteCategoryUseCase,
  DeletePersonUseCase,
  DeleteTransactionUseCase,
  DownloadUpdateUseCase,
  ForceOverwriteUseCase,
  GetCategoriesUseCase,
  GetDbInfoUseCase,
  GetPersonsUseCase,
  GetSettingsUseCase,
  GetSummaryUseCase,
  GetTransactionsByDateUseCase,
  GetTransactionsUseCase,
  PreviewImportUseCase,
  ReloadDatabaseUseCase,
  UpdateCategoryUseCase,
  UpdatePersonUseCase,
  UpdateSettingsUseCase,
  UpdateTransactionUseCase,
} from "../../domain/usecases";
import {
  FakeImportRepository,
  FakeUpdateRepository,
  InMemoryCategoryRepository,
  InMemoryDbInfoRepository,
  InMemoryPersonRepository,
  InMemoryReceiptRepository,
  InMemorySettingsRepository,
  InMemoryTransactionRepository,
} from "./repositories";

export interface FakeCompositionRootOptions {
  transactions?: Transaction[];
  categories?: Category[];
  persons?: Person[];
  settings?: Settings;
  updateInfo?: UpdateInfo | null;
  hasDbConflict?: boolean;
}

export class FakeCompositionRoot {
  readonly transactions: InMemoryTransactionRepository;
  readonly categories: InMemoryCategoryRepository;
  readonly persons: InMemoryPersonRepository;
  readonly settings: InMemorySettingsRepository;
  readonly dbInfo: InMemoryDbInfoRepository;
  readonly receipts: InMemoryReceiptRepository;
  readonly updates: FakeUpdateRepository;
  readonly imports: FakeImportRepository;

  categoriesError: Error | null = null;
  transactionsError: Error | null = null;

  constructor(options: FakeCompositionRootOptions = {}) {
    this.transactions = new InMemoryTransactionRepository(options.transactions);
    this.categories = new InMemoryCategoryRepository(options.categories);
    this.persons = new InMemoryPersonRepository(options.persons);
    this.settings = new InMemorySettingsRepository(options.settings);
    this.dbInfo = new InMemoryDbInfoRepository({
      hasConflict: options.hasDbConflict,
    });
    this.receipts = new InMemoryReceiptRepository();
    this.updates = new FakeUpdateRepository(options.updateInfo ?? null);
    this.imports = new FakeImportRepository();
  }

  provideGetTransactionsUseCase() {
    if (this.transactionsError) {
      return {
        execute: () => Promise.reject(this.transactionsError),
      };
    }
    return new GetTransactionsUseCase(this.transactions);
  }

  provideGetTransactionsByDateUseCase() {
    return new GetTransactionsByDateUseCase(this.transactions);
  }

  provideCreateTransactionUseCase() {
    return new CreateTransactionUseCase(
      this.transactions,
      this.receipts,
      this.dbInfo,
    );
  }

  provideUpdateTransactionUseCase() {
    return new UpdateTransactionUseCase(
      this.transactions,
      this.receipts,
      this.dbInfo,
    );
  }

  provideDeleteTransactionUseCase() {
    return new DeleteTransactionUseCase(
      this.transactions,
      this.receipts,
      this.dbInfo,
    );
  }

  provideReceiptRepository() {
    return this.receipts;
  }

  provideGetSummaryUseCase() {
    return new GetSummaryUseCase(this.transactions);
  }

  provideGetCategoriesUseCase() {
    if (this.categoriesError) {
      return {
        execute: async () => Promise.reject(this.categoriesError),
      };
    }
    return new GetCategoriesUseCase(this.categories);
  }

  provideCreateCategoryUseCase() {
    return new CreateCategoryUseCase(this.categories);
  }

  provideUpdateCategoryUseCase() {
    return new UpdateCategoryUseCase(this.categories);
  }

  provideDeleteCategoryUseCase() {
    return new DeleteCategoryUseCase(this.categories);
  }

  provideGetSettingsUseCase() {
    return new GetSettingsUseCase(this.settings);
  }

  provideUpdateSettingsUseCase() {
    return new UpdateSettingsUseCase(this.settings);
  }

  provideUpdateThemeUseCase() {
    return new UpdateSettingsUseCase(this.settings);
  }

  provideGetDbInfoUseCase() {
    return new GetDbInfoUseCase(this.dbInfo);
  }

  provideReloadDatabaseUseCase() {
    return new ReloadDatabaseUseCase(this.dbInfo);
  }

  provideForceOverwriteUseCase() {
    return new ForceOverwriteUseCase(this.dbInfo);
  }

  providePreviewImportUseCase() {
    return new PreviewImportUseCase(this.imports);
  }

  provideConfirmImportUseCase() {
    return new ConfirmImportUseCase(this.imports);
  }

  provideGetPersonsUseCase() {
    return new GetPersonsUseCase(this.persons);
  }

  provideCreatePersonUseCase() {
    return new CreatePersonUseCase(this.persons);
  }

  provideUpdatePersonUseCase() {
    return new UpdatePersonUseCase(this.persons);
  }

  provideDeletePersonUseCase() {
    return new DeletePersonUseCase(this.persons);
  }

  provideCheckForUpdateUseCase() {
    return new CheckForUpdateUseCase(this.updates);
  }

  provideDownloadUpdateUseCase() {
    return new DownloadUpdateUseCase(this.updates);
  }

  asCompositionRoot(): CompositionRoot {
    return this as unknown as CompositionRoot;
  }
}
