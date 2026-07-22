import type { Transaction, Summary, CategorySummary, MonthlySummary, AnnualSummary } from "../entities";
import type { ITransactionRepository } from "../repositories/ITransactionRepository";

export class TransactionUseCases {
  constructor(private readonly repository: ITransactionRepository) {}

  list(year: number, month?: number): Transaction[] {
    return this.repository.list(year, month);
  }

  create(transaction: Transaction): Transaction {
    return this.repository.create(transaction);
  }

  update(transaction: Transaction): Transaction {
    return this.repository.update(transaction);
  }

  delete(id: number): void {
    this.repository.delete(id);
  }

  getSummary(year: number, month?: number): Summary {
    return this.repository.getSummary(year, month);
  }

  getCategories(year: number, month?: number): CategorySummary[] {
    return this.repository.getCategories(year, month);
  }

  getMonthlySummary(year: number): MonthlySummary[] {
    return this.repository.getMonthlySummary(year);
  }

  getAnnualSummary(): AnnualSummary[] {
    return this.repository.getAnnualSummary();
  }
}
