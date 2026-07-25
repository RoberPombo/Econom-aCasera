import { Transaction } from "../domain/entities";
import type { SummaryResult, TransactionRepository } from "../domain/repositories/TransactionRepository";
import { getDatabase } from "./db";

export class TauriTransactionRepository implements TransactionRepository {
  async getByYearAndMonth(year: number, month?: number): Promise<Transaction[]> {
    const db = await getDatabase();
    let query = "SELECT * FROM transactions WHERE year = ?";
    const params: (number | string)[] = [year];
    if (month !== undefined) {
      query += " AND month = ?";
      params.push(month);
    }
    query += " ORDER BY date";
    const rows = await db.select<Transaction[]>(query, params);
    return rows.map((t) =>
      Transaction.create({
        id: Number(t.id),
        date: t.date,
        type: t.type,
        category: t.category,
        concept: t.concept,
        amount: Number(t.amount),
        year: Number(t.year),
        month: Number(t.month),
        person: t.person ?? "",
      })
    );
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const db = await getDatabase();
    const result = await db.execute(
      "INSERT INTO transactions (date, type, category, concept, amount, year, month, person) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [transaction.date, transaction.type, transaction.category, transaction.concept, transaction.amount, transaction.year, transaction.month, transaction.person]
    );
    return transaction.withUpdates({ id: Number(result.lastInsertId) });
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const db = await getDatabase();
    await db.execute(
      "UPDATE transactions SET date = ?, type = ?, category = ?, concept = ?, amount = ?, year = ?, month = ?, person = ? WHERE id = ?",
      [transaction.date, transaction.type, transaction.category, transaction.concept, transaction.amount, transaction.year, transaction.month, transaction.person, transaction.id]
    );
    return transaction;
  }

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.execute("DELETE FROM transactions WHERE id = ?", [id]);
  }

  async getSummary(year: number, month?: number): Promise<SummaryResult> {
    const db = await getDatabase();
    let where = "WHERE year = ?";
    const params: (number | string)[] = [year];
    if (month !== undefined) {
      where += " AND month = ?";
      params.push(month);
    }

    const totals = await db.select<{ type: string; total: number }[]>(
      `SELECT type, SUM(amount) as total FROM transactions ${where} GROUP BY type`,
      params
    );
    const income = totals.find((t) => t.type === "income")?.total ?? 0;
    const expense = totals.find((t) => t.type === "expense")?.total ?? 0;
    const summary = { income: Math.round(income * 100) / 100, expense: Math.round(expense * 100) / 100, balance: Math.round((income - expense) * 100) / 100 };

    const categories = await db.select<{ category: string; type: "income" | "expense"; amount: number }[]>(
      `SELECT category, type, SUM(amount) as amount FROM transactions ${where} GROUP BY category, type ORDER BY type, amount DESC`,
      params
    );

    const monthly = await db.select<{ month: number; income: number; expense: number }[]>(
      `SELECT month, SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income, SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense FROM transactions WHERE year = ? GROUP BY month ORDER BY month`,
      [year]
    );
    const monthlySummary = monthly.map((m) => ({
      month: m.month,
      income: Math.round(m.income * 100) / 100,
      expense: Math.round(m.expense * 100) / 100,
      balance: Math.round((m.income - m.expense) * 100) / 100,
    }));

    const annual = await db.select<{ year: number; income: number; expense: number }[]>(
      `SELECT year, SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income, SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense FROM transactions GROUP BY year ORDER BY year`
    );
    const annualSummary = annual.map((a) => ({
      year: a.year,
      income: Math.round(a.income * 100) / 100,
      expense: Math.round(a.expense * 100) / 100,
      balance: Math.round((a.income - a.expense) * 100) / 100,
    }));

    return { summary, categories, monthly: monthlySummary, annual: annualSummary };
  }
}
