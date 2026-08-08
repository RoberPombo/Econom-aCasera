import readXlsxFile from "read-excel-file/browser";
import { Transaction } from "../domain/entities";

const monthSheetNames = [
  "Ene.",
  "Feb.",
  "Mar.",
  "Abr.",
  "May.",
  "Jun.",
  "Jul.",
  "Ago.",
  "Sep.",
  "Oct.",
  "Nov.",
  "Dic.",
];

const monthFullNames = [
  "ENERO",
  "FEBRERO",
  "MARZO",
  "ABRIL",
  "MAYO",
  "JUNIO",
  "JULIO",
  "AGOSTO",
  "SEPTIEMBRE",
  "OCTUBRE",
  "NOVIEMBRE",
  "DICIEMBRE",
];

const incomeCategories = [
  "Nóminas",
  "Ingresos por intereses",
  "Dividendos",
  "Ganancias patrimoniales",
  "Becas y subvenciones",
  "Ingresos extraordinarios",
  "Apuestas y juego",
  "Bonificaciones",
];

export type CategoryOption = {
  label: string;
  type: "income" | "expense";
};

export interface ExcelParseResult {
  imported: number;
  errors: string[];
  transactions: Transaction[];
  categories: CategoryOption[];
}

export type ExcelSheet = {
  sheet: string;
  data: ExcelRow[];
};

type ExcelRow = (string | number | Date | boolean | null | undefined)[];

const GLOBAL_INCOME_COLUMN = 17;
const GLOBAL_EXPENSE_COLUMN = 18;

function findHeaderRow(data: ExcelRow[]): number {
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (
      String(row[1]).includes("INGRESO / GASTO") &&
      String(row[6]).includes("DIA")
    ) {
      return i;
    }
  }
  return -1;
}

function normalize(text: string): string {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseMonth(value: string | number): number | null {
  const normalized = normalize(String(value)).replace(/\./g, "").trim();
  if (!normalized) return null;
  if (/^\d+$/.test(normalized)) {
    const numeric = Number(normalized);
    return numeric >= 1 && numeric <= 12 ? numeric : null;
  }
  for (let i = 0; i < monthFullNames.length; i++) {
    if (
      normalized === monthFullNames[i] ||
      normalized === monthFullNames[i].slice(0, 3)
    ) {
      return i + 1;
    }
  }
  return null;
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "")
    .trim()
    .replace(/[^\d.,-]/g, "");
  if (!cleaned) return 0;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  return Number(normalized) || 0;
}

function parseRow(
  row: ExcelRow,
  defaultMonth: number,
  defaultYear: number,
): Transaction | null {
  const hint = String(row[0] ?? "").trim();
  const category = String(row[2] ?? "").trim();
  if (!category || hint === "--") return null;

  const tipo = String(row[1] ?? "").trim();
  const isIncome =
    tipo.toLowerCase().includes("ingreso") ||
    incomeCategories.includes(category);
  const type: "income" | "expense" = isIncome ? "income" : "expense";
  const amount = parseNumber(row[10]);
  if (!amount) return null;

  const day = Number(row[6]);
  const month = parseMonth(row[7] as string | number) ?? defaultMonth;
  const year = Number(row[9]);
  const finalYear = Number.isInteger(year) && year >= 2000 ? year : defaultYear;

  const dayNumber = Number.isNaN(day) || day < 1 || day > 31 ? 1 : day;
  const dateKey = `${finalYear}-${String(month).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
  const description = String(row[13] ?? "").trim();

  return Transaction.create({
    date: dateKey,
    type,
    category,
    concept: description || hint,
    amount: Math.abs(amount),
  });
}

function parseGlobalCategories(data: ExcelRow[]): CategoryOption[] {
  const categories: CategoryOption[] = [];
  for (let i = 1; i < data.length; i++) {
    const income = String(data[i][GLOBAL_INCOME_COLUMN] ?? "").trim();
    const expense = String(data[i][GLOBAL_EXPENSE_COLUMN] ?? "").trim();
    if (!income && !expense) break;
    if (income) categories.push({ label: income, type: "income" });
    if (expense) categories.push({ label: expense, type: "expense" });
  }
  return categories;
}

export function parseExcelSheets(
  sheets: ExcelSheet[],
  defaultYear: number,
): ExcelParseResult {
  const errors: string[] = [];
  const transactions: Transaction[] = [];
  const categories: CategoryOption[] = [];

  for (const sheet of sheets) {
    if (sheet.sheet === "Global") {
      categories.push(...parseGlobalCategories(sheet.data));
      continue;
    }
    const monthIndex = monthSheetNames.findIndex(
      (m) => m.toLowerCase() === sheet.sheet.toLowerCase(),
    );
    if (monthIndex === -1) continue;

    const data = sheet.data;
    const headerRow = findHeaderRow(data);
    if (headerRow === -1) {
      errors.push(
        `Hoja ${sheet.sheet}: no se encontró la cabecera de transacciones`,
      );
      continue;
    }

    for (let i = headerRow + 1; i < data.length; i++) {
      const tx = parseRow(data[i], monthIndex + 1, defaultYear);
      if (tx) transactions.push(tx);
    }
  }

  return { imported: transactions.length, errors, transactions, categories };
}

export async function parseExcel(
  buffer: ArrayBuffer,
): Promise<ExcelParseResult> {
  const sheets = (await readXlsxFile(buffer)) as unknown as ExcelSheet[];
  const defaultYear = 2016;
  return parseExcelSheets(sheets, defaultYear);
}
