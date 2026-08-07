import { describe, expect, test } from "vitest";
import { Settings } from "../entities/Settings";
import { Summary } from "../entities/Summary";

describe("Settings", () => {
  const settings = new Settings({
    currentYear: 2026,
    currentMonth: 7,
    viewMode: "monthly",
    theme: "system",
  });

  test("withMonth updates only the month", () => {
    const updated = settings.withMonth(12);

    expect(updated.currentMonth).toBe(12);
    expect(updated.currentYear).toBe(2026);
    expect(updated.viewMode).toBe("monthly");
    expect(updated.theme).toBe("system");
  });

  test("withYear updates only the year", () => {
    const updated = settings.withYear(2025);

    expect(updated.currentYear).toBe(2025);
    expect(updated.currentMonth).toBe(7);
  });

  test("withViewMode updates only the view mode", () => {
    const updated = settings.withViewMode("annual");

    expect(updated.viewMode).toBe("annual");
  });

  test("withTheme updates only the theme", () => {
    const updated = settings.withTheme("dark");

    expect(updated.theme).toBe("dark");
  });

  test("mutations do not modify the original instance", () => {
    settings.withMonth(3);
    settings.withTheme("light");

    expect(settings.currentMonth).toBe(7);
    expect(settings.theme).toBe("system");
  });
});

describe("Summary", () => {
  test("rounds income and expense to two decimals", () => {
    const summary = new Summary({ income: 10.005, expense: 3.333 });

    expect(summary.income).toBe(10.01);
    expect(summary.expense).toBe(3.33);
  });

  test("balance is income minus expense", () => {
    const summary = new Summary({ income: 100, expense: 70.5 });

    expect(summary.balance).toBe(29.5);
  });

  test("negative balance when spending more than income", () => {
    const summary = new Summary({ income: 50, expense: 80 });

    expect(summary.balance).toBe(-30);
  });
});
