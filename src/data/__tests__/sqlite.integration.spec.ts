/// <reference types="node" />
import { DatabaseSync } from "node:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { Transaction, TransactionFilters } from "../../domain/entities";
import { computeFingerprint } from "../computeFingerprint";
import { closeDatabase, type DbClient, getDatabase } from "../db";
import { TauriImportRepository } from "../TauriImportRepository";
import { TauriTransactionRepository } from "../TauriTransactionRepository";

class NodeSqliteClient implements DbClient {
  constructor(private readonly db: DatabaseSync) {}

  async execute(
    sql: string,
    params: unknown[] = [],
  ): Promise<{ lastInsertId?: number; rowsAffected: number }> {
    if (params.length === 0) {
      this.db.exec(sql);
      return { rowsAffected: 0 };
    }
    const result = this.db.prepare(sql).run(...(params as never[]));
    return {
      lastInsertId: Number(result.lastInsertRowid),
      rowsAffected: Number(result.changes),
    };
  }

  async select<T>(sql: string, params: unknown[] = []): Promise<T> {
    const statement = this.db.prepare(sql);
    const rows =
      params.length === 0
        ? statement.all()
        : statement.all(...(params as never[]));
    return rows as T;
  }

  async close(_db?: string): Promise<boolean> {
    this.db.close();
    return true;
  }
}

function openClient(): NodeSqliteClient {
  return new NodeSqliteClient(new DatabaseSync(":memory:"));
}

function makeTransaction(
  date: string,
  amount: number,
  overrides: Partial<Parameters<typeof Transaction.create>[0]> = {},
): Transaction {
  return Transaction.create({
    date,
    type: "expense",
    category: "comida",
    concept: "Mercadona",
    amount,
    year: Number(date.slice(0, 4)),
    month: Number(date.slice(5, 7)),
    person: "personal",
    ...overrides,
  });
}

beforeEach(async () => {
  await closeDatabase();
});

afterEach(async () => {
  await closeDatabase();
});

describe("sqlite schema and migrations", () => {
  test("creates the schema with settings defaults and seed data", async () => {
    const db = openClient();
    await getDatabase(db);

    const settings = await db.select<{ current_year: number }[]>(
      "SELECT current_year FROM settings",
    );
    expect(settings).toEqual([{ current_year: new Date().getFullYear() }]);

    const categories = await db.select<{ label: string; type: string }[]>(
      "SELECT label, type FROM categories ORDER BY id",
    );
    expect(categories).toHaveLength(6);
    expect(categories[0]).toEqual({ label: "Nómina", type: "income" });
    expect(categories[5]).toEqual({ label: "Hogar", type: "expense" });

    const persons = await db.select<{ label: string }[]>(
      "SELECT label FROM persons",
    );
    expect(persons).toEqual([{ label: "Personal" }]);
  });

  test("migrates a legacy database backfilling year, month and fingerprints", async () => {
    const raw = new DatabaseSync(":memory:");
    raw.exec(`
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        concept TEXT NOT NULL,
        amount REAL NOT NULL
      );
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1
      );
      CREATE TABLE persons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1
      );
      INSERT INTO transactions (date, type, category, concept, amount) VALUES
        ('2024-07-15', 'expense', 'casa', 'Recibo de luz', 45.5),
        ('2024-07-02', 'income', 'nomina', 'Nómina julio', 1400),
        ('2023-11-30', 'expense', 'ocio', 'Cine', 9.9);
      INSERT INTO categories (id, name, type, active) VALUES
        (1, 'Mi Casa', 'expense', 1),
        (2, 'Nómina', 'income', 0);
      INSERT INTO persons (id, name, active) VALUES (1, 'Personal', 1);
    `);
    const db = new NodeSqliteClient(raw);
    await getDatabase(db);

    const rows = await db.select<
      { date: string; year: number; month: number; person: string }[]
    >("SELECT date, year, month, person FROM transactions ORDER BY id");
    expect(rows).toEqual([
      { date: "2024-07-15", year: 2024, month: 7, person: "" },
      { date: "2024-07-02", year: 2024, month: 7, person: "" },
      { date: "2023-11-30", year: 2023, month: 11, person: "" },
    ]);

    const fingerprints = await db.select<{ fingerprint: string }[]>(
      "SELECT fingerprint FROM transactions ORDER BY id",
    );
    expect(fingerprints.map((f) => f.fingerprint)).toEqual([
      computeFingerprint({
        date: "2024-07-15",
        type: "expense",
        amount: 45.5,
        concept: "Recibo de luz",
        category: "casa",
        person: "",
      }),
      computeFingerprint({
        date: "2024-07-02",
        type: "income",
        amount: 1400,
        concept: "Nómina julio",
        category: "nomina",
        person: "",
      }),
      computeFingerprint({
        date: "2023-11-30",
        type: "expense",
        amount: 9.9,
        concept: "Cine",
        category: "ocio",
        person: "",
      }),
    ]);

    const categories = await db.select<
      { id: number; label: string; key: string; type: string; active: number }[]
    >("SELECT id, label, key, type, active FROM categories ORDER BY id");
    expect(categories).toEqual([
      { id: 1, label: "Mi Casa", key: "mi_casa", type: "expense", active: 1 },
      { id: 2, label: "Nómina", key: "nomina", type: "income", active: 0 },
    ]);

    const persons = await db.select<
      { id: number; label: string; key: string; active: number }[]
    >("SELECT id, label, key, active FROM persons");
    expect(persons).toEqual([
      { id: 1, label: "Personal", key: "personal", active: 1 },
    ]);
  });
});

