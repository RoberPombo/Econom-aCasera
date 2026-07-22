import type { Person } from "../../domain/entities";
import type { IPersonRepository } from "../../domain/repositories/IPersonRepository";
import type { SQLiteDatabase } from "../database/SQLiteDatabase";

export class SQLitePersonRepository implements IPersonRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  private get db() {
    return this.database.connection;
  }

  getAll(): Person[] {
    return this.db
      .query("SELECT id, name, active FROM persons ORDER BY name")
      .all() as Person[];
  }

  create(name: string): Person {
    const result = this.db.run("INSERT INTO persons (name, active) VALUES (?, 1)", [name]);
    return { id: Number(result.lastInsertRowid), name, active: 1 };
  }

  update(id: number, name: string, active: number): Person {
    this.db.run("UPDATE persons SET name = ?, active = ? WHERE id = ?", [name, active, id]);
    return { id, name, active };
  }

  delete(id: number): void {
    this.db.run("DELETE FROM persons WHERE id = ?", [id]);
  }
}
