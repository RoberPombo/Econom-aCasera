import type { Transaction, TransactionFilters } from "../entities";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class GetTransactionsUseCase {
  private readonly repository: TransactionRepository;

  constructor(repository: TransactionRepository) {
    this.repository = repository;
  }

  async execute(filters: TransactionFilters): Promise<Transaction[]> {
    return this.repository.getFiltered(filters);
  }

  async executeByYearAndMonth(year: number, month?: number): Promise<Transaction[]> {
    return this.repository.getByYearAndMonth(year, month);
  }
}
