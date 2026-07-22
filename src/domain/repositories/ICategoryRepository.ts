import type { Category } from "../entities";

export interface ICategoryRepository {
  list(): Category[];
  create(name: string, type: "income" | "expense"): Category;
  update(id: number, name: string, type: "income" | "expense", active: number): void;
  delete(id: number): void;
}
