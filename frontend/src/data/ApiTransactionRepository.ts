import { Transaction } from "../domain/entities";
import type { SummaryResult, TransactionRepository } from "../domain/repositories/TransactionRepository";

export class ApiTransactionRepository implements TransactionRepository {
  private async api<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json();
  }

  async getByYearAndMonth(year: number, month?: number): Promise<Transaction[]> {
    const data = await this.api<Transaction[]>(
      `/transactions?year=${year}${month !== undefined ? `&month=${month}` : ""}`
    );
    return data.map((t) =>
      Transaction.create({
        id: Number(t.id),
        date: t.date,
        type: t.type,
        category: t.category,
        concept: t.concept,
        amount: Number(t.amount),
        year: t.year,
        month: t.month,
      })
    );
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const created = await this.api<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify({
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        concept: transaction.concept,
        amount: transaction.amount,
        year: transaction.year,
        month: transaction.month,
      }),
    });
    return Transaction.create({ ...created, id: Number(created.id) });
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const updated = await this.api<Transaction>(`/transactions/${transaction.id}`, {
      method: "PUT",
      body: JSON.stringify({
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        concept: transaction.concept,
        amount: transaction.amount,
        year: transaction.year,
        month: transaction.month,
      }),
    });
    return Transaction.create({ ...updated, id: Number(updated.id) });
  }

  async delete(id: number): Promise<void> {
    await this.api<{ ok: boolean }>(`/transactions/${id}`, { method: "DELETE" });
  }

  async getSummary(year: number, month?: number): Promise<SummaryResult> {
    return this.api<SummaryResult>(
      `/summary?year=${year}${month !== undefined ? `&month=${month}` : ""}`
    );
  }
}
