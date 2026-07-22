import type { Settings } from "../../domain/entities";
import type { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import type { SQLiteDatabase } from "../database/SQLiteDatabase";

export class SQLiteSettingsRepository implements ISettingsRepository {
  constructor(private readonly database: SQLiteDatabase) {}

  private get db() {
    return this.database.connection;
  }

  get(): Settings {
    const row = this.db.query("SELECT current_year, current_month, view_mode FROM settings WHERE key = 'default'").get() as {
      current_year: number;
      current_month: number;
      view_mode: string;
    } | null;

    return {
      currentYear: row?.current_year ?? new Date().getFullYear(),
      currentMonth: row?.current_month ?? new Date().getMonth() + 1,
      viewMode: (row?.view_mode as "monthly" | "annual") ?? "monthly",
    };
  }

  setCurrentYear(year: number): void {
    this.db.run(
      "INSERT INTO settings (key, current_year, current_month, view_mode) VALUES ('default', ?, 1, 'monthly') ON CONFLICT(key) DO UPDATE SET current_year = excluded.current_year",
      [year]
    );
  }

  setCurrentMonth(month: number): void {
    this.db.run(
      "INSERT INTO settings (key, current_year, current_month, view_mode) VALUES ('default', 2026, ?, 'monthly') ON CONFLICT(key) DO UPDATE SET current_month = excluded.current_month",
      [month]
    );
  }

  setViewMode(mode: "monthly" | "annual"): void {
    this.db.run(
      "INSERT INTO settings (key, current_year, current_month, view_mode) VALUES ('default', 2026, 1, ?) ON CONFLICT(key) DO UPDATE SET view_mode = excluded.view_mode",
      [mode]
    );
  }
}
