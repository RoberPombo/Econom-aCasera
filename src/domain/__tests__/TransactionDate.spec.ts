import { describe, expect, test } from "vitest";
import { Transaction } from "../entities/Transaction";

describe("Transaction date", () => {
  test("derives the period from an ISO date without timezone shifts", () => {
    const transaction = Transaction.create({
      date: "2026-08-01",
      type: "expense",
      category: "comida",
      concept: "Compra",
      amount: 12,
    });

    expect(transaction.date).toBe("2026-08-01");
    expect(transaction.year).toBe(2026);
    expect(transaction.month).toBe(8);
  });

  test("updates the derived period when the date changes", () => {
    const transaction = Transaction.create({
      date: "2026-08-31",
      type: "expense",
      category: "comida",
      concept: "Compra",
      amount: 12,
    });

    const updated = transaction.withUpdates({ date: "2027-01-01" });

    expect(updated.date).toBe("2027-01-01");
    expect(updated.year).toBe(2027);
    expect(updated.month).toBe(1);
  });
});
