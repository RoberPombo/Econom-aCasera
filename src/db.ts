import { Database } from "bun:sqlite";
import { existsSync, statSync, copyFileSync } from "fs";
import { Transaction, Summary, CategorySummary, Category } from "./types";
import { getDbLocation, copyIfNewer, getFileModTime } from "./utils";
import { initSyncTracking, updateSyncTimestamp, checkExternalChange, refreshLastKnownTimestamp, copyDatabase } from "./sync";

const { dbPath: initialDbPath, backupPath, usesDrive, driveFolder } = getDbLocation();
export { initialDbPath as dbPath, backupPath, usesDrive, driveFolder };

let currentDbPath = initialDbPath;
let db = createDatabaseConnection(currentDbPath);

function createDatabaseConnection(databasePath: string): Database {
  const conn = new Database(databasePath);
  runMigrations(conn);
  seedDefaults(conn);
  initSyncTracking();
  return conn;
}

function runMigrations(conn: Database) {
  conn.run(`CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const applied = new Set(
    (conn.query("SELECT name FROM _migrations").all() as { name: string }[]).map((r) => r.name)
  );

  const migrations: { name: string; sql: string }[] = [
    {
      name: "v1_initial",
      sql: `
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          concept TEXT NOT NULL,
          amount REAL NOT NULL,
          year INTEGER NOT NULL,
          month INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          current_year INTEGER NOT NULL
        );
        INSERT OR IGNORE INTO settings (key, current_year) VALUES ('default', ${new Date().getFullYear()});
      `,
    },
    {
      name: "v2_settings_month_view",
      sql: `
        ALTER TABLE settings ADD COLUMN current_month INTEGER NOT NULL DEFAULT 1;
        ALTER TABLE settings ADD COLUMN view_mode TEXT NOT NULL DEFAULT 'monthly';
      `,
    },
    {
      name: "v3_categories",
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          type TEXT NOT NULL,
          active INTEGER NOT NULL DEFAULT 1
        );
      `,
    },
  ];

  for (const m of migrations) {
    if (!applied.has(m.name)) {
      try {
        conn.run(m.sql);
        conn.run("INSERT INTO _migrations (name) VALUES (?)", [m.name]);
      } catch (e) {
        console.error(`Error en migración ${m.name}:`, e);
        throw e;
      }
    }
  }
}

