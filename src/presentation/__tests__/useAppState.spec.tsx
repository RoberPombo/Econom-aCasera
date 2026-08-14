import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  Category,
  Person,
  Settings,
  Transaction,
  TransactionFilters,
} from "../../domain/entities";
import type { SummaryResult } from "../../domain/repositories/TransactionRepository";
import { FakeCompositionRoot } from "../../tests/fakes/compositionRoot";
import { defaultSettings } from "../../tests/fakes/repositories";
import { AppProvider } from "../context/AppProvider";
import { useAppState } from "../hooks/useAppState";

const originalMatchMedia = window.matchMedia;

const augustSettings = new Settings({
  currentYear: 2026,
  currentMonth: 8,
  viewMode: "monthly",
  theme: "light",
});

function expense(id: number, date: string, category: string, amount: number) {
  return Transaction.create({
    id,
    date,
    type: "expense",
    category,
    concept: "Mercadona",
    amount,
  });
}

function renderState(
  options?: ConstructorParameters<typeof FakeCompositionRoot>[0],
) {
  const root = new FakeCompositionRoot(options);
  const utils = renderHook(() => useAppState(), {
    wrapper: ({ children }) => (
      <AppProvider compositionRoot={root.asCompositionRoot()}>
        {children}
      </AppProvider>
    ),
  });
  return { ...utils, root };
}

