import type { Transaction, Summary, CategorySummary, MonthlySummary, AnnualSummary } from "../../domain/entities";
import type { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";
import type { SQLiteDatabase } from "../database/SQLiteDatabase";

export class SQLiteTransactionRepository implements ITransactionRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  private get db() {
    return this.database.connection;
  }

  list(year: number, month?: number): Transaction[] {
    if (month) {
      return this.db
        .query("SELECT id, date, type, category, concept, amount, year, month, person FROM transactions WHERE year = ? AND month = ? ORDER BY date DESC, id DESC")
        .all(year, month) as Transaction[];
    }
    return this.db
      .query("SELECT id, date, type, category, concept, amount, year, month, person FROM transactions WHERE year = ? ORDER BY date DESC, id DESC")
      .all(year) as Transaction[];
  }

  create(transaction: Transaction): Transaction {
    const date = new Date(transaction.date);
    const year = transaction.year || date.getFullYear();
    const month = transaction.month || date.getMonth() + 1;
    const person = transaction.person || "";
    const result = this.db.run(
      "INSERT INTO transactions (date, type, category, concept, amount, year, month, person) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [transaction.date, transaction.type, transaction.category, transaction.concept, transaction.amount, year, month, person]
    );
    return { ...transaction, id: Number(result.lastInsertRowid), year, month, person };
  }

  update(transaction: Transaction): Transaction {
    if (!transaction.id) throw new Error("id is required");
    const date = new Date(transaction.date);
    const year = transaction.year || date.getFullYear();
    const month = transaction.month || date.getMonth() + 1;
    const person = transaction.person || "";
    this.db.run(
      "UPDATE transactions SET date = ?, type = ?, category = ?, concept = ?, amount = ?, year = ?, month = ?, person = ? WHERE id = ?",
      [transaction.date, transaction.type, transaction.category, transaction.concept, transaction.amount, year, month, person, transaction.id]
    );
    return { ...transaction, year, month, person };
  }

  delete(id: number): void {
    this.db.run("DELETE FROM transactions WHERE id = ?", [id]);
  }

  getSummary(year: number, month?: number): Summary {
    let row;
    if (month) {
      row = this.db
        .query(
          `SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
          FROM transactions WHERE year = ? AND month = ?`
        )
        .get(year, month) as { income: number; expense: number };
    } else {
      row = this.db
        .query(
          `SELECT
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
          FROM transactions WHERE year = ?`
        )
        .get(year) as { income: number; expense: number };
    }
    const income = this.round(row.income || 0);
    const expense = this.round(row.expense || 0);
    return { income, expense, balance: this.round(income - expense) };
  }

  getCategories(year: number, month?: number): CategorySummary[] {
    if (month) {
      return this.db
        .query("SELECT category, type, SUM(amount) AS amount FROM transactions WHERE year = ? AND month = ? GROUP BY category, type ORDER BY amount DESC")
        .all(year, month) as CategorySummary[];
    }
    return this.db
      .query("SELECT category, type, SUM(amount) AS amount FROM transactions WHERE year = ? GROUP BY category, type ORDER BY amount DESC")
      .all(year) as CategorySummary[];
  }

  getMonthlySummary(year: number): MonthlySummary[] {
    const rows = this.db
      .query(
        `SELECT
          month,
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions WHERE year = ? GROUP BY month ORDER BY month`
      )
      .all(year) as { month: number; income: number; expense: number }[];

    return rows.map((r) => ({
      month: r.month,
      income: this.round(r.income),
      expense: this.round(r.expense),
      balance: this.round(r.income - r.expense),
    }));
  }

  getAnnualSummary(): AnnualSummary[] {
    const rows = this.db
      .query(
        `SELECT
          year,
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions GROUP BY year ORDER BY year DESC`
      )
      .all() as { year: number; income: number; expense: number }[];

    return rows.map((r) => ({
      year: r.year,
      income: this.round(r.income),
      expense: this.round(r.expense),
      balance: this.round(r.income - r.expense),
    }));
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
