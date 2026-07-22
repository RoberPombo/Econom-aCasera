import { Settings } from "../domain/entities";
import type { ViewMode, Theme } from "../domain/entities";
import type { SettingsRepository } from "../domain/repositories/SettingsRepository";

export class ApiSettingsRepository implements SettingsRepository {
  private async api<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json();
  }

  async get(): Promise<Settings> {
    const [year, month, mode, theme] = await Promise.all([
      this.api<{ year: number }>("/year"),
      this.api<{ month: number }>("/month"),
      this.api<{ mode: ViewMode }>("/view-mode"),
      this.api<{ theme: Theme }>("/theme"),
    ]);
    return new Settings({
      currentYear: year.year,
      currentMonth: month.month,
      viewMode: mode.mode,
      theme: theme.theme,
    });
  }

  async setCurrentYear(year: number): Promise<void> {
    await this.api("/year", {
      method: "POST",
      body: JSON.stringify({ year }),
    });
  }

  async setCurrentMonth(month: number): Promise<void> {
    await this.api("/month", {
      method: "POST",
      body: JSON.stringify({ month }),
    });
  }

  async setViewMode(mode: ViewMode): Promise<void> {
    await this.api("/view-mode", {
      method: "POST",
      body: JSON.stringify({ mode }),
    });
  }

  async setTheme(theme: Theme): Promise<void> {
    await this.api("/theme", {
      method: "POST",
      body: JSON.stringify({ theme }),
    });
  }
}
