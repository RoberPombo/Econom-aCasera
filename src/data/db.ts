import Database from "@tauri-apps/plugin-sql";
import { normalizeKey } from "../domain/entities/Key";

let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;
  dbInstance = await Database.load("sqlite:economiacasera.db");
  await initDatabase(dbInstance);
  return dbInstance;
}

async function initDatabase(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_year INTEGER NOT NULL DEFAULT ${new Date().getFullYear()},
      current_month INTEGER NOT NULL DEFAULT 1,
      view_mode TEXT NOT NULL DEFAULT 'monthly',
      theme TEXT NOT NULL DEFAULT 'system'
    )
  `);

  await db.execute(`
    INSERT OR IGNORE INTO settings (id, current_year, current_month, view_mode, theme)
    VALUES (1, ${new Date().getFullYear()}, 1, 'monthly', 'system')
  `);

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

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_year_month ON transactions(year, month)
  `);

  await migrateDatabase(db);
  await seedDefaults(db);
}

async function migrateDatabase(db: Database): Promise<void> {
  await migrateConfigTable(db, "categories", ["type"]);
  await migrateConfigTable(db, "persons", []);

  try {
    await db.execute(`ALTER TABLE transactions ADD COLUMN fingerprint TEXT`);
  } catch {
    // Column already exists.
  }

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_transactions_fingerprint ON transactions(fingerprint)
  `);

  await db.execute(`
    UPDATE transactions
    SET fingerprint = date || '|' || type || '|' || CAST(ROUND(amount * 100) AS INTEGER) || '|' || concept || '|' || category || '|' || COALESCE(person, '')
    WHERE fingerprint IS NULL
  `);
}

async function migrateConfigTable(db: Database, table: string, extraColumns: string[]): Promise<void> {
  const columns = await db.select<{ name: string }[]>(`PRAGMA table_info(${table})`);
  if (columns.some((c) => c.name === "label")) return;

  const extraDefs = extraColumns.map((col) => `${col} TEXT`).join(", ");
  const extraSelect = extraColumns.length > 0 ? `, ${extraColumns.join(", ")}` : "";

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
    `SELECT id, name${extraSelect}, active FROM ${table}`
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
    const params = [row.id, label, key, ...extraColumns.map((col) => row[col]), row.active];
    await db.execute(
      `INSERT INTO ${table}_new (id, label, key${extras}, active) VALUES (?, ?, ?${extraValues}, ?)`,
      params
    );
  }

  await db.execute(`DROP TABLE ${table}`);
  await db.execute(`ALTER TABLE ${table}_new RENAME TO ${table}`);
}

async function keyExists(db: Database, table: string, key: string): Promise<boolean> {
  const result = await db.select<{ count: number }[]>(
    `SELECT COUNT(*) as count FROM ${table} WHERE key = ?`,
    [key]
  );
  return result[0].count > 0;
}

async function seedDefaults(db: Database): Promise<void> {
  const categories = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM categories");
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

  const persons = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM persons");
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
