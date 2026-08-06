import { Transaction } from "../entities";
import type { ReceiptRepository } from "../repositories/ReceiptRepository";
import type { TransactionRepository } from "../repositories/TransactionRepository";
import type { DbInfoRepository } from "../repositories/DbInfoRepository";

export type ReceiptInput = {
  bytes: Uint8Array;
  extension: string;
} | null;

export class CreateTransactionUseCase {
  private readonly repository: TransactionRepository;
  private readonly receiptRepository: ReceiptRepository;
  private readonly dbInfoRepository: DbInfoRepository;

  constructor(
    repository: TransactionRepository,
    receiptRepository: ReceiptRepository,
    dbInfoRepository: DbInfoRepository
  ) {
    this.repository = repository;
    this.receiptRepository = receiptRepository;
    this.dbInfoRepository = dbInfoRepository;
  }

  async execute(data: {
    date: string;
    type: "income" | "expense";
    category: string;
    concept: string;
    amount: number;
    person?: string;
    year?: number;
    month?: number;
    receipt?: ReceiptInput;
  }): Promise<Transaction> {
    const transaction = Transaction.create({
      date: data.date,
      type: data.type,
      category: data.category,
      concept: data.concept,
      amount: data.amount,
      person: data.person,
      year: data.year,
      month: data.month,
      receiptPath: null,
    });

    const created = await this.repository.create(transaction);

    if (data.type === "expense" && data.receipt && typeof created.id === "number") {
      const path = await this.receiptRepository.save(
        created.id,
        data.receipt.bytes,
        data.receipt.extension
      );
      const withReceipt = created.withUpdates({ receiptPath: path });
      const updated = await this.repository.update(withReceipt);
      await this.dbInfoRepository.sync();
      return updated;
    }

    await this.dbInfoRepository.sync();
    return created;
  }
}
