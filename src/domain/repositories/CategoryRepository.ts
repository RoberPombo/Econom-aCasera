import type { Category } from "../entities";

export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  create(name: string, type: "income" | "expense"): Promise<Category>;
  update(category: Category): Promise<void>;
  delete(id: number): Promise<void>;
}
