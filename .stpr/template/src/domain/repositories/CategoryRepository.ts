import type { Category } from "../entities/Category";

export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  create(label: string, type: "income" | "expense"): Promise<Category>;
  update(category: Category): Promise<void>;
  delete(id: number): Promise<void>;
}
