import { describe, expect, test } from "vitest";
import { Transaction, TransactionFilters } from "../entities";
import type {
  SummaryResult,
  TransactionRepository,
} from "../repositories/TransactionRepository";
import { GetSummaryUseCase } from "../usecases/GetSummaryUseCase";
import { GetTransactionsUseCase } from "../usecases/GetTransactionsUseCase";

class InMemoryTransactionRepository implements TransactionRepository {
  constructor(private readonly items: Transaction[] = []) {}

  async getById(id: number): Promise<Transaction | null> {
    return this.items.find((t) => t.id === id) ?? null;
  }

  async getByYearAndMonth(
    year: number,
    month?: number,
  ): Promise<Transaction[]> {
    return this.items.filter(
      (t) => t.year === year && (month === undefined || t.month === month),
    );
  }

  async getByDate(date: string): Promise<Transaction[]> {
    return this.items.filter((t) => t.date === date);
  }

  async getFiltered(filters: TransactionFilters): Promise<Transaction[]> {
    return this.items.filter((t) => {
      if (filters.period.mode === "month") {
        if (t.year !== filters.period.year || t.month !== filters.period.month)
          return false;
      } else {
        if (filters.period.from && t.date < filters.period.from) return false;
        if (filters.period.to && t.date > filters.period.to) return false;
      }
      if (filters.types.length && !filters.types.includes(t.type)) return false;
      if (
        filters.categoryKeys.length &&
        !filters.categoryKeys.includes(t.category)
      )
        return false;
      if (filters.personKeys.length && !filters.personKeys.includes(t.person))
        return false;
      if (filters.minAmount !== null && t.amount < filters.minAmount)
        return false;
      if (filters.maxAmount !== null && t.amount > filters.maxAmount)
        return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = `${t.concept} ${t.category} ${t.person}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  async create(transaction: Transaction): Promise<Transaction> {
    this.items.push(transaction);
    return transaction;
  }

  async update(transaction: Transaction): Promise<Transaction> {
    return transaction;
  }

  async delete(_id: number): Promise<void> {}

  async getSummary(year: number, month?: number): Promise<SummaryResult> {
    return this.getSummaryFiltered(
      TransactionFilters.defaultMonth(year, month ?? 1),
    );
  }

  async getSummaryFiltered(
    filters: TransactionFilters,
  ): Promise<SummaryResult> {
    const txs = await this.getFiltered(filters);
    const income = txs
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = txs
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return {
      summary: {
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
        balance: Math.round((income - expense) * 100) / 100,
      },
      categories: [],
      monthly: [],
      annual: [],
    };
  }
}

function tx(partial: {
  date: string;
  type: "income" | "expense";
  category: string;
  concept: string;
  amount: number;
  person?: string;
}) {
  return Transaction.create(partial);
}

describe("GetTransactionsUseCase with filters", () => {
  const repo = new InMemoryTransactionRepository([
    tx({
      date: "2026-08-01",
      type: "expense",
      category: "comida",
      concept: "Mercadona",
      amount: 40,
      person: "ana",
    }),
    tx({
      date: "2026-08-15",
      type: "income",
      category: "nomina",
      concept: "Nómina agosto",
      amount: 1500,
      person: "ana",
    }),
    tx({
      date: "2026-07-10",
      type: "expense",
      category: "transporte",
      concept: "Gasolina",
      amount: 60,
      person: "bob",
    }),
    tx({
      date: "2025-08-01",
      type: "expense",
      category: "comida",
      concept: "Mercadona",
      amount: 30,
      person: "ana",
    }),
  ]);

  const getTx = new GetTransactionsUseCase(repo);
  const getSummary = new GetSummaryUseCase(repo);

  test("filters by month period", async () => {
    const result = await getTx.execute(
      TransactionFilters.defaultMonth(2026, 8),
    );
    expect(result).toHaveLength(2);
  });

  test("AND combines search, type and person across open range", async () => {
    const result = await getTx.execute(
      TransactionFilters.create({
        period: { mode: "range" },
        types: ["expense"],
        personKeys: ["ana"],
        search: "mercadona",
      }),
    );
    expect(result).toHaveLength(2);
    expect(
      result.every((t) => t.concept.toLowerCase().includes("mercadona")),
    ).toBe(true);
  });

  test("summary uses the same filters", async () => {
    const { summary } = await getSummary.execute(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        types: ["expense"],
      }),
    );
    expect(summary.expense).toBe(40);
    expect(summary.income).toBe(0);
    expect(summary.balance).toBe(-40);
  });
});
