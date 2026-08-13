import { Person } from "../domain/entities/Person";
import type { PersonRepository } from "../domain/repositories/PersonRepository";
import { getDatabase } from "./db";

export class TauriPersonRepository implements PersonRepository {
  async getAll(): Promise<Person[]> {
    const db = await getDatabase();
    const rows = await db.select<
      { id: number; label: string; key: string; active: number }[]
    >("SELECT * FROM persons ORDER BY label");
    return rows.map((r) =>
      Person.create({
        id: Number(r.id),
        label: r.label,
        key: r.key,
        active: Boolean(r.active),
      }),
    );
  }

  async create(label: string): Promise<Person> {
    const db = await getDatabase();
    const person = Person.create({ label });
    const result = await db.execute(
      "INSERT INTO persons (label, key, active) VALUES (?, ?, 1)",
      [person.label, person.key],
    );
    return Person.create({
      id: Number(result.lastInsertId),
      label,
      key: person.key,
      active: true,
    });
  }

  async update(person: Person): Promise<void> {
    const db = await getDatabase();
    await db.execute(
      "UPDATE persons SET label = ?, key = ?, active = ? WHERE id = ?",
      [person.label, person.key, person.active ? 1 : 0, person.id],
    );
  }

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.execute("DELETE FROM persons WHERE id = ?", [id]);
  }
}
