// Referencia del patrón de composición de dependencias (extracto de src/CompositionRoot.ts).
// El archivo real registra todos los repositorios y casos de uso de la aplicación.
// Aquí solo se incluyen las capacidades canónicas del template (categorías, personas y
// transacciones) para mostrar el patrón: singleton, repositorios Tauri privados y un
// método provide* por caso de uso.
import { TauriCategoryRepository } from "./data/TauriCategoryRepository";
import { TauriDbInfoRepository } from "./data/TauriDbInfoRepository";
import { TauriPersonRepository } from "./data/TauriPersonRepository";
import { TauriReceiptRepository } from "./data/TauriReceiptRepository";
import { TauriTransactionRepository } from "./data/TauriTransactionRepository";
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
  UpdateCategoryUseCase,
} from "./domain/usecases/CategoryUseCases";
import { CreateTransactionUseCase } from "./domain/usecases/CreateTransactionUseCase";
import {
  CreatePersonUseCase,
  DeletePersonUseCase,
  GetPersonsUseCase,
  UpdatePersonUseCase,
} from "./domain/usecases/PersonUseCases";

export class CompositionRoot {
  private static instance: CompositionRoot;

  private transactionRepository = new TauriTransactionRepository();
  private categoryRepository = new TauriCategoryRepository();
  private dbInfoRepository = new TauriDbInfoRepository();
  private personRepository = new TauriPersonRepository();
  private receiptRepository = new TauriReceiptRepository();

  private constructor() {}

  static getInstance(): CompositionRoot {
    if (!CompositionRoot.instance) {
      CompositionRoot.instance = new CompositionRoot();
    }
    return CompositionRoot.instance;
  }

  provideCreateTransactionUseCase() {
    return new CreateTransactionUseCase(
      this.transactionRepository,
      this.receiptRepository,
      this.dbInfoRepository,
    );
  }

  provideReceiptRepository() {
    return this.receiptRepository;
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
}
