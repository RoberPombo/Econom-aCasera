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

const ING_NUMBER_PATTERN = "-?\\d{1,3}(?:,\\d{3})*\\.\\d{2}";

function getIngNumberRegex(): RegExp {
  return new RegExp(ING_NUMBER_PATTERN, "g");
}

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

function roundCents(value: number): number {
  return Number(value.toFixed(2));
}

function parseDate(value: string): string {
  const [day, month, year] = value.split("/");
  return `${year}-${month}-${day}`;
}

function formatWithCommas(amount: number, negative: boolean): string {
  const [intPart, decPart] = amount.toFixed(2).split(".");
  const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${intWithCommas}.${decPart}`;
}

function formatWithoutCommas(amount: number, negative: boolean): string {
  return `${negative ? "-" : ""}${amount.toFixed(2)}`;
}

function removeAmountFromDetail(detail: string, amount: number): string {
  const trimmed = detail.trimEnd();
  const absAmount = Math.abs(amount);
  const negative = amount < 0;

  const candidates = [
    formatWithCommas(absAmount, negative),
    formatWithoutCommas(absAmount, negative),
  ];

  for (const candidate of candidates) {
    if (trimmed.endsWith(candidate)) {
      return trimmed.substring(0, trimmed.length - candidate.length).trimEnd();
    }
  }

  // Fallback: return the detail untouched if we cannot locate the amount.
  return detail;
}

interface ParsedMovement {
  date: string;
  detail: string;
  balance: number;
  line: string;
}

function parseMovementLine(line: string): ParsedMovement | null {
  const dateMatch = line.match(/^(\d{2}\/\d{2}\/\d{4})/);
  if (!dateMatch) {
    return null;
  }

  const matches = [...line.matchAll(getIngNumberRegex())];
  if (matches.length === 0) {
    return null;
  }

  const balanceMatch = matches[matches.length - 1];
  const balanceStr = balanceMatch[0];
  const balanceIndex = balanceMatch.index ?? line.lastIndexOf(balanceStr);
  const balance = parseNumber(balanceStr);
  if (isNaN(balance)) {
    return null;
  }

  const detail = line.substring(dateMatch[0].length, balanceIndex).trim();

  return {
    date: parseDate(dateMatch[1]),
    detail,
    balance,
    line,
  };
}

function parseAmountFromLine(line: string): number | null {
  const matches = [...line.matchAll(getIngNumberRegex())];
  if (matches.length < 2) {
    return null;
  }
  const amountStr = matches[matches.length - 2][0];
  const amount = parseNumber(amountStr);
  return isNaN(amount) ? null : amount;
}

function buildTransaction(movement: ParsedMovement, amount: number): Transaction {
  if (amount === 0 || isNaN(amount)) {
    throw new Error(`Importe inválido en la línea: ${movement.line}`);
  }

  const type = amount > 0 ? "income" : "expense";
  const detailWithoutAmount = removeAmountFromDetail(movement.detail, amount);
  const category = extractCategory(detailWithoutAmount);
  const concept = extractConcept(detailWithoutAmount, category);
  const appCategory = mapCategory(category, type);

  return Transaction.create({
    date: movement.date,
    type,
    category: appCategory,
    concept,
    amount: Math.abs(amount),
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

  const movements: ParsedMovement[] = [];
  let currentLine = "";
  for (const line of lines) {
    const isMovementLine = /^\d{2}\/\d{2}\/\d{4}/.test(line) && new RegExp(ING_NUMBER_PATTERN).test(line);
    if (isMovementLine) {
      if (currentLine) {
        const parsed = parseMovementLine(currentLine);
        if (parsed) movements.push(parsed);
      }
      currentLine = line;
    } else if (currentLine) {
      currentLine += " " + line;
    }
  }
  if (currentLine) {
    const parsed = parseMovementLine(currentLine);
    if (parsed) movements.push(parsed);
  }

  const transactions: Transaction[] = [];
  const errors: string[] = [];

  for (let i = 0; i < movements.length; i++) {
    try {
      const movement = movements[i];
      let amount: number;
      if (i < movements.length - 1) {
        amount = roundCents(movement.balance - movements[i + 1].balance);
      } else {
        const parsed = parseAmountFromLine(movement.line);
        if (parsed === null) {
          throw new Error(`No se pudo determinar el importe en la línea: ${movement.line}`);
        }
        amount = roundCents(parsed);
      }
      transactions.push(buildTransaction(movement, amount));
    } catch (err) {
      errors.push(String(err));
    }
  }

  return { transactions, errors, skipped: 0 };
}
