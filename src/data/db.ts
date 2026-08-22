import Database from "@tauri-apps/plugin-sql";
import { normalizeKey } from "../domain/entities/Key";
import { computeFingerprint } from "./computeFingerprint";

export type DbClient = Pick<Database, "execute" | "select" | "close">;

let dbInstance: DbClient | null = null;

export async function getDatabase(client?: DbClient): Promise<DbClient> {
  if (dbInstance) return dbInstance;
  dbInstance = client ?? (await Database.load("sqlite:economiacasera.db"));
  await initDatabase(dbInstance);
  return dbInstance;
}

async function initDatabase(db: DbClient): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_year INTEGER NOT NULL DEFAULT ${new Date().getFullYear()},
      current_month INTEGER NOT NULL DEFAULT ${new Date().getMonth() + 1},
      view_mode TEXT NOT NULL DEFAULT 'monthly',
      theme TEXT NOT NULL DEFAULT 'system'
    )
  `);

  await db.execute(`
    INSERT OR IGNORE INTO settings (id, current_year, current_month, view_mode, theme)
    VALUES (1, ${new Date().getFullYear()}, ${new Date().getMonth() + 1}, 'monthly', 'system')
  `);

  // Always land on the real current month/year when the app starts, even if
  // a previous session left the view on a different period (e.g. the user
  // closed the app in one month and reopened it in the next one).
  await db.execute(
    `UPDATE settings SET current_year = ?, current_month = ? WHERE id = 1`,
    [new Date().getFullYear(), new Date().getMonth() + 1],
  );

  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      key TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      key TEXT NOT NULL UNIQUE,
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      category TEXT NOT NULL,
      concept TEXT NOT NULL,
      amount REAL NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      person TEXT DEFAULT ''
    )
  `);

  await migrateDatabase(db);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_year_month ON transactions(year, month)
  `);

  await seedDefaults(db);
}

async function migrateDatabase(db: DbClient): Promise<void> {
  await migrateTransactionsColumns(db);
  await migrateConfigTable(db, "categories", ["type"]);
  await migrateConfigTable(db, "persons", []);

  try {
    await db.execute(`ALTER TABLE transactions ADD COLUMN fingerprint TEXT`);
  } catch {
    // Column already exists.
  }

  try {
    await db.execute(`ALTER TABLE transactions ADD COLUMN receipt_path TEXT`);
  } catch {
    // Column already exists.
  }

  await migrateTransactionsType(db);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_fingerprint ON transactions(fingerprint)
  `);

  const rows = await db.select<
    {
      id: number;
      date: string;
      type: string;
      amount: number;
      concept: string;
      category: string;
      person: string;
    }[]
  >(
    "SELECT id, date, type, amount, concept, category, COALESCE(person, '') as person FROM transactions",
  );
  for (const row of rows) {
    const fingerprint = computeFingerprint(row);
    await db.execute("UPDATE transactions SET fingerprint = ? WHERE id = ?", [
      fingerprint,
      row.id,
    ]);
  }
}

async function migrateTransactionsType(db: DbClient): Promise<void> {
  const tables = await db.select<{ sql: string | null }[]>(
    `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'transactions'`,
  );
  const current = tables[0]?.sql ?? "";
  if (current.includes("savings")) return;

  await db.execute(`
    CREATE TABLE transactions_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'savings')),
      category TEXT NOT NULL,
      concept TEXT NOT NULL,
      amount REAL NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      person TEXT DEFAULT '',
      fingerprint TEXT,
      receipt_path TEXT
    )
  `);
  await db.execute(`
    INSERT INTO transactions_new (id, date, type, category, concept, amount, year, month, person, fingerprint, receipt_path)
    SELECT id, date, type, category, concept, amount, year, month, COALESCE(person, ''), fingerprint, receipt_path
    FROM transactions
  `);
  await db.execute(`DROP TABLE transactions`);
  await db.execute(`ALTER TABLE transactions_new RENAME TO transactions`);
}

async function migrateTransactionsColumns(db: DbClient): Promise<void> {
  const columns = await db.select<{ name: string }[]>(
    `PRAGMA table_info(transactions)`,
  );
  const hasYear = columns.some((c) => c.name === "year");

  if (!hasYear) {
    await db.execute(
      `ALTER TABLE transactions ADD COLUMN year INTEGER NOT NULL DEFAULT 0`,
    );
    await db.execute(
      `ALTER TABLE transactions ADD COLUMN month INTEGER NOT NULL DEFAULT 0`,
    );
  }

  if (!columns.some((c) => c.name === "person")) {
    await db.execute(
      `ALTER TABLE transactions ADD COLUMN person TEXT DEFAULT ''`,
    );
  }

  if (!hasYear) {
    await db.execute(`
      UPDATE transactions
      SET year = CAST(substr(date, 1, 4) AS INTEGER),
          month = CAST(substr(date, 6, 2) AS INTEGER),
          person = COALESCE(person, '')
      WHERE year = 0 OR month = 0
    `);
  }
}

async function migrateConfigTable(
  db: DbClient,
  table: string,
  extraColumns: string[],
): Promise<void> {
  const columns = await db.select<{ name: string }[]>(
    `PRAGMA table_info(${table})`,
  );
  if (columns.some((c) => c.name === "label")) return;

  const extraDefs = extraColumns.map((col) => `${col} TEXT`).join(", ");
  const extraSelect =
    extraColumns.length > 0 ? `, ${extraColumns.join(", ")}` : "";

  await db.execute(`
    CREATE TABLE IF NOT EXISTS ${table}_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      key TEXT NOT NULL UNIQUE
      ${extraDefs ? `, ${extraDefs}` : ""},
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  const rows = await db.select<Record<string, string | number>[]>(
    `SELECT id, name${extraSelect}, active FROM ${table}`,
  );

  for (const row of rows) {
    const label = String(row.name).trim();
    const baseKey = normalizeKey(label);
    let key = baseKey;
    let attempt = 1;
    while (await keyExists(db, `${table}_new`, key)) {
      attempt += 1;
      key = `${baseKey}_${attempt}`;
    }
    const extras = extraColumns.map((col) => `, ${col}`).join("");
    const extraValues = extraColumns.map(() => ", ?").join("");
    const params = [
      row.id,
      label,
      key,
      ...extraColumns.map((col) => row[col]),
      row.active,
    ];
    await db.execute(
      `INSERT INTO ${table}_new (id, label, key${extras}, active) VALUES (?, ?, ?${extraValues}, ?)`,
      params,
    );
  }

  await db.execute(`DROP TABLE ${table}`);
  await db.execute(`ALTER TABLE ${table}_new RENAME TO ${table}`);
}

async function keyExists(
  db: DbClient,
  table: string,
  key: string,
): Promise<boolean> {
  const result = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM ${table} WHERE key = ?`,
    [key],
  );
  return result[0].count > 0;
}

async function seedDefaults(db: DbClient): Promise<void> {
  const categories = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM categories",
  );
  if (categories[0].count === 0) {
    await db.execute(`
      INSERT INTO categories (label, key, type, active) VALUES
      ('Nómina', 'nomina', 'income', 1),
      ('Freelance', 'freelance', 'income', 1),
      ('Comida', 'comida', 'expense', 1),
      ('Transporte', 'transporte', 'expense', 1),
      ('Ocio', 'ocio', 'expense', 1),
      ('Hogar', 'hogar', 'expense', 1)
    `);
  }

  const persons = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM persons",
  );
  if (persons[0].count === 0) {
    await db.execute(`
      INSERT INTO persons (label, key, active) VALUES
      ('Personal', 'personal', 1)
    `);
  }
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}
