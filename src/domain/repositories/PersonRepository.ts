import type { Person } from "../entities";

export interface PersonRepository {
  getAll(): Promise<Person[]>;
  create(label: string): Promise<Person>;
  update(person: Person): Promise<void>;
  delete(id: number): Promise<void>;
}
