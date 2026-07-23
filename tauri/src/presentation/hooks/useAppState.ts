import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../context/useAppContext";
import type { Transaction, Category, CategorySummary, MonthlySummary, AnnualSummary, Summary, Settings, DbInfo, Theme, Person } from "../../domain/entities";
import type { UpdateInfo } from "../../domain/repositories/UpdateRepository";

export function useAppState() {
  const { compositionRoot } = useAppContext();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0, balance: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [annualSummary, setAnnualSummary] = useState<AnnualSummary[]>([]);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [showConflict, setShowConflict] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveTheme = useCallback((theme: Theme): "light" | "dark" => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return theme;
  }, []);

  const loadSettings = useCallback(async () => {
    const settings = await compositionRoot.provideGetSettingsUseCase().execute();
    setSettings(settings);
    return settings;
  }, [compositionRoot]);

  const loadDbInfo = useCallback(async () => {
    const info = await compositionRoot.provideGetDbInfoUseCase().execute();
    setDbInfo(info);
  }, [compositionRoot]);

  const loadData = useCallback(async () => {
    if (!settings) return;

    setLoading(true);
    setError(null);
    try {
      const year = settings.currentYear;
      const month = settings.viewMode === "monthly" ? settings.currentMonth : undefined;

      const [transactions, categories, persons, { summary, categories: catSummary, monthly, annual }] = await Promise.all([
        compositionRoot.provideGetTransactionsUseCase().execute(year, month),
        compositionRoot.provideGetCategoriesUseCase().execute(),
        compositionRoot.provideGetPersonsUseCase().execute(),
        compositionRoot.provideGetSummaryUseCase().execute(year, month),
      ]);

      setTransactions(transactions);
      setCategories(categories);
      setPersons(persons);
      setSummary(summary);
      setCategorySummary(catSummary);
      setMonthlySummary(monthly);
      setAnnualSummary(annual);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [compositionRoot, settings]);

  useEffect(() => {
    loadSettings();
    loadDbInfo();
    compositionRoot.provideCheckForUpdateUseCase().execute().then((info) => {
      if (info) setUpdateInfo(info);
    });
  }, [loadSettings, loadDbInfo, compositionRoot]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const info = await compositionRoot.provideGetDbInfoUseCase().execute();
        if (info.hasConflict) {
          setShowConflict(true);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [compositionRoot]);

  useEffect(() => {
    if (!settings) return;
    const resolved = resolveTheme(settings.theme);
    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);

    if (settings.theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        const next = e.matches ? "dark" : "light";
        setResolvedTheme(next);
        document.documentElement.setAttribute("data-theme", next);
      };
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, [settings, resolveTheme]);

  async function changeYear(delta: number) {
    if (!settings) return;
    const newYear = settings.currentYear + delta;
    await compositionRoot.provideUpdateSettingsUseCase().setYear(newYear);
    setSettings(settings.withYear(newYear));
  }

  async function changeMonth(month: number) {
    if (!settings) return;
    await compositionRoot.provideUpdateSettingsUseCase().setMonth(month);
    setSettings(settings.withMonth(month));
  }

  async function changeViewMode(mode: "monthly" | "annual") {
    if (!settings) return;
    await compositionRoot.provideUpdateSettingsUseCase().setViewMode(mode);
    setSettings(settings.withViewMode(mode));
  }

  async function toggleTheme() {
    if (!settings) return;
    const order: Theme[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(settings.theme) + 1) % order.length];
    await compositionRoot.provideUpdateThemeUseCase().setTheme(next);
    setSettings(settings.withTheme(next));
  }

  async function checkForUpdate() {
    const info = await compositionRoot.provideCheckForUpdateUseCase().execute();
    setUpdateInfo(info);
  }

  async function downloadUpdate() {
    await compositionRoot.provideDownloadUpdateUseCase().execute();
  }

  async function saveTransaction(data: {
    date: string;
    type: "income" | "expense";
    category: string;
    concept: string;
    amount: number;
    person?: string;
    year?: number;
    month?: number;
  }) {
    await compositionRoot.provideCreateTransactionUseCase().execute(data);
    await loadData();
  }

  async function updateTransaction(id: number, data: {
    date?: string;
    type?: "income" | "expense";
    category?: string;
    concept?: string;
    amount?: number;
    person?: string;
  }) {
    await compositionRoot.provideUpdateTransactionUseCase().execute(id, data);
    await loadData();
  }

  async function deleteTransaction(id: number) {
    await compositionRoot.provideDeleteTransactionUseCase().execute(id);
    await loadData();
  }

  async function createCategory(name: string, type: "income" | "expense") {
    await compositionRoot.provideCreateCategoryUseCase().execute(name, type);
    await loadData();
  }

  async function updateCategory(category: Category) {
    await compositionRoot.provideUpdateCategoryUseCase().execute(category);
    await loadData();
  }

  async function removeCategory(id: number) {
    await compositionRoot.provideDeleteCategoryUseCase().execute(id);
    await loadData();
  }

  async function createPerson(name: string) {
    await compositionRoot.provideCreatePersonUseCase().execute(name);
    await loadData();
  }

  async function updatePerson(person: Person) {
    await compositionRoot.provideUpdatePersonUseCase().execute(person);
    await loadData();
  }

  async function removePerson(id: number) {
    await compositionRoot.provideDeletePersonUseCase().execute(id);
    await loadData();
  }

  async function importExcel(file: File) {
    return compositionRoot.provideImportExcelUseCase().execute(file);
  }

  async function reloadDatabase() {
    await compositionRoot.provideReloadDatabaseUseCase().execute();
    setShowConflict(false);
    await loadData();
  }

  async function forceOverwrite() {
    await compositionRoot.provideForceOverwriteUseCase().execute();
    setShowConflict(false);
    await loadData();
  }

  return {
    settings,
    transactions,
    summary,
    categories,
    categorySummary,
    monthlySummary,
    annualSummary,
    dbInfo,
    persons,
    showConflict,
    resolvedTheme,
    updateInfo,
    loading,
    error,
    changeYear,
    changeMonth,
    changeViewMode,
    toggleTheme,
    checkForUpdate,
    downloadUpdate,
    dismissUpdate: () => setUpdateInfo(null),
    saveTransaction,
    updateTransaction,
    deleteTransaction,
    createCategory,
    updateCategory,
    removeCategory,
    createPerson,
    updatePerson,
    removePerson,
    importExcel,
    reloadDatabase,
    forceOverwrite,
    closeConflict: () => setShowConflict(false),
    refresh: loadData,
  };
}
