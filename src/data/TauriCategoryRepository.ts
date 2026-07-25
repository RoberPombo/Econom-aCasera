import { Category } from "../domain/entities";
import type { CategoryRepository } from "../domain/repositories/CategoryRepository";
import { getDatabase } from "./db";

export class TauriCategoryRepository implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    const db = await getDatabase();
    const rows = await db.select<{ id: number; name: string; type: string; active: number }[]>(
      "SELECT * FROM categories ORDER BY type, name"
    );
    return rows.map((r) =>
      Category.create({ id: Number(r.id), name: r.name, type: r.type as "income" | "expense", active: Boolean(r.active) })
    );
  }

  async create(name: string, type: "income" | "expense"): Promise<Category> {
    const db = await getDatabase();
    const result = await db.execute(
      "INSERT INTO categories (name, type, active) VALUES (?, ?, 1)",
      [name.trim(), type]
    );
    return Category.create({ id: Number(result.lastInsertId), name, type, active: true });
  }

  async update(category: Category): Promise<void> {
    const db = await getDatabase();
    await db.execute(
      "UPDATE categories SET name = ?, type = ?, active = ? WHERE id = ?",
      [category.name, category.type, category.active ? 1 : 0, category.id]
    );
  }

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.execute("DELETE FROM categories WHERE id = ?", [id]);
  }
}
