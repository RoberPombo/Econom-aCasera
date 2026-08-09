import { describe, expect, test } from "vitest";
import { TransactionFilters } from "../../domain/entities";
import { buildTransactionFilterQuery } from "../buildTransactionFilterQuery";

const monthFilters = { period: { mode: "month", year: 2026, month: 8 } };

function create(
  partial: Partial<Parameters<typeof TransactionFilters.create>[0]> = {},
) {
  return TransactionFilters.create({
    ...monthFilters,
    ...partial,
  } as Parameters<typeof TransactionFilters.create>[0]);
}

describe("buildTransactionFilterQuery", () => {
  test("keeps the month clauses for the month mode", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({ period: { mode: "month", year: 2026, month: 8 } }),
    );

    expect(where).toContain("t.year = ?");
    expect(where).toContain("t.month = ?");
    expect(params).toEqual([2026, 8]);
  });

  test("adds a from clause only on a range", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({ period: { mode: "range", from: "2026-01-01" } }),
    );

    expect(where).toContain("t.date >= ?");
    expect(where).not.toContain("t.date <= ?");
    expect(params).toEqual(["2026-01-01"]);
  });

  test("adds a to clause only on a range", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({ period: { mode: "range", to: "2026-12-31" } }),
    );

    expect(where).toContain("t.date <= ?");
    expect(params).toEqual(["2026-12-31"]);
  });

  test("adds both clauses for a coherent range", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({
        period: { mode: "range", from: "2026-01-01", to: "2026-12-31" },
      }),
    );

    expect(where).toContain("t.date >= ?");
    expect(where).toContain("t.date <= ?");
    expect(params).toEqual(["2026-01-01", "2026-12-31"]);
  });

  test("skips the range entirely when it is inverted", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({
        period: { mode: "range", from: "2026-12-31", to: "2026-01-01" },
      }),
    );

    expect(where).not.toContain("t.date");
    expect(params).toEqual([]);
  });

  test("scopes types by single value or IN list", () => {
    const single = buildTransactionFilterQuery(create({ types: ["expense"] }));
    expect(single.where).toContain("t.type = ?");
    expect(single.params).toContain("expense");

    const multi = buildTransactionFilterQuery(
      create({ types: ["income", "expense"] }),
    );
    expect(multi.where).toContain("t.type IN (?, ?)");
    expect(multi.params).toEqual(expect.arrayContaining(["income", "expense"]));
  });

  test("scopes categories by single or IN list", () => {
    const single = buildTransactionFilterQuery(
      create({ categoryKeys: ["comida"] }),
    );
    expect(single.where).toContain("t.category = ?");
    expect(single.params).toEqual([2026, 8, "comida"]);

    const multi = buildTransactionFilterQuery(
      create({ categoryKeys: ["comida", "ocio"] }),
    );
    expect(multi.where).toContain("t.category IN (?, ?)");
  });

  test("scopes persons by single or IN list", () => {
    const single = buildTransactionFilterQuery(create({ personKeys: ["ana"] }));
    expect(single.where).toContain("t.person = ?");
    expect(single.params).toEqual([2026, 8, "ana"]);

    const multi = buildTransactionFilterQuery(
      create({ personKeys: ["ana", "bob"] }),
    );
    expect(multi.where).toContain("t.person IN (?, ?)");
  });

  test("adds amount clauses when coherent", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({ minAmount: 10, maxAmount: 50 }),
    );

    expect(where).toContain("t.amount >= ?");
    expect(where).toContain("t.amount <= ?");
    expect(params).toEqual([2026, 8, 10, 50]);
  });

  test("skips the amount clauses when the range is inverted", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({ minAmount: 50, maxAmount: 10 }),
    );

    expect(where).not.toContain("t.amount");
    expect(params).toEqual([2026, 8]);
  });

  test("adds only the min amount when the max is absent", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({ minAmount: 10 }),
    );

    expect(where).toContain("t.amount >= ?");
    expect(where).not.toContain("t.amount <= ?");
    expect(params).toEqual([2026, 8, 10]);
  });

  test("searches with lowercased like clauses across five columns", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({ search: "Mercad" }),
    );

    expect(where).toContain("LOWER(t.concept) LIKE ?");
    expect(where).toContain("LOWER(COALESCE(c.label, '')) LIKE ?");
    expect(where).toContain("LOWER(COALESCE(p.label, '')) LIKE ?");
    expect(params).toEqual([
      2026,
      8,
      "%mercad%",
      "%mercad%",
      "%mercad%",
      "%mercad%",
      "%mercad%",
    ]);
  });

  test("produces no WHERE clause without filters", () => {
    const { where, params } = buildTransactionFilterQuery(
      create({ period: { mode: "range" } }),
    );

    expect(where).toBe("");
    expect(params).toEqual([]);
  });
});
