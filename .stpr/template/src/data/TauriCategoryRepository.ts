import { Category } from "../domain/entities/Category";
import type { CategoryRepository } from "../domain/repositories/CategoryRepository";
import { getDatabase } from "./db";

export class TauriCategoryRepository implements CategoryRepository {
  async getAll(): Promise<Category[]> {
    const db = await getDatabase();
    const rows = await db.select<
      { id: number; label: string; key: string; type: string; active: number }[]
    >("SELECT * FROM categories ORDER BY type, label");
    return rows.map((r) =>
      Category.create({
        id: Number(r.id),
        label: r.label,
        key: r.key,
        type: r.type as "income" | "expense",
        active: Boolean(r.active),
      }),
    );
  }

  async create(label: string, type: "income" | "expense"): Promise<Category> {
    const db = await getDatabase();
    const category = Category.create({ label, type });
    const result = await db.execute(
      "INSERT INTO categories (label, key, type, active) VALUES (?, ?, ?, 1)",
      [category.label, category.key, type],
    );
    return Category.create({
      id: Number(result.lastInsertId),
      label,
      key: category.key,
      type,
      active: true,
    });
  }

  async update(category: Category): Promise<void> {
    const db = await getDatabase();
    await db.execute(
      "UPDATE categories SET label = ?, key = ?, type = ?, active = ? WHERE id = ?",
      [
        category.label,
        category.key,
        category.type,
        category.active ? 1 : 0,
        category.id,
      ],
    );
  }

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.execute("DELETE FROM categories WHERE id = ?", [id]);
  }
}
