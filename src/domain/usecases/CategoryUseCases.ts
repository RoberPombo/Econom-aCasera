import type { Category } from "../entities";
import type { CategoryRepository } from "../repositories/CategoryRepository";

export class GetCategoriesUseCase {
  private readonly repository: CategoryRepository;

  constructor(repository: CategoryRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Category[]> {
    return this.repository.getAll();
  }
}

export class CreateCategoryUseCase {
  private readonly repository: CategoryRepository;

  constructor(repository: CategoryRepository) {
    this.repository = repository;
  }

  async execute(name: string, type: "income" | "expense"): Promise<Category> {
    return this.repository.create(name, type);
  }
}

export class UpdateCategoryUseCase {
  private readonly repository: CategoryRepository;

  constructor(repository: CategoryRepository) {
    this.repository = repository;
  }

  async execute(category: Category): Promise<void> {
    return this.repository.update(category);
  }
}

export class DeleteCategoryUseCase {
  private readonly repository: CategoryRepository;

  constructor(repository: CategoryRepository) {
    this.repository = repository;
  }

  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
