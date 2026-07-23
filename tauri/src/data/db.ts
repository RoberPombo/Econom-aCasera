import Database from "@tauri-apps/plugin-sql";

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
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      active INTEGER NOT NULL DEFAULT 1
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
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

  await seedDefaults(db);
}

async function seedDefaults(db: Database): Promise<void> {
  const categories = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM categories");
  if (categories[0].count === 0) {
    await db.execute(`
      INSERT INTO categories (name, type, active) VALUES
      ('Nómina', 'income', 1),
      ('Freelance', 'income', 1),
      ('Comida', 'expense', 1),
      ('Transporte', 'expense', 1),
      ('Ocio', 'expense', 1),
      ('Hogar', 'expense', 1)
    `);
  }

  const persons = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM persons");
  if (persons[0].count === 0) {
    await db.execute(`
      INSERT INTO persons (name, active) VALUES
      ('Personal', 1)
    `);
  }
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}
