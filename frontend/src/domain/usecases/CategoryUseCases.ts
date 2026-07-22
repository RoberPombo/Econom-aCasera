import { Category } from "../entities";
import type { CategoryRepository } from "../repositories/CategoryRepository";

export class GetCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    return this.repository.getAll();
  }
}

export class CreateCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(name: string, type: "income" | "expense"): Promise<Category> {
    return this.repository.create(name, type);
  }
}

export class UpdateCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(category: Category): Promise<void> {
    return this.repository.update(category);
  }
}

export class DeleteCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
