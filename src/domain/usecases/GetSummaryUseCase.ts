import type { TransactionFilters } from "../entities";
import type { SummaryResult } from "../repositories/TransactionRepository";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class GetSummaryUseCase {
  private readonly repository: TransactionRepository;

  constructor(repository: TransactionRepository) {
    this.repository = repository;
  }

  async execute(filters: TransactionFilters): Promise<SummaryResult> {
    return this.repository.getSummaryFiltered(filters);
  }

  async executeByYearAndMonth(year: number, month?: number): Promise<SummaryResult> {
    return this.repository.getSummary(year, month);
  }
}
