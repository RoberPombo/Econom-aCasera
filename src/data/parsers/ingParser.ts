import { Transaction } from "../../domain/entities";
import type { ImportPreview } from "../../domain/repositories/ImportRepository";

export type ExcelCell = string | number | boolean | null;

export interface IngHeaders {
  dateIndex: number;
  categoryIndex: number;
  descriptionIndex: number;
  amountIndex: number;
}

function headerKey(value: ExcelCell): string {
  const s = value == null ? "" : String(value);
  return s
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function findHeaderRow(rows: ExcelCell[][]): { index: number; headers: IngHeaders } | null {
  const limit = Math.min(rows.length, 30);
  for (let i = 0; i < limit; i++) {
    const keys = rows[i].map(headerKey);
    const dateCandidates = ["F VALOR", "F. VALOR", "FECHA VALOR", "FECHA"];
    const dateIndex = keys.findIndex((k) => dateCandidates.some((c) => k === c));
    const amountIndex = keys.findIndex((k) => k.includes("IMPORTE"));
    if (dateIndex === -1 || amountIndex === -1) continue;
    const categoryIndex = keys.findIndex((k) => k.includes("CATEGOR"));
    const descriptionIndex = keys.findIndex((k) => k.includes("DESCRIPCI"));
    return {
      index: i,
      headers: {
        dateIndex,
        categoryIndex,
        descriptionIndex,
        amountIndex,
      },
    };
  }
  return null;
}

function parseDate(value: ExcelCell): string {
  if (typeof value === "string") {
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
    const dmy = value.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  }
  return "";
}

function parseAmount(value: ExcelCell): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const s = value.trim().replace(/[^\d,.-]/g, "");
    if (!s) return 0;
    return Number(s.replace(/\.(?=\d{3}\b)/g, "").replace(",", ".")) || 0;
  }
  return 0;
}

function mapCategory(category: string, type: "income" | "expense"): string {
  if (type === "income") return "Nómina";
  switch (category) {
    case "Alimentación":
      return "Comida";
    case "Vehículo y transporte":
      return "Transporte";
    case "Ocio y viajes":
      return "Ocio";
    case "Hogar":
      return "Hogar";
    case "Compras":
    case "Otros gastos":
    case "Movimientos excluidos":
    default:
      return "Hogar";
  }
}

export function parseIngExcel(rows: ExcelCell[][]): ImportPreview {
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  const header = findHeaderRow(rows);
  if (!header) {
    return {
      transactions,
      errors: [
        "No se encontró la cabecera de movimientos de ING (columnas FECHA, CATEGORÍA e IMPORTE)",
      ],
      skipped: 0,
    };
  }

  const { headers } = header;
  for (let i = header.index + 1; i < rows.length; i++) {
    const row = rows[i];
    try {
      const date = parseDate(row[headers.dateIndex]);
      const amount = parseAmount(row[headers.amountIndex]);
      if (!date || amount === 0) continue;

      const type: "income" | "expense" = amount > 0 ? "income" : "expense";
      const category = String(row[headers.categoryIndex] ?? "").trim();
      const description = String(row[headers.descriptionIndex] ?? "").trim();

      transactions.push(
        Transaction.create({
          date,
          type,
          category: mapCategory(category, type),
          concept: description || category,
          amount: Math.abs(amount),
        })
      );
    } catch (err) {
      errors.push(`Fila ${i + 1}: ${String(err)}`);
    }
  }

  return { transactions, errors, skipped: 0 };
}