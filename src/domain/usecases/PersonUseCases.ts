import type { Person } from "../entities";
import type { PersonRepository } from "../repositories/PersonRepository";

export class GetPersonsUseCase {
  private readonly repository: PersonRepository;

  constructor(repository: PersonRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Person[]> {
    return this.repository.getAll();
  }
}

export class CreatePersonUseCase {
  private readonly repository: PersonRepository;

  constructor(repository: PersonRepository) {
    this.repository = repository;
  }

  async execute(name: string): Promise<Person> {
    return this.repository.create(name);
  }
}

export class UpdatePersonUseCase {
  private readonly repository: PersonRepository;

  constructor(repository: PersonRepository) {
    this.repository = repository;
  }

  async execute(person: Person): Promise<void> {
    return this.repository.update(person);
  }
}

export class DeletePersonUseCase {
  private readonly repository: PersonRepository;

  constructor(repository: PersonRepository) {
    this.repository = repository;
  }

  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
