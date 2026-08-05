import type { SummaryResult } from "../repositories/TransactionRepository";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class GetSummaryUseCase {
  private readonly repository: TransactionRepository;

  constructor(repository: TransactionRepository) {
    this.repository = repository;
  }

  async execute(year: number, month?: number): Promise<SummaryResult> {
    return this.repository.getSummary(year, month);
  }
}
