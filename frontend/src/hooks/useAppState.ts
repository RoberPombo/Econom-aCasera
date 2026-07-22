import { useState, useEffect, useCallback } from "react";
import type { Transaction, Category, CategorySummary, MonthlySummary, AnnualSummary, DbInfo, Summary } from "../api";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategories,
  getMonthlySummary,
  getAnnualSummary,
  getCurrentYear,
  setCurrentYear,
  getCurrentMonth,
  setCurrentMonth,
  getViewMode,
  setViewMode,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getDbInfo,
  reloadDatabase,
  forceOverwrite,
  ConflictError,
} from "../api";

export function useAppState() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [viewMode, setViewModeState] = useState<"monthly" | "annual">("monthly");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0, balance: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [annualSummary, setAnnualSummary] = useState<AnnualSummary[]>([]);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(false);

  const loadSettings = useCallback(async () => {
    const [{ year }, { month }, { mode }] = await Promise.all([
      getCurrentYear(),
      getCurrentMonth(),
      getViewMode(),
    ]);
    setYear(year);
    setMonth(month);
    setViewModeState(mode);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [tx, sum, catsummary, allCategories, info] = await Promise.all([
        listTransactions(year, viewMode === "monthly" ? month : undefined),
        getSummary(year, viewMode === "monthly" ? month : undefined),
        getCategories(year, viewMode === "monthly" ? month : undefined),
        listCategories(),
        getDbInfo(),
      ]);
      setTransactions(tx);
      setSummary(sum);
      setCategorySummary(catsummary);
      setCategories(allCategories);
      setDbInfo(info);

      const [monthly, annual] = await Promise.all([
        getMonthlySummary(year),
        getAnnualSummary(),
      ]);
      setMonthlySummary(monthly);
      setAnnualSummary(annual);
    } finally {
      setLoading(false);
    }
  }, [year, month, viewMode]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function withConflictHandling<T>(fn: () => Promise<T>): Promise<T | undefined> {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof ConflictError) {
        setConflict(true);
        return undefined;
      }
      throw err;
    }
  }

  async function changeYear(delta: number) {
    const newYear = year + delta;
    await withConflictHandling(() => setCurrentYear(newYear));
    setYear(newYear);
  }

  async function changeMonth(newMonth: number) {
    await withConflictHandling(() => setCurrentMonth(newMonth));
    setMonth(newMonth);
  }

  async function changeViewMode(mode: "monthly" | "annual") {
    await withConflictHandling(() => setViewMode(mode));
    setViewModeState(mode);
  }

  async function saveTransaction(tx: Transaction, editingId?: number | null) {
    const result = await withConflictHandling(async () => {
      if (editingId) {
        return await updateTransaction({ ...tx, id: editingId });
      }
      return await createTransaction(tx);
    });
    if (result === undefined) return false;
    await refresh();
    return true;
  }

  async function removeTransaction(id: number) {
    const result = await withConflictHandling(() => deleteTransaction(id));
    if (result === undefined) return false;
    await refresh();
    return true;
  }

  async function saveCategory(name: string, type: "income" | "expense") {
    const result = await withConflictHandling(() => createCategory(name, type));
    if (result === undefined) return false;
    await refresh();
    return true;
  }

  async function updateCategoryState(id: number, name: string, type: "income" | "expense", active: number) {
    const result = await withConflictHandling(() => updateCategory(id, name, type, active));
    if (result === undefined) return false;
    await refresh();
    return true;
  }

  async function removeCategory(id: number) {
    const result = await withConflictHandling(() => deleteCategory(id));
    if (result === undefined) return false;
    await refresh();
    return true;
  }

  async function handleConflictResolution(action: "reload" | "overwrite") {
    if (action === "reload") {
      await reloadDatabase();
      await loadSettings();
      await refresh();
    } else {
      await forceOverwrite();
      await refresh();
    }
    setConflict(false);
  }

  return {
    year,
    month,
    viewMode,
    transactions,
    summary,
    categories,
    categorySummary,
    monthlySummary,
    annualSummary,
    dbInfo,
    loading,
    conflict,
    changeYear,
    changeMonth,
    changeViewMode,
    saveTransaction,
    removeTransaction,
    saveCategory,
    updateCategoryState,
    removeCategory,
    refresh,
    handleConflictResolution,
    setConflict,
  };
}
