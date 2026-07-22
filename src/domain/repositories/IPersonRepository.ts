import type { Person } from "../entities";

export interface IPersonRepository {
  getAll(): Person[];
  create(name: string): Person;
  update(id: number, name: string, active: number): Person;
  delete(id: number): void;
}
