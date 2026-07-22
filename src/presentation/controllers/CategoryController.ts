import type { AppContainer } from "../../application/AppContainer";

export class CategoryController {
  constructor(private readonly container: AppContainer) {}

  list(): Response {
    const categories = this.container.categoryUseCases.list();
    return Response.json(categories);
  }

  create(name: string, type: "income" | "expense"): Response {
    this.container.checkConflict();
    const category = this.container.categoryUseCases.create(name, type);
    this.container.afterWrite();
    return Response.json(category);
  }

  update(id: number, name: string, type: "income" | "expense", active: number): Response {
    this.container.checkConflict();
    this.container.categoryUseCases.update(id, name, type, active);
    this.container.afterWrite();
    return Response.json({ ok: true });
  }

  delete(id: number): Response {
    this.container.checkConflict();
    this.container.categoryUseCases.delete(id);
    this.container.afterWrite();
    return Response.json({ ok: true });
  }
}
