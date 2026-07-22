import type { Category } from "../../domain/entities";
import type { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import type { SQLiteDatabase } from "../database/SQLiteDatabase";

export class SQLiteCategoryRepository implements ICategoryRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  private get db() {
    return this.database.connection;
  }

  list(): Category[] {
    return this.db
      .query("SELECT id, name, type, active FROM categories ORDER BY type, name")
      .all() as Category[];
  }

  create(name: string, type: "income" | "expense"): Category {
    const result = this.db.run("INSERT INTO categories (name, type, active) VALUES (?, ?, 1)", [name, type]);
    return { id: Number(result.lastInsertRowid), name, type, active: 1 };
  }

  update(id: number, name: string, type: "income" | "expense", active: number): void {
    this.db.run("UPDATE categories SET name = ?, type = ?, active = ? WHERE id = ?", [name, type, active, id]);
  }

  delete(id: number): void {
    this.db.run("DELETE FROM categories WHERE id = ?", [id]);
  }
}
