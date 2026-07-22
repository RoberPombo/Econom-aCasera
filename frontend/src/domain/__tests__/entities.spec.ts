import { describe, expect, test } from "vitest";
import { Amount, InvalidAmountError } from "../entities/Amount";
import { Transaction } from "../entities/Transaction";
import { Category } from "../entities/Category";
import { Summary } from "../entities/Summary";
import { Settings } from "../entities/Settings";

describe("Amount", () => {
  test("should create a valid amount", () => {
    const amount = Amount.create(10.5);
    expect(amount.value).toBe(10.5);
  });

  test("should throw for zero or negative amounts", () => {
    expect(() => Amount.create(0)).toThrow(InvalidAmountError);
    expect(() => Amount.create(-5)).toThrow(InvalidAmountError);
  });
});

describe("Transaction", () => {
  test("should create a transaction with derived year and month", () => {
    const tx = Transaction.create({
      date: "2026-07-22",
      type: "expense",
      category: "Comida",
      concept: "Almuerzo",
      amount: 12.5,
    });

    expect(tx.year).toBe(2026);
    expect(tx.month).toBe(7);
    expect(tx.amount).toBe(12.5);
  });

  test("should allow updating fields", () => {
    const tx = Transaction.create({
      date: "2026-07-22",
      type: "expense",
      category: "Comida",
      concept: "Almuerzo",
      amount: 12.5,
    });

    const updated = tx.withUpdates({ amount: 20, concept: "Cena" });

    expect(updated.concept).toBe("Cena");
    expect(updated.amount).toBe(20);
    expect(updated.date).toBe(tx.date);
  });
});

describe("Category", () => {
  test("should create an active category by default", () => {
    const category = Category.create({ name: "Comida", type: "expense" });
    expect(category.name).toBe("Comida");
    expect(category.active).toBe(true);
  });

  test("should toggle active state", () => {
    const category = Category.create({ name: "Comida", type: "expense" });
    const inactive = category.toggleActive();
    expect(inactive.active).toBe(false);
  });

  test("should throw for empty name", () => {
    expect(() => Category.create({ name: "   ", type: "expense" })).toThrow();
  });
});

describe("Summary", () => {
  test("should calculate balance", () => {
    const summary = new Summary({ income: 1000, expense: 300 });
    expect(summary.balance).toBe(700);
  });
});

describe("Settings", () => {
  test("should create settings and update year", () => {
    const settings = new Settings({ currentYear: 2026, currentMonth: 7, viewMode: "monthly", theme: "system" });
    const updated = settings.withYear(2025);
    expect(updated.currentYear).toBe(2025);
    expect(updated.currentMonth).toBe(7);
  });
});
