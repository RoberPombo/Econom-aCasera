import type { Settings, Theme } from "../entities";
import type { ISettingsRepository } from "../repositories/ISettingsRepository";

export class SettingsUseCases {
  constructor(private readonly repository: ISettingsRepository) {}

  get(): Settings {
    return this.repository.get();
  }

  setCurrentYear(year: number): void {
    this.repository.setCurrentYear(year);
  }

  setCurrentMonth(month: number): void {
    this.repository.setCurrentMonth(month);
  }

  setViewMode(mode: "monthly" | "annual"): void {
    this.repository.setViewMode(mode);
  }

  setTheme(theme: Theme): void {
    this.repository.setTheme(theme);
  }
}
