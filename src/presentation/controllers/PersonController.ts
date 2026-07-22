import type { AppContainer } from "../../application/AppContainer";

export class PersonController {
  constructor(private readonly container: AppContainer) {}

  list(): Response {
    const persons = this.container.personUseCases.getAll();
    return Response.json(persons);
  }

  create(name: string): Response {
    this.container.checkConflict();
    const person = this.container.personUseCases.create(name);
    this.container.afterWrite();
    return Response.json(person);
  }

  update(id: number, name: string, active: number): Response {
    this.container.checkConflict();
    const person = this.container.personUseCases.update(id, name, active);
    this.container.afterWrite();
    return Response.json(person);
  }

  delete(id: number): Response {
    this.container.checkConflict();
    this.container.personUseCases.delete(id);
    this.container.afterWrite();
    return Response.json({ ok: true });
  }
}
