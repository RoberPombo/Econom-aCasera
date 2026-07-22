import { Person } from "../domain/entities";
import type { PersonRepository } from "../domain/repositories/PersonRepository";

export class ApiPersonRepository implements PersonRepository {
  private async api<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json();
  }

  async getAll(): Promise<Person[]> {
    const data = await this.api<Person[]>("/persons");
    return data.map((p) => Person.create({ ...p, id: Number(p.id), active: Boolean(p.active) }));
  }

  async create(name: string): Promise<Person> {
    const created = await this.api<Person>("/persons", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    return Person.create({ ...created, id: Number(created.id), active: Boolean(created.active) });
  }

  async update(person: Person): Promise<void> {
    await this.api(`/persons/${person.id}`, {
      method: "PUT",
      body: JSON.stringify({ name: person.name, active: person.active ? 1 : 0 }),
    });
  }

  async delete(id: number): Promise<void> {
    await this.api<{ ok: boolean }>(`/persons/${id}`, { method: "DELETE" });
  }
}
