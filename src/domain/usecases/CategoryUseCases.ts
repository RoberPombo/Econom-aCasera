import type { Category } from "../entities";
import type { ICategoryRepository } from "../repositories/ICategoryRepository";

export class CategoryUseCases {
  constructor(private readonly repository: ICategoryRepository) {}

  list(): Category[] {
    return this.repository.list();
  }

  create(name: string, type: "income" | "expense"): Category {
    return this.repository.create(name, type);
  }

  update(id: number, name: string, type: "income" | "expense", active: number): void {
    this.repository.update(id, name, type, active);
  }

  delete(id: number): void {
    this.repository.delete(id);
  }
}
