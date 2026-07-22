import type { TransactionRepository } from "../repositories/TransactionRepository";

export class DeleteTransactionUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
