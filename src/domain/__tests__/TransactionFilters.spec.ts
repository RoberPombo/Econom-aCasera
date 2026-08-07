import { describe, expect, test } from "vitest";
import { TransactionFilters } from "../entities/TransactionFilters";

describe("TransactionFilters", () => {
  test("creates default month filters without extras", () => {
    const filters = TransactionFilters.defaultMonth(2026, 8);

    expect(filters.period).toEqual({ mode: "month", year: 2026, month: 8 });
    expect(filters.hasExtraFilters).toBe(false);
    expect(filters.search).toBe("");
  });

  test("trims search and detects extra filters", () => {
    const filters = TransactionFilters.create({
      period: { mode: "range" },
      search: "  almuerzo  ",
      types: ["expense"],
    });

    expect(filters.search).toBe("almuerzo");
    expect(filters.hasExtraFilters).toBe(true);
    expect(filters.types).toEqual(["expense"]);
  });

  test("allows temporary inverted amount range while typing", () => {
    const filters = TransactionFilters.create({
      period: { mode: "month", year: 2026, month: 1 },
      minAmount: 50,
      maxAmount: 10,
    });

    expect(filters.minAmount).toBe(50);
    expect(filters.maxAmount).toBe(10);
  });

  test("allows temporary inverted date range while selecting", () => {
    const filters = TransactionFilters.create({
      period: { mode: "range", from: "2026-08-10", to: "2026-08-01" },
    });

    expect(filters.period).toEqual({
      mode: "range",
      from: "2026-08-10",
      to: "2026-08-01",
    });
  });

  test("rejects an invalid month", () => {
    expect(() =>
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 13 },
      }),
    ).toThrow("El mes no es válido");
  });

  test("withPeriod changes the period and keeps the extra filters", () => {
    const filters = TransactionFilters.create({
      period: { mode: "month", year: 2026, month: 3 },
      types: ["income"],
      search: "nomina",
    });

    const changed = filters.withPeriod({
      mode: "range",
      from: "2026-01-01",
      to: "2026-12-31",
    });

    expect(changed.period).toEqual({
      mode: "range",
      from: "2026-01-01",
      to: "2026-12-31",
    });
    expect(changed.types).toEqual(["income"]);
    expect(changed.search).toBe("nomina");
  });

  test("withUpdates overrides only the provided fields", () => {
    const filters = TransactionFilters.create({
      period: { mode: "month", year: 2026, month: 3 },
      personKeys: ["ana"],
      minAmount: 10,
      maxAmount: null,
    });

    const updated = filters.withUpdates({
      search: " taxi ",
      minAmount: null,
      personKeys: undefined,
    });

    expect(updated.search).toBe("taxi");
    expect(updated.minAmount).toBeNull();
    expect(updated.personKeys).toEqual(["ana"]);
    expect(updated.period).toEqual(filters.period);
  });

  test("withUpdates keeps the previous values when a field is omitted", () => {
    const filters = TransactionFilters.create({
      period: { mode: "month", year: 2026, month: 3 },
      minAmount: 10,
      maxAmount: 100,
      search: "taxi",
    });

    const updated = filters.withUpdates({ minAmount: 20 });

    expect(updated.minAmount).toBe(20);
    expect(updated.maxAmount).toBe(100);
    expect(updated.search).toBe("taxi");
  });

  test("forYear keeps non-period filters", () => {
    const filters = TransactionFilters.create({
      period: { mode: "month", year: 2026, month: 3 },
      types: ["income"],
      categoryKeys: ["comida"],
      search: "nomina",
    });

    const year = filters.forYear(2026);

    expect(year.period).toEqual({
      mode: "range",
      from: "2026-01-01",
      to: "2026-12-31",
    });
    expect(year.types).toEqual(["income"]);
    expect(year.categoryKeys).toEqual(["comida"]);
    expect(year.search).toBe("nomina");
  });

  test("clearExtra keeps period only", () => {
    const filters = TransactionFilters.create({
      period: { mode: "range", from: "2026-01-01", to: "2026-06-30" },
      personKeys: ["ana"],
      minAmount: 5,
      search: "taxi",
    });

    const cleared = filters.clearExtra();

    expect(cleared.period).toEqual(filters.period);
    expect(cleared.hasExtraFilters).toBe(false);
  });
});
