import { Transaction } from "../domain/entities";
import readXlsxFile from "read-excel-file/browser";

const monthNames = ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."];

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

export interface ExcelParseResult {
  imported: number;
  errors: string[];
  transactions: Transaction[];
}

function findHeaderRow(data: any[][]): number {
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (String(row[1]).includes("INGRESO / GASTO") && String(row[6]).includes("DIA")) {
      return i;
    }
  }
  return -1;
}

function parseRow(row: any[], defaultMonth: number, defaultYear: number): Transaction | null {
  const category = String(row[1] || "").trim();
  const tipo = String(row[2] || "").trim();
  const dia = Number(row[6]);
  const mes = Number(row[8] || defaultMonth);
  const anio = Number(row[10] || defaultYear);
  const euros = Number(row[11]);
  const descripcion = String(row[13] || "").trim();

  if (!category || isNaN(euros) || euros === 0) return null;

  const type =
    tipo.toLowerCase().includes("ingreso") || incomeCategories.includes(category)
      ? "income"
      : "expense";

  const day = isNaN(dia) || dia < 1 || dia > 31 ? 1 : dia;
  const month = isNaN(mes) || mes < 1 || mes > 12 ? defaultMonth : mes;
  const year = isNaN(anio) || anio < 2000 ? defaultYear : anio;
  const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return Transaction.create({
    date,
    type,
    category,
    concept: descripcion || category,
    amount: Math.abs(euros),
  });
}

export async function parseExcel(buffer: ArrayBuffer): Promise<ExcelParseResult> {
  const errors: string[] = [];
  const transactions: Transaction[] = [];
  const sheets = await readXlsxFile(buffer);

  for (const sheet of sheets) {
    const monthIndex = monthNames.findIndex((m) => m.toLowerCase() === sheet.sheet.toLowerCase());
    if (monthIndex === -1) continue;
    const month = monthIndex + 1;

    const data = sheet.data as any[][];
    const headerRow = findHeaderRow(data);
    if (headerRow === -1) {
      errors.push(`Hoja ${sheet.sheet}: no se encontró la cabecera de transacciones`);
      continue;
    }

    const year = 2016;

    for (let i = headerRow + 1; i < data.length; i++) {
      const tx = parseRow(data[i], month, year);
      if (tx) transactions.push(tx);
    }
  }

  return { imported: transactions.length, errors, transactions };
}
