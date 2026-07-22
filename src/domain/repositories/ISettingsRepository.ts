import type { Settings } from "../entities";

export interface ISettingsRepository {
  get(): Settings;
  setCurrentYear(year: number): void;
  setCurrentMonth(month: number): void;
  setViewMode(mode: "monthly" | "annual"): void;
}