describe("TauriTransactionRepository", () => {
  test("creates and reads a transaction back with a stored fingerprint", async () => {
    const db = openClient();
    await getDatabase(db);
    const repo = new TauriTransactionRepository();

    const created = await repo.create(makeTransaction("2026-08-06", 34.5));
    expect(created.id).toEqual(expect.any(Number));

    const found = await repo.getById(created.id as number);
    expect(found).not.toBeNull();
    expect(found?.date).toBe("2026-08-06");
    expect(found?.amount).toBe(34.5);
    expect(found?.year).toBe(2026);
    expect(found?.month).toBe(8);
    expect(found?.person).toBe("personal");

    const fingerprint = await db.select<{ fingerprint: string }[]>(
      "SELECT fingerprint FROM transactions WHERE id = ?",
      [created.id],
    );
    expect(fingerprint[0].fingerprint).toBe(
      computeFingerprint(found as Transaction),
    );
  });

  test("filters transactions combining period, type, category, person, amount and search", async () => {
    await getDatabase(openClient());
    const repo = new TauriTransactionRepository();

    await repo.create(makeTransaction("2026-08-03", 34.5));
    await repo.create(
      makeTransaction("2026-08-03", 1500, {
        type: "income",
        category: "nomina",
        concept: "Nómina",
      }),
    );
    await repo.create(
      makeTransaction("2026-08-10", 40, {
        category: "transporte",
        concept: "Gasolina",
      }),
    );
    await repo.create(makeTransaction("2026-09-02", 20));
    await repo.create(makeTransaction("2026-08-15", 34.5, { person: "" }));

    const result = await repo.getFiltered(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        types: ["expense"],
        categoryKeys: ["comida"],
        personKeys: ["personal"],
        minAmount: 30,
        maxAmount: 40,
        search: "mercado",
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].concept).toBe("Mercadona");
    expect(result[0].amount).toBe(34.5);
  });

  test("returns transactions by year-month and by exact date", async () => {
    await getDatabase(openClient());
    const repo = new TauriTransactionRepository();

    await repo.create(makeTransaction("2026-08-03", 34.5));
    await repo.create(makeTransaction("2026-08-02", 12));
    await repo.create(makeTransaction("2026-09-02", 20));

    const month = await repo.getByYearAndMonth(2026, 8);
    expect(month.map((t) => t.date)).toEqual(["2026-08-02", "2026-08-03"]);

    const day = await repo.getByDate("2026-08-02");
    expect(day).toHaveLength(1);
    expect(day[0].amount).toBe(12);
  });

  test("computes income, expense and balance summaries with monthly breakdowns", async () => {
    await getDatabase(openClient());
    const repo = new TauriTransactionRepository();

    await repo.create(makeTransaction("2026-07-01", 300));
    await repo.create(
      makeTransaction("2026-07-02", 200, {
        category: "ocio",
        concept: "Cine",
      }),
    );
    await repo.create(
      makeTransaction("2026-07-05", 1000, {
        type: "income",
        category: "nomina",
        concept: "Nómina",
      }),
    );
    await repo.create(makeTransaction("2026-08-02", 300, { concept: "Super" }));

    const result = await repo.getSummaryFiltered(
      TransactionFilters.create({
        period: { mode: "range", from: "2026-07-01", to: "2026-08-31" },
      }),
    );

    expect(result.summary).toEqual({
      income: 1000,
      expense: 800,
      balance: 200,
    });
    expect(result.categories).toEqual([
      { category: "comida", type: "expense", amount: 600 },
      { category: "ocio", type: "expense", amount: 200 },
      { category: "nomina", type: "income", amount: 1000 },
    ]);
    expect(result.monthly).toEqual([
      { month: 7, income: 1000, expense: 500, balance: 500 },
      { month: 8, income: 0, expense: 300, balance: -300 },
    ]);
    expect(result.annual).toEqual([
      { year: 2026, income: 1000, expense: 800, balance: 200 },
    ]);
  });

  test("aggregates a full year when no month is given", async () => {
    await getDatabase(openClient());
    const repo = new TauriTransactionRepository();

    await repo.create(makeTransaction("2025-01-10", 20));
    await repo.create(makeTransaction("2025-12-05", 5));
    await repo.create(makeTransaction("2026-01-01", 100));

    const result = await repo.getSummary(2025);
    expect(result.summary).toEqual({ income: 0, expense: 25, balance: -25 });
    expect(result.monthly).toEqual([
      { month: 1, income: 0, expense: 20, balance: -20 },
      { month: 12, income: 0, expense: 5, balance: -5 },
    ]);
  });

  test("updates a transaction recomputing its fingerprint and deletes it", async () => {
    const db = openClient();
    await getDatabase(db);
    const repo = new TauriTransactionRepository();

    const created = await repo.create(makeTransaction("2026-08-03", 34.5));
    await repo.update(
      created.withUpdates({ amount: 99.9, category: "ocio", concept: "Cine" }),
    );

    const found = await repo.getById(created.id as number);
    expect(found?.amount).toBe(99.9);
    expect(found?.category).toBe("ocio");

    const fingerprints = await db.select<{ fingerprint: string }[]>(
      "SELECT fingerprint FROM transactions WHERE id = ?",
      [created.id],
    );
    expect(fingerprints[0].fingerprint).toBe(
      computeFingerprint(found as Transaction),
    );

    await repo.delete(created.id as number);
    expect(await repo.getById(created.id as number)).toBeNull();
  });

  describe("TauriImportRepository", () => {
    test("confirms only the transactions whose fingerprint is new", async () => {
      await getDatabase(openClient());
      const transactionRepo = new TauriTransactionRepository();
      const importRepo = new TauriImportRepository();

      await transactionRepo.create(makeTransaction("2026-08-01", 10));
      const inserted = await importRepo.confirm([
        makeTransaction("2026-08-01", 10),
        makeTransaction("2026-08-02", 15),
      ]);
      expect(inserted).toBe(1);

      const newRow = await transactionRepo.getByDate("2026-08-02");
      expect(newRow).toHaveLength(1);
      expect(newRow[0].amount).toBe(15);

      const all = await transactionRepo.getByYearAndMonth(2026, 8);
      expect(all).toHaveLength(2);
    });
  });
});
