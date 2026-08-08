import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AnnualSummary,
  Category,
  CategorySummary,
  DbInfo,
  MonthlySummary,
  PeriodMode,
  Person,
  Settings,
  Summary,
  Theme,
  Transaction,
  TransactionType,
} from "../../domain/entities";
import { TransactionFilters } from "../../domain/entities";
import type { ImportSource } from "../../domain/entities/ImportSource";
import type { UpdateInfo } from "../../domain/repositories/UpdateRepository";
import { useAppContext } from "../context/useAppContext";

export function useAppState() {
  const { compositionRoot } = useAppContext();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");
  const [rangeFrom, setRangeFrom] = useState<string | undefined>(undefined);
  const [rangeTo, setRangeTo] = useState<string | undefined>(undefined);
  const [filterDraft, setFilterDraft] = useState({
    types: [] as ("income" | "expense" | "savings")[],
    categoryKeys: [] as string[],
    personKeys: [] as string[],
    minAmount: null as number | null,
    maxAmount: null as number | null,
    search: "",
  });

  const emptySummary: Summary = { income: 0, expense: 0, balance: 0 };
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [yearSummary, setYearSummary] = useState<Summary>(emptySummary);
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

  const filters = useMemo(() => {
    if (!settings) return null;
    try {
      const period =
        periodMode === "month"
          ? {
              mode: "month" as const,
              year: settings.currentYear,
              month: settings.currentMonth,
            }
          : { mode: "range" as const, from: rangeFrom, to: rangeTo };
      return TransactionFilters.create({
        period,
        types: filterDraft.types,
        categoryKeys: filterDraft.categoryKeys,
        personKeys: filterDraft.personKeys,
        minAmount: filterDraft.minAmount,
        maxAmount: filterDraft.maxAmount,
        search: filterDraft.search,
      });
    } catch {
      return null;
    }
  }, [settings, periodMode, rangeFrom, rangeTo, filterDraft]);

  const resolveTheme = useCallback((theme: Theme): "light" | "dark" => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  }, []);

  const loadSettings = useCallback(async () => {
    const next = await compositionRoot.provideGetSettingsUseCase().execute();
    setSettings(next);
    return next;
  }, [compositionRoot]);

  const loadDbInfo = useCallback(async () => {
    const info = await compositionRoot.provideGetDbInfoUseCase().execute();
    setDbInfo(info);
  }, [compositionRoot]);

  const loadData = useCallback(async () => {
    if (!filters) return;

    setLoading(true);
    setError(null);
    try {
      const yearFilters =
        filters.period.mode === "month"
          ? filters.forYear(filters.period.year)
          : filters;

      const [txs, cats, pers, periodResult, yearResult] = await Promise.all([
        compositionRoot.provideGetTransactionsUseCase().execute(filters),
        compositionRoot.provideGetCategoriesUseCase().execute(),
        compositionRoot.provideGetPersonsUseCase().execute(),
        compositionRoot.provideGetSummaryUseCase().execute(filters),
        compositionRoot.provideGetSummaryUseCase().execute(yearFilters),
      ]);

      setTransactions(txs);
      setCategories(cats);
      setPersons(pers);
      setSummary(periodResult.summary);
      setYearSummary(yearResult.summary);
      setCategorySummary(periodResult.categories);
      setMonthlySummary(periodResult.monthly);
      setAnnualSummary(yearResult.annual);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [compositionRoot, filters]);

  useEffect(() => {
    loadSettings();
    loadDbInfo();
    compositionRoot
      .provideCheckForUpdateUseCase()
      .execute()
      .then((info) => {
        if (info) setUpdateInfo(info);
      });
  }, [loadSettings, loadDbInfo, compositionRoot]);

  useEffect(() => {
    // Debounce filter-driven reloads so typing amounts / picking dates
    // does not thrash the UI or keep native pickers open.
    const timer = window.setTimeout(() => {
      void loadData();
    }, 200);
    return () => window.clearTimeout(timer);
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

  function changePeriodMode(mode: PeriodMode) {
    setPeriodMode(mode);
  }

  function changeRange(from?: string, to?: string) {
    setRangeFrom(from);
    setRangeTo(to);
  }

  function updateFilters(next: TransactionFilters) {
    setFilterDraft({
      types: [...next.types],
      categoryKeys: [...next.categoryKeys],
      personKeys: [...next.personKeys],
      minAmount: next.minAmount,
      maxAmount: next.maxAmount,
      search: next.search,
    });
    if (next.period.mode === "range") {
      setPeriodMode("range");
      setRangeFrom(next.period.from);
      setRangeTo(next.period.to);
    } else {
      setPeriodMode("month");
    }
  }

  function clearFilters() {
    setFilterDraft({
      types: [],
      categoryKeys: [],
      personKeys: [],
      minAmount: null,
      maxAmount: null,
      search: "",
    });
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
    type: TransactionType;
    category: string;
    concept: string;
    amount: number;
    person?: string;
    year?: number;
    month?: number;
    receipt?: { bytes: Uint8Array; extension: string } | null;
  }) {
    await compositionRoot.provideCreateTransactionUseCase().execute(data);
    await loadData();
  }

  async function updateTransaction(
    id: number,
    data: {
      date?: string;
      type?: TransactionType;
      category?: string;
      concept?: string;
      amount?: number;
      person?: string;
      receipt?: { bytes: Uint8Array; extension: string } | null;
      removeReceipt?: boolean;
    },
  ) {
    await compositionRoot.provideUpdateTransactionUseCase().execute(id, data);
    await loadData();
  }

  async function loadReceiptDataUrl(relativePath: string): Promise<string> {
    return compositionRoot
      .provideReceiptRepository()
      .readAsDataUrl(relativePath);
  }

  async function findSimilarTransactions(
    date: string,
    category: string,
    type: TransactionType,
    amount: number,
  ) {
    const all = await compositionRoot
      .provideGetTransactionsByDateUseCase()
      .execute(date);
    return all.filter(
      (tx) =>
        tx.category === category &&
        tx.type === type &&
        Math.abs(tx.amount - amount) < 0.005,
    );
  }

  async function deleteTransaction(id: number) {
    await compositionRoot.provideDeleteTransactionUseCase().execute(id);
    await loadData();
  }

  async function createCategory(label: string, type: "income" | "expense") {
    await compositionRoot.provideCreateCategoryUseCase().execute(label, type);
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

  async function createPerson(label: string) {
    await compositionRoot.provideCreatePersonUseCase().execute(label);
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

  async function previewImport(source: ImportSource, file: File) {
    return compositionRoot.providePreviewImportUseCase().execute(source, file);
  }

  async function confirmImport(transactions: Transaction[]) {
    const count = await compositionRoot
      .provideConfirmImportUseCase()
      .execute(transactions);
    await loadData();
    return count;
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
    filters,
    periodMode,
    transactions,
    summary,
    yearSummary,
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
    changePeriodMode,
    changeRange,
    updateFilters,
    clearFilters,
    toggleTheme,
    checkForUpdate,
    downloadUpdate,
    dismissUpdate: () => setUpdateInfo(null),
    saveTransaction,
    updateTransaction,
    deleteTransaction,
    loadReceiptDataUrl,
    findSimilarTransactions,
    createCategory,
    updateCategory,
    removeCategory,
    createPerson,
    updatePerson,
    removePerson,
    previewImport,
    confirmImport,
    reloadDatabase,
    forceOverwrite,
    closeConflict: () => setShowConflict(false),
    refresh: loadData,
  };
}
