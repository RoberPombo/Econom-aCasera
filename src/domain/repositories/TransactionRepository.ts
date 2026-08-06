import type { Transaction, Summary, CategorySummary, MonthlySummary, AnnualSummary, TransactionFilters } from "../entities";

export interface SummaryResult {
  summary: Summary;
  categories: CategorySummary[];
  monthly: MonthlySummary[];
  annual: AnnualSummary[];
}

export interface TransactionRepository {
  getById(id: number): Promise<Transaction | null>;
  getByYearAndMonth(year: number, month?: number): Promise<Transaction[]>;
  getByDate(date: string): Promise<Transaction[]>;
  getFiltered(filters: TransactionFilters): Promise<Transaction[]>;
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: number): Promise<void>;
  getSummary(year: number, month?: number): Promise<SummaryResult>;
  getSummaryFiltered(filters: TransactionFilters): Promise<SummaryResult>;
}
