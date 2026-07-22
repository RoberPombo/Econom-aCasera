import { Database } from "bun:sqlite";
import { Transaction, Summary, CategorySummary, Category } from "./types";
import { getDbLocation, copyIfNewer, getFileModTime } from "./utils";

const { dbPath, backupPath, usesDrive, driveFolder } = getDbLocation();
export { dbPath, backupPath, usesDrive, driveFolder };

// Decidir qué base de datos usar al inicio
function resolveDatabasePath(): string {
  const localExists = require("fs").existsSync(dbPath);
  const backupExists = require("fs").existsSync(backupPath);

  if (usesDrive) {
    if (localExists && backupExists) {
      const localTime = getFileModTime(dbPath);
      const backupTime = getFileModTime(backupPath);
      if (backupTime && localTime && backupTime > localTime) {
        console.log("La copia local de seguridad es más reciente que Google Drive. Se usa la copia local.");
        return backupPath;
      }
    }
    // Si existe en Drive, usar Drive (o copiar de backup si backup es más reciente)
    if (localExists) {
      // Hacer backup local por si acaso
      copyIfNewer(dbPath, backupPath);
      return dbPath;
    }
    if (backupExists) {
      // Restaurar desde backup local a Drive
      copyIfNewer(backupPath, dbPath);
      return dbPath;
    }
    return dbPath;
  }

  // Sin Drive: usar local, restaurar desde backup si backup es más reciente
  if (backupExists && localExists) {
    const localTime = getFileModTime(dbPath);
    const backupTime = getFileModTime(backupPath);
    if (backupTime && localTime && backupTime > localTime) {
      copyIfNewer(backupPath, dbPath);
    }
  } else if (backupExists && !localExists) {
    copyIfNewer(backupPath, dbPath);
  }

  return dbPath;
}

const resolvedDbPath = resolveDatabasePath();
export const activeDbPath = resolvedDbPath;

const db = new Database(resolvedDbPath);

function migrate() {
  db.run(`CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const applied = new Set(
    (db.query("SELECT name FROM _migrations").all() as { name: string }[]).map((r) => r.name)
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
        db.run(m.sql);
        db.run("INSERT INTO _migrations (name) VALUES (?)", [m.name]);
      } catch (e) {
        console.error(`Error en migración ${m.name}:`, e);
        throw e;
      }
    }
  }
}

migrate();

db.run(
  "INSERT OR IGNORE INTO settings (key, current_year, current_month, view_mode) VALUES ('default', ?, ?, 'monthly')",
  [new Date().getFullYear(), new Date().getMonth() + 1]
);

// Categorías por defecto
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
  db.run(
    "INSERT OR IGNORE INTO categories (name, type, active) VALUES (?, ?, 1)",
    [cat.name, cat.type]
  );
}

export function getCurrentYear(): number {
  const row = db.query("SELECT current_year FROM settings WHERE key = 'default'").get() as { current_year: number } | null;
  return row?.current_year ?? new Date().getFullYear();
}

export function setCurrentYear(year: number): void {
  db.run(
    "INSERT INTO settings (key, current_year, current_month, view_mode) VALUES ('default', ?, 1, 'monthly') ON CONFLICT(key) DO UPDATE SET current_year = excluded.current_year",
    [year]
  );
}

export function getCurrentMonth(): number {
  const row = db.query("SELECT current_month FROM settings WHERE key = 'default'").get() as { current_month: number } | null;
  return row?.current_month ?? new Date().getMonth() + 1;
}

export function setCurrentMonth(month: number): void {
  db.run(
    "INSERT INTO settings (key, current_year, current_month, view_mode) VALUES ('default', 2026, ?, 'monthly') ON CONFLICT(key) DO UPDATE SET current_month = excluded.current_month",
    [month]
  );
}

export function getViewMode(): "monthly" | "annual" {
  const row = db.query("SELECT view_mode FROM settings WHERE key = 'default'").get() as { view_mode: string } | null;
  return (row?.view_mode as "monthly" | "annual") ?? "monthly";
}

export function setViewMode(mode: "monthly" | "annual"): void {
  db.run(
    "INSERT INTO settings (key, current_year, current_month, view_mode) VALUES ('default', 2026, 1, ?) ON CONFLICT(key) DO UPDATE SET view_mode = excluded.view_mode",
    [mode]
  );
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
  const date = new Date(t.date);
  const year = t.year || date.getFullYear();
  const month = t.month || date.getMonth() + 1;
  const result = db.run(
    "INSERT INTO transactions (date, type, category, concept, amount, year, month) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [t.date, t.type, t.category, t.concept, t.amount, year, month]
  );
  syncToBackup();
  return { ...t, id: Number(result.lastInsertRowid), year, month };
}

export function updateTransaction(t: Transaction): Transaction {
  if (!t.id) throw new Error("id is required");
  const date = new Date(t.date);
  const year = t.year || date.getFullYear();
  const month = t.month || date.getMonth() + 1;
  db.run(
    "UPDATE transactions SET date = ?, type = ?, category = ?, concept = ?, amount = ?, year = ?, month = ? WHERE id = ?",
    [t.date, t.type, t.category, t.concept, t.amount, year, month, t.id]
  );
  syncToBackup();
  return { ...t, year, month };
}

export function deleteTransaction(id: number): void {
  db.run("DELETE FROM transactions WHERE id = ?", [id]);
  syncToBackup();
}

function syncToBackup() {
  if (usesDrive) {
    // Si la BD principal está en Drive, mantener una copia local de seguridad
    copyIfNewer(dbPath, backupPath);
  } else {
    // Si no hay Drive, mantener backup local
    copyIfNewer(dbPath, backupPath);
  }
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
  const result = db.run("INSERT INTO categories (name, type, active) VALUES (?, ?, 1)", [name, type]);
  syncToBackup();
  return { id: Number(result.lastInsertRowid), name, type, active: 1 };
}

export function updateCategory(id: number, name: string, type: "income" | "expense", active: number): void {
  db.run("UPDATE categories SET name = ?, type = ?, active = ? WHERE id = ?", [name, type, active, id]);
  syncToBackup();
}

export function deleteCategory(id: number): void {
  db.run("DELETE FROM categories WHERE id = ?", [id]);
  syncToBackup();
}

export function close(): void {
  db.close();
}
