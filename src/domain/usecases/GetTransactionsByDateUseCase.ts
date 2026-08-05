import type { Transaction } from "../entities";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class GetTransactionsByDateUseCase {
  private readonly repository: TransactionRepository;

  constructor(repository: TransactionRepository) {
    this.repository = repository;
  }

  async execute(date: string): Promise<Transaction[]> {
    return this.repository.getByDate(date);
  }
}
