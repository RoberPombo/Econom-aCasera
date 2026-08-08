import type { Transaction } from "../domain/entities";
import type { ImportSource } from "../domain/entities/ImportSource";

const SAVINGS_PATTERNS: Partial<Record<ImportSource, string[]>> = {
  ing: ["ahorro"],
  excel: ["ahorro"],
};

const SAVINGS_CATEGORY = "Ahorro";

function normalize(text: string): string {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function classifySavings(
  transactions: Transaction[],
  source: ImportSource,
): Transaction[] {
  const patterns = (SAVINGS_PATTERNS[source] ?? []).map(normalize);
  if (patterns.length === 0) return transactions;

  return transactions.map((t) => {
    if (t.type !== "expense") return t;
    const concept = normalize(t.concept);
    const category = normalize(t.category);
    const matches = patterns.some((pattern) => {
      return concept.includes(pattern) || category.includes(pattern);
    });
    if (!matches) return t;
    return t.withUpdates({ type: "savings", category: SAVINGS_CATEGORY });
  });
}
