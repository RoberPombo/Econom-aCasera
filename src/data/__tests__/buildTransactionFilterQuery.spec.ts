import { describe, expect, test } from "vitest";
import { TransactionFilters } from "../../domain/entities/TransactionFilters";
import { buildTransactionFilterQuery } from "../buildTransactionFilterQuery";

describe("buildTransactionFilterQuery", () => {
  test("builds month period clauses", () => {
    const { where, params } = buildTransactionFilterQuery(
      TransactionFilters.defaultMonth(2026, 8)
    );
    expect(where).toContain("t.year = ?");
    expect(where).toContain("t.month = ?");
    expect(params).toEqual([2026, 8]);
  });

  test("builds open range (all history) with no date clauses", () => {
    const { where, params } = buildTransactionFilterQuery(
      TransactionFilters.create({ period: { mode: "range" } })
    );
    expect(where).toBe("");
    expect(params).toEqual([]);
  });

  test("combines type, category, person, amounts and search with AND", () => {
    const { where, params } = buildTransactionFilterQuery(
      TransactionFilters.create({
        period: { mode: "range", from: "2026-01-01", to: "2026-12-31" },
        types: ["expense"],
        categoryKeys: ["comida", "transporte"],
        personKeys: ["ana"],
        minAmount: 10,
        maxAmount: 100,
        search: "Mercadona",
      })
    );

    expect(where.startsWith("WHERE ")).toBe(true);
    expect(where).toContain("t.date >= ?");
    expect(where).toContain("t.date <= ?");
    expect(where).toContain("t.type = ?");
    expect(where).toContain("t.category IN");
    expect(where).toContain("t.person = ?");
    expect(where).toContain("t.amount >= ?");
    expect(where).toContain("t.amount <= ?");
    expect(where).toContain("LOWER(t.concept) LIKE ?");
    expect(where).toContain("AND");

    expect(params).toEqual([
      "2026-01-01",
      "2026-12-31",
      "expense",
      "comida",
      "transporte",
      "ana",
      10,
      100,
      "%mercadona%",
      "%mercadona%",
      "%mercadona%",
      "%mercadona%",
      "%mercadona%",
    ]);
  });

  test("ignores inverted amount bounds until coherent", () => {
    const { where, params } = buildTransactionFilterQuery(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        minAmount: 50,
        maxAmount: 10,
      })
    );
    expect(where).not.toContain("t.amount");
    expect(params).toEqual([2026, 8]);
  });

  test("ignores inverted date bounds until coherent", () => {
    const { where, params } = buildTransactionFilterQuery(
      TransactionFilters.create({
        period: { mode: "range", from: "2026-08-10", to: "2026-08-01" },
      })
    );
    expect(where).toBe("");
    expect(params).toEqual([]);
  });
});
