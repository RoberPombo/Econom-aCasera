import type { TransactionRepository } from "../repositories/TransactionRepository";

export class DeleteTransactionUseCase {
  private readonly repository: TransactionRepository;

  constructor(repository: TransactionRepository) {
    this.repository = repository;
  }

  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
