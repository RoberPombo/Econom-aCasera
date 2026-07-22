import type { Transaction } from "../entities";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class UpdateTransactionUseCase {
  private readonly repository: TransactionRepository;

  constructor(repository: TransactionRepository) {
    this.repository = repository;
  }

  async execute(id: number, data: {
    date?: string;
    type?: "income" | "expense";
    category?: string;
    concept?: string;
    amount?: number;
    person?: string;
    year?: number;
    month?: number;
  }): Promise<Transaction> {
    const year = data.year ?? new Date().getFullYear();
    const existing = await this.repository.getByYearAndMonth(year);
    const current = existing.find((t) => t.id === id);
    if (!current) throw new Error("Transaction not found");

    const updated = current.withUpdates(data);
    return this.repository.update(updated);
  }
}