function seedDefaults(conn: Database) {
  conn.run(
    "INSERT OR IGNORE INTO settings (key, current_year, current_month, view_mode) VALUES ('default', ?, ?, 'monthly')",
    [new Date().getFullYear(), new Date().getMonth() + 1]
  );

  const defaultCategories: { name: string; type: "income" | "expense" }[] = [
    { name: "Nóminas", type: "income" },
    { name: "Ingresos por intereses", type: "income" },
    { name: "Dividendos", type: "income" },
    { name: "Ganancias patrimoniales", type: "income" },
    { name: "Becas y subvenciones", type: "income" },
    { name: "Ingresos extraordinarios", type: "income" },
    { name: "Apuestas y juego", type: "income" },
    { name: "Bonificaciones", type: "income" },
    { name: "Vivienda", type: "expense" },
    { name: "Alimentación", type: "expense" },
    { name: "Transporte", type: "expense" },
    { name: "Salud", type: "expense" },
    { name: "Ocio", type: "expense" },
    { name: "Educación", type: "expense" },
    { name: "Otros gastos", type: "expense" },
  ];

  for (const cat of defaultCategories) {
    conn.run(
      "INSERT OR IGNORE INTO categories (name, type, active) VALUES (?, ?, 1)",
      [cat.name, cat.type]
    );
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

function checkConflict() {
  if (checkExternalChange()) {
    throw new ConflictError("Los datos han cambiado en otro dispositivo. Recarga o fuerza la sobrescritura.");
  }
}

function afterWrite() {
  updateSyncTimestamp();
  if (usesDrive) {
    copyIfNewer(currentDbPath, backupPath);
  } else {
    copyIfNewer(currentDbPath, backupPath);
  }
}

export function reloadDatabase(): { dbPath: string; usesDrive: boolean } {
  db.close();
  const location = getDbLocation();
  currentDbPath = location.dbPath;
  db = createDatabaseConnection(currentDbPath);
  return { dbPath: currentDbPath, usesDrive: location.usesDrive };
}

export function forceOverwrite(): { dbPath: string; usesDrive: boolean } {
  if (usesDrive) {
    // Sobrescribir la BD de Drive con la copia local de seguridad
    copyDatabase(backupPath, currentDbPath);
  } else {
    // Sobrescribir la BD local con la copia de seguridad
    copyDatabase(backupPath, currentDbPath);
  }
  refreshLastKnownTimestamp();
  return { dbPath: currentDbPath, usesDrive };
}

export function getDbInfo() {
  return {
    dbPath: currentDbPath,
    backupPath,
    usesDrive,
    driveFolder,
  };
}

export function getCurrentYear(): number {
  const row = db.query("SELECT current_year FROM settings WHERE key = 'default'").get() as { current_year: number } | null;
  return row?.current_year ?? new Date().getFullYear();
}

export function setCurrentYear(year: number): void {
  checkConflict();
  db.run(
    "INSERT INTO settings (key, current_year, current_month, view_mode) VALUES ('default', ?, 1, 'monthly') ON CONFLICT(key) DO UPDATE SET current_year = excluded.current_year",
    [year]
  );
  afterWrite();
}

export function getCurrentMonth(): number {
  const row = db.query("SELECT current_month FROM settings WHERE key = 'default'").get() as { current_month: number } | null;
  return row?.current_month ?? new Date().getMonth() + 1;
}

export function setCurrentMonth(month: number): void {
  checkConflict();
  db.run(
    "INSERT INTO settings (key, current_year, current_month, view_mode) VALUES ('default', 2026, ?, 'monthly') ON CONFLICT(key) DO UPDATE SET current_month = excluded.current_month",
    [month]
  );
  afterWrite();
}

export function getViewMode(): "monthly" | "annual" {
  const row = db.query("SELECT view_mode FROM settings WHERE key = 'default'").get() as { view_mode: string } | null;
  return (row?.view_mode as "monthly" | "annual") ?? "monthly";
}

export function setViewMode(mode: "monthly" | "annual"): void {
  checkConflict();
  db.run(
    "INSERT INTO settings (key, current_year, current_month, view_mode) VALUES ('default', 2026, 1, ?) ON CONFLICT(key) DO UPDATE SET view_mode = excluded.view_mode",
    [mode]
  );
  afterWrite();
}

export function listTransactions(year: number, month?: number): Transaction[] {
  if (month) {
    return db
      .query("SELECT id, date, type, category, concept, amount, year, month FROM transactions WHERE year = ? AND month = ? ORDER BY date DESC, id DESC")
      .all(year, month) as Transaction[];
  }
  return db
    .query("SELECT id, date, type, category, concept, amount, year, month FROM transactions WHERE year = ? ORDER BY date DESC, id DESC")
    .all(year) as Transaction[];
}

export function createTransaction(t: Transaction): Transaction {
  checkConflict();
  const date = new Date(t.date);
  const year = t.year || date.getFullYear();
  const month = t.month || date.getMonth() + 1;
  const result = db.run(
    "INSERT INTO transactions (date, type, category, concept, amount, year, month) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [t.date, t.type, t.category, t.concept, t.amount, year, month]
  );
  afterWrite();
  return { ...t, id: Number(result.lastInsertRowid), year, month };
}

export function updateTransaction(t: Transaction): Transaction {
  checkConflict();
  if (!t.id) throw new Error("id is required");
  const date = new Date(t.date);
  const year = t.year || date.getFullYear();
  const month = t.month || date.getMonth() + 1;
  db.run(
    "UPDATE transactions SET date = ?, type = ?, category = ?, concept = ?, amount = ?, year = ?, month = ? WHERE id = ?",
    [t.date, t.type, t.category, t.concept, t.amount, year, month, t.id]
  );
  afterWrite();
  return { ...t, year, month };
}

export function deleteTransaction(id: number): void {
  checkConflict();
  db.run("DELETE FROM transactions WHERE id = ?", [id]);
  afterWrite();
}

export function getSummary(year: number, month?: number): Summary {
  let row;
  if (month) {
    row = db
      .query(
        `SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions WHERE year = ? AND month = ?`
      )
      .get(year, month) as { income: number; expense: number };
  } else {
    row = db
      .query(
        `SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions WHERE year = ?`
      )
      .get(year) as { income: number; expense: number };
  }
  const income = Math.round((row.income || 0) * 100) / 100;
  const expense = Math.round((row.expense || 0) * 100) / 100;
  return { income, expense, balance: Math.round((income - expense) * 100) / 100 };
}

export function getCategories(year: number, month?: number): CategorySummary[] {
  if (month) {
    return db
      .query("SELECT category, type, SUM(amount) AS amount FROM transactions WHERE year = ? AND month = ? GROUP BY category, type ORDER BY amount DESC")
      .all(year, month) as CategorySummary[];
  }
  return db
    .query("SELECT category, type, SUM(amount) AS amount FROM transactions WHERE year = ? GROUP BY category, type ORDER BY amount DESC")
    .all(year) as CategorySummary[];
}

export function getMonthlySummary(year: number): { month: number; income: number; expense: number; balance: number }[] {
  const rows = db
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
    income: Math.round(r.income * 100) / 100,
    expense: Math.round(r.expense * 100) / 100,
    balance: Math.round((r.income - r.expense) * 100) / 100,
  }));
}

export function getAnnualSummary(): { year: number; income: number; expense: number; balance: number }[] {
  const rows = db
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
    income: Math.round(r.income * 100) / 100,
    expense: Math.round(r.expense * 100) / 100,
    balance: Math.round((r.income - r.expense) * 100) / 100,
  }));
}

export function listCategories(): Category[] {
  return db
    .query("SELECT id, name, type, active FROM categories ORDER BY type, name")
    .all() as Category[];
}

export function createCategory(name: string, type: "income" | "expense"): Category {
  checkConflict();
  const result = db.run("INSERT INTO categories (name, type, active) VALUES (?, ?, 1)", [name, type]);
  afterWrite();
  return { id: Number(result.lastInsertRowid), name, type, active: 1 };
}

export function updateCategory(id: number, name: string, type: "income" | "expense", active: number): void {
  checkConflict();
  db.run("UPDATE categories SET name = ?, type = ?, active = ? WHERE id = ?", [name, type, active, id]);
  afterWrite();
}

export function deleteCategory(id: number): void {
  checkConflict();
  db.run("DELETE FROM categories WHERE id = ?", [id]);
  afterWrite();
}

export function close(): void {
  db.close();
}
