import type { Person } from "../entities";
import type { IPersonRepository } from "../repositories/IPersonRepository";

export class PersonUseCases {
  constructor(private readonly repository: IPersonRepository) {}

  getAll(): Person[] {
    return this.repository.getAll();
  }

  create(name: string): Person {
    return this.repository.create(name);
  }

  update(id: number, name: string, active: number): Person {
    return this.repository.update(id, name, active);
  }

  delete(id: number): void {
    return this.repository.delete(id);
  }
}
