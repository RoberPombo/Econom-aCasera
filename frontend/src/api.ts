export interface Transaction {
  id?: number;
  date: string;
  type: "income" | "expense";
  category: string;
  concept: string;
  amount: number;
  year: number;
  month: number;
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummary {
  category: string;
  type: "income" | "expense";
  amount: number;
}

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  active: number;
}

export interface MonthlySummary {
  month: number;
  income: number;
  expense: number;
  balance: number;
}

export interface AnnualSummary {
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface DbInfo {
  dbPath: string;
  backupPath: string;
  usesDrive: boolean;
  driveFolder: string | null;
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 409 && data.conflict) {
      throw new ConflictError(data.message || "Conflict detected");
    }
    const text = typeof data === "string" ? data : JSON.stringify(data);
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export const listTransactions = (year: number, month?: number) =>
  api<Transaction[]>(`/transactions?year=${year}${month !== undefined ? `&month=${month}` : ""}`);

export const createTransaction = (t: Transaction) =>
  api<Transaction>("/transactions", { method: "POST", body: JSON.stringify(t) });

export const updateTransaction = (t: Transaction) =>
  api<Transaction>(`/transactions/${t.id}`, { method: "PUT", body: JSON.stringify(t) });

export const deleteTransaction = (id: number) =>
  api<{ ok: boolean }>(`/transactions/${id}`, { method: "DELETE" });

export const getSummary = (year: number, month?: number) =>
  api<Summary>(`/summary?year=${year}${month !== undefined ? `&month=${month}` : ""}`);

export const getCategories = (year: number, month?: number) =>
  api<CategorySummary[]>(`/categories?year=${year}${month !== undefined ? `&month=${month}` : ""}`);

export const getMonthlySummary = (year: number) => api<MonthlySummary[]>(`/monthly-summary?year=${year}`);
export const getAnnualSummary = () => api<AnnualSummary[]>("/annual-summary");

export const getCurrentYear = () => api<{ year: number }>("/year");
export const setCurrentYear = (year: number) =>
  api<{ year: number }>("/year", { method: "POST", body: JSON.stringify({ year }) });

export const getCurrentMonth = () => api<{ month: number }>("/month");
export const setCurrentMonth = (month: number) =>
  api<{ month: number }>("/month", { method: "POST", body: JSON.stringify({ month }) });

export const getViewMode = () => api<{ mode: "monthly" | "annual" }>("/view-mode");
export const setViewMode = (mode: "monthly" | "annual") =>
  api<{ mode: "monthly" | "annual" }>("/view-mode", { method: "POST", body: JSON.stringify({ mode }) });

export const listCategories = () => api<Category[]>("/category-config");
export const createCategory = (name: string, type: "income" | "expense") =>
  api<Category>("/category-config", { method: "POST", body: JSON.stringify({ name, type }) });
export const updateCategory = (id: number, name: string, type: "income" | "expense", active: number) =>
  api<{ ok: boolean }>(`/category-config/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, type, active }),
  });
export const deleteCategory = (id: number) =>
  api<{ ok: boolean }>(`/category-config/${id}`, { method: "DELETE" });

export const getDbInfo = () => api<DbInfo>("/db-info");

export const reloadDatabase = () =>
  api<{ ok: boolean; dbPath: string; usesDrive: boolean }>("/db/reload", { method: "POST" });

export const forceOverwrite = () =>
  api<{ ok: boolean; dbPath: string; usesDrive: boolean }>("/db/force-overwrite", { method: "POST" });

export const importExcel = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return fetch("/api/import/excel", {
    method: "POST",
    body: formData,
  }).then((res) => res.json() as Promise<{ imported: number; errors: string[] }>);
};
