import { Settings } from "../domain/entities";
import type { SettingsRepository } from "../domain/repositories/SettingsRepository";
import { getDatabase } from "./db";

export class TauriSettingsRepository implements SettingsRepository {
  async get(): Promise<Settings> {
    const db = await getDatabase();
    const rows = await db.select<{ current_year: number; current_month: number; view_mode: string; theme: string }[]>(
      "SELECT * FROM settings WHERE id = 1"
    );
    const row = rows[0];
    return new Settings({
      currentYear: row.current_year,
      currentMonth: row.current_month,
      viewMode: row.view_mode as "monthly" | "annual",
      theme: row.theme as "light" | "dark" | "system",
    });
  }

  async setCurrentYear(year: number): Promise<void> {
    const db = await getDatabase();
    await db.execute("UPDATE settings SET current_year = ? WHERE id = 1", [year]);
  }

  async setCurrentMonth(month: number): Promise<void> {
    const db = await getDatabase();
    await db.execute("UPDATE settings SET current_month = ? WHERE id = 1", [month]);
  }

  async setViewMode(mode: "monthly" | "annual"): Promise<void> {
    const db = await getDatabase();
    await db.execute("UPDATE settings SET view_mode = ? WHERE id = 1", [mode]);
  }

  async setTheme(theme: "light" | "dark" | "system"): Promise<void> {
    const db = await getDatabase();
    await db.execute("UPDATE settings SET theme = ? WHERE id = 1", [theme]);
  }
}
