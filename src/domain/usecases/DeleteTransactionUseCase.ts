import type { DbInfoRepository } from "../repositories/DbInfoRepository";
import type { ReceiptRepository } from "../repositories/ReceiptRepository";
import type { TransactionRepository } from "../repositories/TransactionRepository";

export class DeleteTransactionUseCase {
  private readonly repository: TransactionRepository;
  private readonly receiptRepository: ReceiptRepository;
  private readonly dbInfoRepository: DbInfoRepository;

  constructor(
    repository: TransactionRepository,
    receiptRepository: ReceiptRepository,
    dbInfoRepository: DbInfoRepository,
  ) {
    this.repository = repository;
    this.receiptRepository = receiptRepository;
    this.dbInfoRepository = dbInfoRepository;
  }

  async execute(id: number): Promise<void> {
    const current = await this.repository.getById(id);
    if (current?.receiptPath) {
      await this.receiptRepository.delete(current.receiptPath);
    }
    await this.repository.delete(id);
    await this.dbInfoRepository.sync();
  }
}
