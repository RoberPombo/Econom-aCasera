import type { Transaction } from "../entities";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class GetTransactionsUseCase {
  private readonly repository: TransactionRepository;

  constructor(repository: TransactionRepository) {
    this.repository = repository;
  }

  async execute(year: number, month?: number): Promise<Transaction[]> {
    return this.repository.getByYearAndMonth(year, month);
  }
}
