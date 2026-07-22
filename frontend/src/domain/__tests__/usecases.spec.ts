import { describe, expect, test } from "vitest";
import type { TransactionRepository, SummaryResult } from "../repositories/TransactionRepository";
import { Transaction } from "../entities/Transaction";
import { Summary } from "../entities/Summary";
import { CreateTransactionUseCase } from "../usecases/CreateTransactionUseCase";
import { GetTransactionsUseCase } from "../usecases/GetTransactionsUseCase";
import { DeleteTransactionUseCase } from "../usecases/DeleteTransactionUseCase";

class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = [];

  async getByYearAndMonth(year: number): Promise<Transaction[]> {
    return this.transactions.filter((t) => t.year === year);
  }

  async create(transaction: Transaction): Promise<Transaction> {
    this.transactions.push(transaction);
    return transaction;
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const index = this.transactions.findIndex((t) => t.id === transaction.id);
    if (index >= 0) this.transactions[index] = transaction;
    return transaction;
  }

  async delete(id: number): Promise<void> {
    this.transactions = this.transactions.filter((t) => t.id !== id);
  }

  async getSummary(): Promise<SummaryResult> {
    return {
      summary: new Summary({ income: 0, expense: 0 }),
      categories: [],
      monthly: [],
      annual: [],
    };
  }
}

describe("Transaction use cases", () => {
  test("should create and list transactions", async () => {
    const repository = new InMemoryTransactionRepository();
    const createUseCase = new CreateTransactionUseCase(repository);
    const getUseCase = new GetTransactionsUseCase(repository);

    await createUseCase.execute({
      date: "2026-07-22",
      type: "expense",
      category: "Comida",
      concept: "Almuerzo",
      amount: 12.5,
    });

    const transactions = await getUseCase.execute(2026);

    expect(transactions.length).toBe(1);
    expect(transactions[0].concept).toBe("Almuerzo");
  });

  test("should delete a transaction", async () => {
    const repository = new InMemoryTransactionRepository();
    const createUseCase = new CreateTransactionUseCase(repository);
    const deleteUseCase = new DeleteTransactionUseCase(repository);
    const getUseCase = new GetTransactionsUseCase(repository);

    const created = await createUseCase.execute({
      date: "2026-07-22",
      type: "expense",
      category: "Comida",
      concept: "Almuerzo",
      amount: 12.5,
    });

    await deleteUseCase.execute(created.id as number);

    const transactions = await getUseCase.execute(2026);
    expect(transactions.length).toBe(0);
  });
});
