import type { Transaction, Summary, CategorySummary, MonthlySummary, AnnualSummary } from "../entities";

export interface SummaryResult {
  summary: Summary;
  categories: CategorySummary[];
  monthly: MonthlySummary[];
  annual: AnnualSummary[];
}

export interface TransactionRepository {
  getByYearAndMonth(year: number, month?: number): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: number): Promise<void>;
  getSummary(year: number, month?: number): Promise<SummaryResult>;
}
