import { describe, expect, test } from "vitest";
import { Transaction } from "../../domain/entities";
import { classifySavings } from "../savingsClassifier";

function transfer() {
  return Transaction.create({
    date: "2026-08-01",
    type: "expense",
    category: "Hogar",
    concept: "TRANSFERENCIA A CUENTA AHORRO",
    amount: 250,
  });
}

describe("classifySavings", () => {
  test("classifies a transfer to savings as savings with category Ahorro", () => {
    const [tx] = classifySavings([transfer()], "ing");

    expect(tx.type).toBe("savings");
    expect(tx.category).toBe("Ahorro");
    expect(tx.amount).toBe(250);
  });

  test("matches regardless of accents and case", () => {
    const tx = Transaction.create({
      date: "2026-08-01",
      type: "expense",
      category: "Hogar",
      concept: "Trasferencia a la cuenta de ahorro",
      amount: 100,
    });

    const [classified] = classifySavings([tx], "ing");
    expect(classified.type).toBe("savings");
  });

  test("does not classify unrelated expenses", () => {
    const tx = Transaction.create({
      date: "2026-08-01",
      type: "expense",
      category: "Comida",
      concept: "Supermercado",
      amount: 45,
    });

    const [classified] = classifySavings([tx], "ing");
    expect(classified.type).toBe("expense");
    expect(classified.category).toBe("Comida");
  });

  test("does not classify income movements", () => {
    const tx = Transaction.create({
      date: "2026-08-01",
      type: "income",
      category: "Nómina",
      concept: "TRANSFERENCIA RECIBIDA AHORRO",
      amount: 500,
    });

    const [classified] = classifySavings([tx], "ing");
    expect(classified.type).toBe("income");
  });

  test("leaves transactions unchanged when the source has no patterns", () => {
    const transactions = classifySavings(
      [transfer(), transfer()],
      "n26" as never,
    );

    expect(transactions.every((t) => t.type === "expense")).toBe(true);
  });
});
