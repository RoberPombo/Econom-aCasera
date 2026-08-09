import { describe, expect, test } from "vitest";
import { InMemoryTransactionRepository } from "../../tests/fakes/repositories";
import { Transaction, TransactionFilters } from "../entities";
import { GetSummaryUseCase } from "../usecases/GetSummaryUseCase";
import { GetTransactionsUseCase } from "../usecases/GetTransactionsUseCase";

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
    const filters = TransactionFilters.defaultMonth(2026, 8);

    const result = await getTx.execute(filters);

    expect(result).toHaveLength(2);
  });

  test("AND combines search, type and person across open range", async () => {
    const filters = TransactionFilters.create({
      period: { mode: "range" },
      types: ["expense"],
      personKeys: ["ana"],
      search: "mercadona",
    });

    const result = await getTx.execute(filters);

    expect(result).toHaveLength(2);
    expect(
      result.every((t) => t.concept.toLowerCase().includes("mercadona")),
    ).toBe(true);
  });

  test("summary uses the same filters", async () => {
    const filters = TransactionFilters.create({
      period: { mode: "month", year: 2026, month: 8 },
      types: ["expense"],
    });

    const { summary } = await getSummary.execute(filters);

    expect(summary.expense).toBe(40);
    expect(summary.income).toBe(0);
    expect(summary.balance).toBe(-40);
  });

  test("executeByYearAndMonth delegates to the monthly summary", async () => {
    const { summary } = await getSummary.executeByYearAndMonth(2026, 8);

    expect(summary.income).toBe(1500);
    expect(summary.expense).toBe(40);
    expect(summary.balance).toBe(1460);
  });

  test("executeByYearAndMonth filters by year and month", async () => {
    const result = await getTx.executeByYearAndMonth(2026, 7);

    expect(result).toHaveLength(1);
    expect(result[0].concept).toBe("Gasolina");
  });
});
