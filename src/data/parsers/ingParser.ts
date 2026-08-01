import { Transaction } from "../../domain/entities";
import type { ImportPreview } from "../../domain/repositories/ImportRepository";

const ingCategories = [
  "Vehículo y transporte",
  "Movimientos excluidos",
  "Nómina y otras prestaciones",
  "Ocio y viajes",
  "Otros gastos",
  "Alimentación",
  "Compras",
  "Hogar",
];

const descriptionMarkers = [
  "Nomina recibida",
  "Traspaso interno",
  "Traspaso emitido",
  "Traspaso recibido",
  "Transferencia emitida",
  "Transferencia recibida",
  "Pago en",
  "Reintegro",
  "Domiciliado",
  "Recibo",
  "Ingreso",
  "Compra",
  "Pago",
  "Cargo",
  "Abono",
  "Devolución",
].sort((a, b) => b.length - a.length);

function extractCategory(detail: string): string {
  for (const cat of ingCategories) {
    if (detail.startsWith(cat)) {
      return cat;
    }
  }
  return "";
}

function extractConcept(detail: string, category: string): string {
  let rest = category ? detail.substring(category.length).trim() : detail;
  for (const marker of descriptionMarkers) {
    const idx = rest.indexOf(marker);
    if (idx !== -1) {
      return rest.substring(idx).trim();
    }
  }
  return rest;
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

function parseNumber(value: string): number {
  const normalized = value.replace(/,/g, "");
  return parseFloat(normalized);
}

function parseDate(value: string): string {
  const [day, month, year] = value.split("/");
  return `${year}-${month}-${day}`;
}

function parseLine(line: string): Transaction {
  const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})/);
  if (!dateMatch) {
    throw new Error(`No se reconoce la fecha en la línea: ${line}`);
  }

  const numberRegex = /-?\d{1,3}(?:,\d{3})*\.\d{2}|-?\d+\.\d{2}/g;
  const numbers = [...line.matchAll(numberRegex)].map((m) => m[0]);
  if (numbers.length < 2) {
    throw new Error(`No se encontraron importe y saldo en la línea: ${line}`);
  }

  const amountStr = numbers[numbers.length - 2];
  const amountIndex = line.lastIndexOf(amountStr);
  const detail = line.substring(dateMatch[0].length, amountIndex).trim();

  const signedAmount = parseNumber(amountStr);
  if (isNaN(signedAmount) || signedAmount === 0) {
    throw new Error(`Importe inválido en la línea: ${line}`);
  }

  const type = signedAmount > 0 ? "income" : "expense";
  const amount = Math.abs(signedAmount);
  const category = extractCategory(detail);
  const concept = extractConcept(detail, category);
  const appCategory = mapCategory(category, type);

  return Transaction.create({
    date: parseDate(dateMatch[1]),
    type,
    category: appCategory,
    concept,
    amount,
  });
}

export function parseIng(text: string): ImportPreview {
  // pdf-extract sometimes returns the whole page as a single line. Insert a
  // newline before every date so the movement-based tokenizer works reliably.
  const normalized = text.replace(/(\d{2}\/\d{2}\/\d{4})/g, "\n$1");

  const lines = normalized
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const movements: string[] = [];
  let current = "";
  const amountRegex = /-?\d{1,3}(?:,\d{3})*\.\d{2}|-?\d+\.\d{2}/;
  for (const line of lines) {
    const isMovementLine = /^\d{2}\/\d{2}\/\d{4}/.test(line) && amountRegex.test(line);
    if (isMovementLine) {
      if (current) movements.push(current);
      current = line;
    } else if (current) {
      current += " " + line;
    }
  }
  if (current) movements.push(current);

  const transactions: Transaction[] = [];
  const errors: string[] = [];

  for (const line of movements) {
    try {
      transactions.push(parseLine(line));
    } catch (err) {
      errors.push(String(err));
    }
  }

  return { transactions, errors };
}
