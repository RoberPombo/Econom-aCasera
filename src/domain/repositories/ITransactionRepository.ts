import type { Transaction, Summary, CategorySummary, MonthlySummary, AnnualSummary } from "../entities";

export interface ITransactionRepository {
  list(year: number, month?: number): Transaction[];
  create(transaction: Transaction): Transaction;
  update(transaction: Transaction): Transaction;
  delete(id: number): void;
  getSummary(year: number, month?: number): Summary;
  getCategories(year: number, month?: number): CategorySummary[];
  getMonthlySummary(year: number): MonthlySummary[];
  getAnnualSummary(): AnnualSummary[];
}
