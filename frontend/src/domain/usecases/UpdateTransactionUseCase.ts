import { Transaction } from "../entities";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class UpdateTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const existing = await this.repository.getAll(data.year ?? new Date().getFullYear());
    const current = existing.find((t) => t.id === id);
    if (!current) throw new Error("Transaction not found");

    const updated = current.withUpdates(data);
    return this.repository.update(updated);
  }
}
