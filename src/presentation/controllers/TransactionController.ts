import type { AppContainer } from "../../application/AppContainer";
import type { Transaction } from "../../domain/entities";

export class TransactionController {
  constructor(private readonly container: AppContainer) {}

  list(year: number, month?: number): Response {
    const transactions = this.container.transactionUseCases.list(year, month);
    return Response.json(transactions);
  }

  create(data: Transaction): Response {
    this.container.checkConflict();
    const transaction = this.container.transactionUseCases.create(data);
    this.container.afterWrite();
    return Response.json(transaction);
  }

  update(id: number, data: Transaction): Response {
    this.container.checkConflict();
    const transaction = this.container.transactionUseCases.update({ ...data, id });
    this.container.afterWrite();
    return Response.json(transaction);
  }

  delete(id: number): Response {
    this.container.checkConflict();
    this.container.transactionUseCases.delete(id);
    this.container.afterWrite();
    return Response.json({ ok: true });
  }

  summary(year: number, month?: number): Response {
    const summary = this.container.transactionUseCases.getSummary(year, month);
    return Response.json(summary);
  }

  categories(year: number, month?: number): Response {
    const categories = this.container.transactionUseCases.getCategories(year, month);
    return Response.json(categories);
  }

  monthlySummary(year: number): Response {
    const summary = this.container.transactionUseCases.getMonthlySummary(year);
    return Response.json(summary);
  }

  annualSummary(): Response {
    const summary = this.container.transactionUseCases.getAnnualSummary();
    return Response.json(summary);
  }
}
