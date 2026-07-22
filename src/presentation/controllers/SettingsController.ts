import type { AppContainer } from "../../application/AppContainer";

export class SettingsController {
  constructor(private readonly container: AppContainer) {}

  private getSettings() {
    return this.container.settingsUseCases.get();
  }

  get(): Response {
    return Response.json(this.getSettings());
  }

  getYear(): Response {
    return Response.json({ year: this.getSettings().currentYear });
  }

  getMonth(): Response {
    return Response.json({ month: this.getSettings().currentMonth });
  }

  getViewMode(): Response {
    return Response.json({ mode: this.getSettings().viewMode });
  }

  year(year: number): Response {
    this.container.checkConflict();
    this.container.settingsUseCases.setCurrentYear(year);
    this.container.afterWrite();
    return Response.json({ year });
  }

  month(month: number): Response {
    this.container.checkConflict();
    this.container.settingsUseCases.setCurrentMonth(month);
    this.container.afterWrite();
    return Response.json({ month });
  }

  viewMode(mode: "monthly" | "annual"): Response {
    this.container.checkConflict();
    this.container.settingsUseCases.setViewMode(mode);
    this.container.afterWrite();
    return Response.json({ mode });
  }
}
