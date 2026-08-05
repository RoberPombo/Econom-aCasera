import type { Settings, ViewMode, Theme } from "../entities";

export interface SettingsRepository {
  get(): Promise<Settings>;
  setCurrentYear(year: number): Promise<void>;
  setCurrentMonth(month: number): Promise<void>;
  setViewMode(mode: ViewMode): Promise<void>;
  setTheme(theme: Theme): Promise<void>;
}
