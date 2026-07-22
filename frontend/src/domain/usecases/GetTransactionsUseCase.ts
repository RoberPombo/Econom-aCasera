import type { Transaction } from "../entities";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class GetTransactionsUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(year: number, month?: number): Promise<Transaction[]> {
    return this.repository.getAll(year, month);
  }
}
