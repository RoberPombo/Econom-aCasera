import { Transaction } from "../entities";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class CreateTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(data: {
    date: string;
    type: "income" | "expense";
    category: string;
    concept: string;
    amount: number;
    year?: number;
    month?: number;
  }): Promise<Transaction> {
    const transaction = Transaction.create(data);
    return this.repository.create(transaction);
  }
}
