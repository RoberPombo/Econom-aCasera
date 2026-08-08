import { describe, expect, test } from "vitest";
import { Transaction } from "../entities/Transaction";

describe("Transaction savings type", () => {
  test("creates a savings transaction", () => {
    const tx = Transaction.create({
      date: "2026-08-01",
      type: "savings",
      category: "Ahorro",
      concept: "Transferencia a cuenta ahorro",
      amount: 250.5,
    });

    expect(tx.type).toBe("savings");
    expect(tx.hasReceipt).toBe(false);
  });

  test("clears receipt when changing type to savings", () => {
    const tx = Transaction.create({
      id: 1,
      date: "2026-08-01",
      type: "expense",
      category: "Comida",
      concept: "Compra",
      amount: 30,
      receiptPath: "/tmp/ticket.png",
    });

    const updated = tx.withUpdates({ type: "savings", category: "Ahorro" });
    expect(updated.type).toBe("savings");
    expect(updated.hasReceipt).toBe(false);
  });

  test("rejects a receipt for a savings transaction", () => {
    expect(() =>
      Transaction.create({
        date: "2026-08-01",
        type: "savings",
        category: "Ahorro",
        concept: "Transferencia",
        amount: 100,
        receiptPath: "/tmp/ticket.png",
      }),
    ).toThrow("Solo los gastos pueden tener foto de ticket");
  });

  test("keeps savings type and moves the rest with withUpdates", () => {
    const tx = Transaction.create({
      id: 1,
      date: "2026-08-01",
      type: "savings",
      category: "Ahorro",
      concept: "Transferencia",
      amount: 100,
    });

    const updated = tx.withUpdates({ amount: 200, category: "Ahorro" });
    expect(updated.type).toBe("savings");
    expect(updated.amount).toBe(200);
  });
});