async function settle() {
  for (let i = 0; i < 4; i += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
  }
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAppState", () => {
  test("keeps filters null and skips loading when the settings are invalid", async () => {
    const { result } = renderState({
      settings: new Settings({
        currentYear: 2026,
        currentMonth: 13,
        viewMode: "monthly",
        theme: "light",
      }),
    });

    await settle();

    expect(result.current.filters).toBeNull();
    expect(result.current.transactions).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  test("no-ops the navigation and theme actions before settings are loaded", async () => {
    const { result } = renderState();

    await act(async () => {
      void result.current.changeYear(1);
      void result.current.changeMonth(12);
      void result.current.toggleTheme();
    });
    await settle();

    expect(result.current.settings?.currentYear).toBe(
      defaultSettings().currentYear,
    );
    expect(result.current.settings?.currentMonth).toBe(
      defaultSettings().currentMonth,
    );
    expect(result.current.settings?.theme).toBe(defaultSettings().theme);
  });

  test("updateFilters commits a range period and reloads with the range filters", async () => {
    const { result, root } = renderState();

    await settle();

    const spy = vi.spyOn(root.transactions, "getFiltered");
    act(() => {
      result.current.updateFilters(
        TransactionFilters.create({
          period: { mode: "range", from: "2026-01-01", to: "2026-12-31" },
        }),
      );
    });

    expect(result.current.filters?.period).toEqual({
      mode: "range",
      from: "2026-01-01",
      to: "2026-12-31",
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(
      spy.mock.calls.some(
        ([f]) => f.period.mode === "range" && f.period.from === "2026-01-01",
      ),
    ).toBe(true);
    spy.mockRestore();
  });

  test("reveals the conflict through the background poll", async () => {
    const { result, root } = renderState();

    await settle();
    expect(result.current.showConflict).toBe(false);

    root.dbInfo.hasConflict = true;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(result.current.showConflict).toBe(true);
  });

  test("applies the system theme and reacts to media changes", async () => {
    const listeners: ((e: { matches: boolean }) => void)[] = [];
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        addEventListener: (
          _: string,
          cb: (e: { matches: boolean }) => void,
        ) => {
          listeners.push(cb);
        },
        removeEventListener: vi.fn(),
      })),
    });

    renderState({
      settings: new Settings({
        currentYear: 2026,
        currentMonth: 8,
        viewMode: "monthly",
        theme: "system",
      }),
    });

    try {
      await settle();

      expect(document.documentElement).toHaveAttribute("data-theme", "light");

      act(() => {
        listeners.forEach((cb) => {
          cb({ matches: true });
        });
      });

      expect(document.documentElement).toHaveAttribute("data-theme", "dark");

      act(() => {
        listeners.forEach((cb) => {
          cb({ matches: false });
        });
      });

      expect(document.documentElement).toHaveAttribute("data-theme", "light");
    } finally {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      });
    }
  });

  test("resolves the system theme to dark when the media matches", async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn(() => ({
        matches: true,
        media: "(prefers-color-scheme: dark)",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });

    try {
      renderState({
        settings: new Settings({
          currentYear: 2026,
          currentMonth: 8,
          viewMode: "monthly",
          theme: "system",
        }),
      });

      await settle();

      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    } finally {
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      });
    }
  });

  test("updatePerson renames the person and reloads", async () => {
    const { result } = renderState();

    await settle();

    await act(async () => {
      await result.current.createPerson("Ana");
    });

    await act(async () => {
      await result.current.updatePerson(
        result.current.persons[0].withLabel("Anabel"),
      );
    });

    expect(result.current.persons).toHaveLength(1);
    expect(result.current.persons[0].label).toBe("Anabel");
  });

  test("loads settings, db info and seeded data on mount", async () => {
    const { result } = renderState({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-05", "comida", 40)],
      categories: [Category.create({ label: "Comida", type: "expense" })],
      persons: [Person.create({ id: 1, label: "Ana" })],
    });

    await settle();

    expect(result.current.settings?.currentYear).toBe(2026);
    expect(result.current.settings?.currentMonth).toBe(8);
    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].concept).toBe("Mercadona");
    expect(result.current.categories[0].label).toBe("Comida");
    expect(result.current.persons).toHaveLength(1);
    expect(result.current.summary.expense).toBe(40);
    expect(result.current.dbInfo?.dbPath).toBe("/db.sqlite");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.filters?.period).toEqual({
      mode: "month",
      year: 2026,
      month: 8,
    });
  });

  test("reports a data error in the error state", async () => {
    const { result, root } = renderState({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-05", "comida", 40)],
    });
    root.categoriesError = new Error("boom");

    await settle();

    expect(result.current.error).toMatch(/boom/);
    expect(result.current.loading).toBe(false);
  });

  test("changeYear and changeMonth persist the settings", async () => {
    const { result, root } = renderState();

    await settle();

    await act(async () => {
      await result.current.changeYear(1);
    });

    expect(result.current.settings?.currentYear).toBe(2027);
    expect((await root.settings.get()).currentYear).toBe(2027);

    await act(async () => {
      await result.current.changeMonth(12);
    });

    expect(result.current.settings?.currentMonth).toBe(12);
    expect((await root.settings.get()).currentMonth).toBe(12);
  });

  test("toggleTheme cycles through light, dark and system", async () => {
    const { result } = renderState({ settings: augustSettings });

    await settle();

    await act(async () => {
      await result.current.toggleTheme();
    });

    expect(result.current.settings?.theme).toBe("dark");

    await act(async () => {
      await result.current.toggleTheme();
    });

    expect(result.current.settings?.theme).toBe("system");
  });

  test("applies the resolved theme to the document element", async () => {
    const { result } = renderState({ settings: augustSettings });

    await settle();

    await act(async () => {
      await result.current.toggleTheme();
    });

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  test("changePeriodMode and changeRange build a range filter", async () => {
    const { result } = renderState();

    await settle();

    act(() => {
      result.current.changePeriodMode("range");
      result.current.changeRange(undefined, "2026-08-31");
    });

    expect(result.current.filters?.period).toEqual({
      mode: "range",
      from: undefined,
      to: "2026-08-31",
    });
  });

  test("updateFilters commits the draft and the period mode", async () => {
    const { result } = renderState();

    await settle();

    act(() => {
      result.current.updateFilters(
        TransactionFilters.create({
          period: { mode: "month", year: 2026, month: 7 },
          search: " taxi ",
        }),
      );
    });

    expect(result.current.filters?.search).toBe("taxi");
    expect(result.current.filters?.period).toEqual({
      mode: "month",
      year: 2026,
      month: 7,
    });
  });

  test("clearFilters resets the draft", async () => {
    const { result } = renderState();

    await settle();
    await act(async () => {
      await result.current.updateFilters(
        TransactionFilters.create({
          period: { mode: "month", year: 2026, month: 7 },
          search: "taxi",
          minAmount: 5,
        }),
      );
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters?.search).toBe("");
    expect(result.current.filters?.minAmount).toBeNull();
  });

  test("checkForUpdate exposes the update and dismissUpdate clears it", async () => {
    const info = {
      version: "2.0.0",
      downloadUrl: "https://example.com/app.exe",
      currentVersion: "1.0.0",
    };
    const { result } = renderState({ updateInfo: info });

    await settle();

    expect(result.current.updateInfo).toEqual(info);

    act(() => {
      result.current.dismissUpdate();
    });

    expect(result.current.updateInfo).toBeNull();
  });

  test("checkForUpdate returns no update when there is none", async () => {
    const { result } = renderState();

    await settle();

    await act(async () => {
      await result.current.checkForUpdate();
    });

    expect(result.current.updateInfo).toBeNull();
  });

  test("saveTransaction inserts the row and reloads the list", async () => {
    const { result } = renderState({ settings: augustSettings });

    await settle();

    await act(async () => {
      await result.current.saveTransaction({
        date: "2026-08-10",
        type: "expense",
        category: "comida",
        concept: "Día",
        amount: 20,
      });
    });
    await settle();

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].concept).toBe("Día");
  });

  test("deleteTransaction removes the row and reloads", async () => {
    const { result } = renderState({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-05", "comida", 40)],
    });

    await settle();

    await act(async () => {
      await result.current.deleteTransaction(1);
    });
    await settle();

    expect(result.current.transactions).toHaveLength(0);
  });

  test("createCategory, updateCategory and removeCategory reload the list", async () => {
    const { result } = renderState();

    await settle();

    await act(async () => {
      await result.current.createCategory("Comida", "expense");
    });

    expect(result.current.categories).toHaveLength(1);

    await act(async () => {
      await result.current.updateCategory(
        result.current.categories[0].withLabel("Supermercado"),
      );
    });

    expect(result.current.categories[0].label).toBe("Supermercado");

    await act(async () => {
      await result.current.removeCategory(
        result.current.categories[0].id as number,
      );
    });

    expect(result.current.categories).toHaveLength(0);
  });

  test("createPerson and removePerson reload the list", async () => {
    const { result } = renderState();

    await settle();

    await act(async () => {
      await result.current.createPerson("Ana");
    });

    expect(result.current.persons).toHaveLength(1);

    await act(async () => {
      await result.current.removePerson(result.current.persons[0].id as number);
    });

    expect(result.current.persons).toHaveLength(0);
  });

  test("findSimilarTransactions matches date, category, type and amount", async () => {
    const { result } = renderState({
      transactions: [
        expense(1, "2026-08-05", "comida", 40),
        Transaction.create({
          id: 2,
          date: "2026-08-05",
          type: "expense",
          category: "comida",
          concept: "Día",
          amount: 40.001,
        }),
        Transaction.create({
          id: 3,
          date: "2026-08-05",
          type: "expense",
          category: "transporte",
          concept: "Taxi",
          amount: 40,
        }),
      ],
    });

    let similar: Transaction[] = [];
    await act(async () => {
      similar = await result.current.findSimilarTransactions(
        "2026-08-05",
        "comida",
        "expense",
        40,
      );
    });

    expect(similar).toHaveLength(2);
    expect(similar.map((t) => t.id)).toEqual([1, 2]);
  });

  test("reloadDatabase and forceOverwrite clear the conflict state", async () => {
    const { result, root } = renderState({ hasDbConflict: true });

    await settle();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(result.current.showConflict).toBe(true);

    await act(async () => {
      await result.current.reloadDatabase();
    });

    expect(result.current.showConflict).toBe(false);
    expect(root.dbInfo.hasConflict).toBe(true);

    await act(async () => {
      await result.current.forceOverwrite();
    });

    expect(result.current.showConflict).toBe(false);
    expect(root.dbInfo.hasConflict).toBe(false);
  });

  test("updateTransaction reloads and loadReceiptDataUrl delegates", async () => {
    const { result } = renderState({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-05", "comida", 40)],
    });

    await settle();

    await act(async () => {
      await result.current.updateTransaction(1, { concept: "Supermercado" });
    });
    await settle();

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].concept).toBe("Supermercado");

    let dataUrl = "";
    await act(async () => {
      dataUrl = await result.current.loadReceiptDataUrl("receipts/1.png");
    });

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test("downloadUpdate, previewImport, confirmImport and addImportCategories delegate", async () => {
    const { result, root } = renderState({ settings: augustSettings });
    root.imports.previewResult = {
      transactions: [expense(1, "2026-08-05", "comida", 40)],
      errors: [],
      skipped: 0,
    };
    root.imports.confirmResult = 3;
    root.imports.addCategoriesResult = 5;

    await settle();

    await act(async () => {
      await result.current.downloadUpdate();
    });

    let preview: {
      transactions: Transaction[];
      errors: string[];
      skipped: number;
    } = { transactions: [], errors: [], skipped: 0 };
    await act(async () => {
      preview = await result.current.previewImport(
        "excel",
        new File([], "datos.csv"),
      );
    });

    expect(preview.transactions).toHaveLength(1);
    expect(preview.errors).toEqual([]);

    let inserted = 0;
    await act(async () => {
      inserted = await result.current.confirmImport(preview.transactions);
    });
    await settle();

    expect(inserted).toBe(3);

    let added = 0;
    await act(async () => {
      added = await result.current.addImportCategories([
        { label: "Nóminas", type: "income" },
      ]);
    });
    await settle();

    expect(added).toBe(5);
    expect(root.imports.addCategoriesCalls).toEqual([
      [{ label: "Nóminas", type: "income" }],
    ]);
  });

  test("clears the report while a new year is loading", async () => {
    const { result, root } = renderState({
      transactions: [expense(1, "2026-08-05", "comida", 40)],
    });
    await settle();

    await act(async () => {
      await result.current.loadYearReport(2026);
    });
    const previousReport = result.current.report;
    expect(previousReport).not.toBeNull();

    let resolveSummary!: (value: SummaryResult) => void;
    const pending = new Promise<SummaryResult>((resolve) => {
      resolveSummary = resolve;
    });
    root.transactions.getSummary = vi.fn().mockReturnValue(pending);

    let loading: Promise<void>;
    act(() => {
      loading = result.current.loadYearReport(2027);
    });
    expect(result.current.report).toBeNull();
    expect(root.transactions.getSummary).toHaveBeenLastCalledWith(
      2027,
      undefined,
    );

    await act(async () => {
      resolveSummary(previousReport);
      await loading;
    });
    expect(result.current.report).toEqual(previousReport);
  });

  test("closeConflict hides the conflict dialog", async () => {
    const { result } = renderState({ hasDbConflict: true });

    await settle();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    act(() => {
      result.current.closeConflict();
    });

    expect(result.current.showConflict).toBe(false);
  });
});
