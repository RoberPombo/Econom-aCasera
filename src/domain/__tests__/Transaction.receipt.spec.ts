import { describe, expect, test } from "vitest";
import { Transaction } from "../entities/Transaction";

describe("Transaction receipt", () => {
  test("allows receipt path on expense", () => {
    const tx = Transaction.create({
      date: "2026-08-01",
      type: "expense",
      category: "comida",
      concept: "Ticket",
      amount: 12,
      receiptPath: "receipts/1.jpg",
    });
    expect(tx.receiptPath).toBe("receipts/1.jpg");
    expect(tx.hasReceipt).toBe(true);
  });

  test("rejects receipt path on income", () => {
    expect(() =>
      Transaction.create({
        date: "2026-08-01",
        type: "income",
        category: "nomina",
        concept: "Sueldo",
        amount: 1000,
        receiptPath: "receipts/1.jpg",
      })
    ).toThrow(/gastos/i);
  });

  test("clears receipt when changing type to income", () => {
    const tx = Transaction.create({
      date: "2026-08-01",
      type: "expense",
      category: "comida",
      concept: "Ticket",
      amount: 12,
      receiptPath: "receipts/1.jpg",
    });
    const updated = tx.withUpdates({ type: "income", category: "nomina" });
    expect(updated.receiptPath).toBeNull();
    expect(updated.hasReceipt).toBe(false);
  });
});
