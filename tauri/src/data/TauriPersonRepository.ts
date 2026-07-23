import { Person } from "../domain/entities";
import type { PersonRepository } from "../domain/repositories/PersonRepository";
import { getDatabase } from "./db";

export class TauriPersonRepository implements PersonRepository {
  async getAll(): Promise<Person[]> {
    const db = await getDatabase();
    const rows = await db.select<{ id: number; name: string; active: number }[]>(
      "SELECT * FROM persons ORDER BY name"
    );
    return rows.map((r) =>
      Person.create({ id: Number(r.id), name: r.name, active: Boolean(r.active) })
    );
  }

  async create(name: string): Promise<Person> {
    const db = await getDatabase();
    const result = await db.execute(
      "INSERT INTO persons (name, active) VALUES (?, 1)",
      [name.trim()]
    );
    return Person.create({ id: Number(result.lastInsertId), name, active: true });
  }

  async update(person: Person): Promise<void> {
    const db = await getDatabase();
    await db.execute(
      "UPDATE persons SET name = ?, active = ? WHERE id = ?",
      [person.name, person.active ? 1 : 0, person.id]
    );
  }

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.execute("DELETE FROM persons WHERE id = ?", [id]);
  }
}
