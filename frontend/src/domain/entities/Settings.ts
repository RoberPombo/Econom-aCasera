export type ViewMode = "monthly" | "annual";

export interface SettingsData {
  currentYear: number;
  currentMonth: number;
  viewMode: ViewMode;
}

export class Settings {
  readonly currentYear: number;
  readonly currentMonth: number;
  readonly viewMode: ViewMode;

  constructor(data: SettingsData) {
    this.currentYear = data.currentYear;
    this.currentMonth = data.currentMonth;
    this.viewMode = data.viewMode;
  }

  withYear(year: number): Settings {
    return new Settings({ ...this, currentYear: year });
  }

  withMonth(month: number): Settings {
    return new Settings({ ...this, currentMonth: month });
  }

  withViewMode(viewMode: ViewMode): Settings {
    return new Settings({ ...this, viewMode });
  }
}
