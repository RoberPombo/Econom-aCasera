import type { Transaction } from "../entities";
import type { DbInfoRepository } from "../repositories/DbInfoRepository";
import type { ReceiptRepository } from "../repositories/ReceiptRepository";
import type { TransactionRepository } from "../repositories/TransactionRepository";
import type { ReceiptInput } from "./CreateTransactionUseCase";

export class UpdateTransactionUseCase {
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

  async execute(
    id: number,
    data: {
      date?: string;
      type?: "income" | "expense";
      category?: string;
      concept?: string;
      amount?: number;
      person?: string;
      year?: number;
      month?: number;
      receipt?: ReceiptInput | undefined;
      removeReceipt?: boolean;
    },
  ): Promise<Transaction> {
    const current = await this.repository.getById(id);
    if (!current) throw new Error("Transaction not found");

    let receiptPath = current.receiptPath;
    const nextType = data.type ?? current.type;

    if (nextType === "income" || data.removeReceipt) {
      if (receiptPath) {
        await this.receiptRepository.delete(receiptPath);
      }
      receiptPath = null;
    }

    if (nextType === "expense" && data.receipt) {
      if (receiptPath) {
        await this.receiptRepository.delete(receiptPath);
      }
      receiptPath = await this.receiptRepository.save(
        id,
        data.receipt.bytes,
        data.receipt.extension,
      );
    }

    const updated = current.withUpdates({
      ...data,
      receiptPath,
    });
    const saved = await this.repository.update(updated);
    await this.dbInfoRepository.sync();
    return saved;
  }
}
