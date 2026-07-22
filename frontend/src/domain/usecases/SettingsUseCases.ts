import type { Settings } from "../entities";
import type { SettingsRepository } from "../repositories/SettingsRepository";

export class GetSettingsUseCase {
  private readonly repository: SettingsRepository;

  constructor(repository: SettingsRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Settings> {
    return this.repository.get();
  }
}

export class UpdateSettingsUseCase {
  private readonly repository: SettingsRepository;

  constructor(repository: SettingsRepository) {
    this.repository = repository;
  }

  async setYear(year: number): Promise<void> {
    await this.repository.setCurrentYear(year);
  }

  async setMonth(month: number): Promise<void> {
    await this.repository.setCurrentMonth(month);
  }

  async setViewMode(mode: "monthly" | "annual"): Promise<void> {
    await this.repository.setViewMode(mode);
  }
}
