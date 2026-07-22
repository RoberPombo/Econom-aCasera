export type ViewMode = "monthly" | "annual";
export type Theme = "light" | "dark" | "system";

export interface SettingsData {
  currentYear: number;
  currentMonth: number;
  viewMode: ViewMode;
  theme: Theme;
}

export class Settings {
  readonly currentYear: number;
  readonly currentMonth: number;
  readonly viewMode: ViewMode;
  readonly theme: Theme;

  constructor(data: SettingsData) {
    this.currentYear = data.currentYear;
    this.currentMonth = data.currentMonth;
    this.viewMode = data.viewMode;
    this.theme = data.theme;
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

  withTheme(theme: Theme): Settings {
    return new Settings({ ...this, theme });
  }
}
