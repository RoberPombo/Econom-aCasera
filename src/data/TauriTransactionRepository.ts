import { Transaction, TransactionFilters } from "../domain/entities";
import type {
  SummaryResult,
  TransactionRepository,
} from "../domain/repositories/TransactionRepository";
import {
  buildTransactionFilterQuery,
  FILTER_FROM,
} from "./buildTransactionFilterQuery";
import { computeFingerprint } from "./computeFingerprint";
import { getDatabase } from "./db";

export { computeFingerprint };

type TransactionRow = {
  id: number | string;
  date: string;
  type: "income" | "expense" | "savings";
  category: string;
  concept: string;
  amount: number | string;
  year: number | string;
  month: number | string;
  person?: string | null;
  receipt_path?: string | null;
};

export class TauriTransactionRepository implements TransactionRepository {
  async getById(id: number): Promise<Transaction | null> {
    const db = await getDatabase();
    const rows = await db.select<TransactionRow[]>(
      "SELECT * FROM transactions WHERE id = ?",
      [id],
    );
    if (rows.length === 0) return null;
    return this.rowToTransaction(rows[0]);
  }

  async getByYearAndMonth(
    year: number,
    month?: number,
  ): Promise<Transaction[]> {
    const db = await getDatabase();
    let query = "SELECT * FROM transactions WHERE year = ?";
    const params: (number | string)[] = [year];
    if (month !== undefined) {
      query += " AND month = ?";
      params.push(month);
    }
    query += " ORDER BY date";
    const rows = await db.select<TransactionRow[]>(query, params);
    return rows.map((t) => this.rowToTransaction(t));
  }

  async getByDate(date: string): Promise<Transaction[]> {
    const db = await getDatabase();
    const rows = await db.select<TransactionRow[]>(
      "SELECT * FROM transactions WHERE date = ? ORDER BY date",
      [date],
    );
    return rows.map((t) => this.rowToTransaction(t));
  }

  async getFiltered(filters: TransactionFilters): Promise<Transaction[]> {
    const db = await getDatabase();
    const { where, params } = buildTransactionFilterQuery(filters);
    const rows = await db.select<TransactionRow[]>(
      `SELECT t.* ${FILTER_FROM} ${where} ORDER BY t.date, t.id`,
      params,
    );
    return rows.map((t) => this.rowToTransaction(t));
  }

  private rowToTransaction(t: TransactionRow): Transaction {
    return Transaction.create({
      id: Number(t.id),
      date: t.date,
      type: t.type,
      category: t.category,
      concept: t.concept,
      amount: Number(t.amount),
      year: Number(t.year),
      month: Number(t.month),
      person: t.person ?? "",
      receiptPath: t.receipt_path ?? null,
    });
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const db = await getDatabase();
    const fingerprint = computeFingerprint(transaction);
    const result = await db.execute(
      "INSERT INTO transactions (date, type, category, concept, amount, year, month, person, fingerprint, receipt_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        transaction.date,
        transaction.type,
        transaction.category,
        transaction.concept,
        transaction.amount,
        transaction.year,
        transaction.month,
        transaction.person,
        fingerprint,
        transaction.receiptPath,
      ],
    );
    return transaction.withUpdates({ id: Number(result.lastInsertId) });
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const db = await getDatabase();
    const fingerprint = computeFingerprint(transaction);
    await db.execute(
      "UPDATE transactions SET date = ?, type = ?, category = ?, concept = ?, amount = ?, year = ?, month = ?, person = ?, fingerprint = ?, receipt_path = ? WHERE id = ?",
      [
        transaction.date,
        transaction.type,
        transaction.category,
        transaction.concept,
        transaction.amount,
        transaction.year,
        transaction.month,
        transaction.person,
        fingerprint,
        transaction.receiptPath,
        transaction.id,
      ],
    );
    return transaction;
  }

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.execute("DELETE FROM transactions WHERE id = ?", [id]);
  }

  async getSummary(year: number, month?: number): Promise<SummaryResult> {
    const filters =
      month !== undefined
        ? TransactionFilters.defaultMonth(year, month)
        : TransactionFilters.create({
            period: {
              mode: "range",
              from: `${year}-01-01`,
              to: `${year}-12-31`,
            },
          });
    return this.getSummaryFiltered(filters);
  }

  async getSummaryFiltered(
    filters: TransactionFilters,
  ): Promise<SummaryResult> {
    const db = await getDatabase();
    const { where, params } = buildTransactionFilterQuery(filters);

    const totals = await db.select<{ type: string; total: number }[]>(
      `SELECT t.type as type, SUM(t.amount) as total ${FILTER_FROM} ${where} GROUP BY t.type`,
      params,
    );
    const income = totals.find((t) => t.type === "income")?.total ?? 0;
    const expense = totals.find((t) => t.type === "expense")?.total ?? 0;
    const summary = {
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
      balance: Math.round((income - expense) * 100) / 100,
    };

    const categoryWhere =
      where === ""
        ? "WHERE t.type IN ('income', 'expense')"
        : `${where} AND t.type IN ('income', 'expense')`;
    const categories = await db.select<
      { category: string; type: "income" | "expense"; amount: number }[]
    >(
      `SELECT t.category as category, t.type as type, SUM(t.amount) as amount ${FILTER_FROM} ${categoryWhere} GROUP BY t.category, t.type ORDER BY t.type, amount DESC`,
      params,
    );

    const monthly = await db.select<
      { month: number; income: number; expense: number }[]
    >(
      `SELECT t.month as month,
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as expense
      ${FILTER_FROM} ${where}
      GROUP BY t.month ORDER BY t.month`,
      params,
    );
    const monthlySummary = monthly.map((m) => ({
      month: m.month,
      income: Math.round(m.income * 100) / 100,
      expense: Math.round(m.expense * 100) / 100,
      balance: Math.round((m.income - m.expense) * 100) / 100,
    }));

    const annual = await db.select<
      { year: number; income: number; expense: number }[]
    >(
      `SELECT t.year as year,
        SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) as income,
        SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) as expense
      ${FILTER_FROM} ${where}
      GROUP BY t.year ORDER BY t.year`,
      params,
    );
    const annualSummary = annual.map((a) => ({
      year: a.year,
      income: Math.round(a.income * 100) / 100,
      expense: Math.round(a.expense * 100) / 100,
      balance: Math.round((a.income - a.expense) * 100) / 100,
    }));

    return {
      summary,
      categories,
      monthly: monthlySummary,
      annual: annualSummary,
    };
  }
}
