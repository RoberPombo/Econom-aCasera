import type { Settings, ViewMode } from "../entities";

export interface SettingsRepository {
  get(): Promise<Settings>;
  setCurrentYear(year: number): Promise<void>;
  setCurrentMonth(month: number): Promise<void>;
  setViewMode(mode: ViewMode): Promise<void>;
}
