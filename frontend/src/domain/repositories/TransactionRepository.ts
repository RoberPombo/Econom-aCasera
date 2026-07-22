import type { Transaction, Summary, CategorySummary, MonthlySummary, AnnualSummary } from "../entities";

export interface TransactionRepository {
  getAll(year: number, month?: number): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: number): Promise<void>;
  getSummary(year: number, month?: number): Promise<Summary>;
  getCategories(year: number, month?: number): Promise<CategorySummary[]>;
  getMonthlySummary(year: number): Promise<MonthlySummary[]>;
  getAnnualSummary(): Promise<AnnualSummary[]>;
}
