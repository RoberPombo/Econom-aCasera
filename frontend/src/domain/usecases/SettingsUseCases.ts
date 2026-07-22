import type { ViewMode } from "../entities";
import type { SettingsRepository } from "../repositories/SettingsRepository";

export class GetSettingsUseCase {
  constructor(private readonly repository: SettingsRepository) {}

  async execute() {
    return this.repository.get();
  }
}

export class UpdateSettingsUseCase {
  constructor(private readonly repository: SettingsRepository) {}

  async setYear(year: number): Promise<void> {
    return this.repository.setCurrentYear(year);
  }

  async setMonth(month: number): Promise<void> {
    return this.repository.setCurrentMonth(month);
  }

  async setViewMode(mode: ViewMode): Promise<void> {
    return this.repository.setViewMode(mode);
  }
}
