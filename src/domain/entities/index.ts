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

export interface Category {
  id: number;
  name: string;
  type: "income" | "expense";
  active: number;
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

export interface Settings {
  currentYear: number;
  currentMonth: number;
  viewMode: "monthly" | "annual";
}

export interface DbInfo {
  dbPath: string;
  backupPath: string;
  usesDrive: boolean;
  driveFolder: string | null;
}
