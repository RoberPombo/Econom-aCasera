import { Transaction } from "../../domain/entities";
import type { ImportPreview } from "../../domain/repositories/ImportRepository";

const COMIDA_PATTERNS = [
  "LIDL",
  "ALDI",
  "MERCADONA",
  "CARREF",
  "EROSKI",
  "SUPERMERCADO",
  "HIPERCOR",
  "CONSUM",
  "COMIDA",
];

const TRANSPORTE_PATTERNS = [
  "RENFE",
  "CEPSA",
  "REPSOL",
  "GASOLINA",
  "GASOLINERA",
  "TAXI",
  "CABIFY",
  "UBER",
  "AUTOBUS",
];

const OCIO_PATTERNS = [
  "ESTANCO",
  "CINE",
  "SHEIN",
  "TEMU",
  "ALIEXPRES",
  "STEAM",
  "CONSOLAS",
  "KIABI",
  "CAFE",
  "RESTAURANT",
];

function normalize(text: string): string {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ";" && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseDate(value: string): string {
  const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function parseAmount(value: string): number {
  const cleaned = value.trim().replace(/[^\d.,-]/g, "");
  if (!cleaned) return 0;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  return Number(normalized) || 0;
}

function findHeaderRow(lines: string[][]): number {
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const keys = lines[i].map((c) => normalize(c.trim()));
    if (keys.length < 4 || keys[0] !== "FECHA" || !keys.includes("IMPORTE")) {
      continue;
    }
    return i;
  }
  return -1;
}

function mapCategory(concept: string, type: "income" | "expense"): string {
  if (type === "income") return "Nómina";
  const normalized = normalize(concept);
  if (COMIDA_PATTERNS.some((p) => normalized.includes(p))) return "Comida";
  if (TRANSPORTE_PATTERNS.some((p) => normalized.includes(p))) {
    return "Transporte";
  }
  if (OCIO_PATTERNS.some((p) => normalized.includes(p))) return "Ocio";
  return "Hogar";
}

export function parseAbancaCsv(content: string): ImportPreview {
  const transactions: Transaction[] = [];
  const errors: string[] = [];

  const lines = content.split(/\r?\n/).map(splitCsvLine);
  const headerRow = findHeaderRow(lines);
  if (headerRow === -1) {
    return {
      transactions,
      errors: [
        "No se encontró la cabecera de movimientos de Abanca (columnas FECHA, CONCEPTO, SALDO e IMPORTE)",
      ],
      skipped: 0,
    };
  }

  for (let i = headerRow + 1; i < lines.length; i++) {
    const fields = lines[i];
    if (fields.every((f) => f.trim() === "")) break;

    try {
      const date = parseDate(fields[0]);
      const amount = parseAmount(fields[3] ?? "");
      if (!date || amount === 0) continue;

      const type: "income" | "expense" = amount > 0 ? "income" : "expense";
      const concept = (fields[1] ?? "").trim();
      const category = mapCategory(concept, type);

      transactions.push(
        Transaction.create({
          date,
          type,
          category,
          concept: concept || category,
          amount: Math.abs(amount),
        }),
      );
    } catch (err) {
      errors.push(`Fila ${i + 1}: ${String(err)}`);
    }
  }

  return { transactions, errors, skipped: 0 };
}
