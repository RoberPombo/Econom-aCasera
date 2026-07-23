import type { Person } from "../entities";

export interface PersonRepository {
  getAll(): Promise<Person[]>;
  create(name: string): Promise<Person>;
  update(person: Person): Promise<void>;
  delete(id: number): Promise<void>;
}
