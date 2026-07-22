import { Database } from "bun:sqlite";

export class SQLiteDatabase {
  private db: Database;

  constructor(private readonly path: string) {
    this.db = new Database(path);
    this.migrate();
    this.seed();
  }

  get connection(): Database {
    return this.db;
  }

  close(): void {
    this.db.close();
  }

  private migrate(): void {
    this.db.run(`CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);

    const applied = new Set(
      (this.db.query("SELECT name FROM _migrations").all() as { name: string }[]).map((r) => r.name)
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
      {
        name: "v4_theme",
        sql: `
          ALTER TABLE settings ADD COLUMN theme TEXT NOT NULL DEFAULT 'system';
        `,
      },
    ];

    for (const m of migrations) {
      if (!applied.has(m.name)) {
        this.db.run(m.sql);
        this.db.run("INSERT INTO _migrations (name) VALUES (?)", [m.name]);
      }
    }
  }

  private seed(): void {
    this.db.run(
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
      this.db.run(
        "INSERT OR IGNORE INTO categories (name, type, active) VALUES (?, ?, 1)",
        [cat.name, cat.type]
      );
    }
  }
}
