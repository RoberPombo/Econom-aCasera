import { invoke } from "@tauri-apps/api/core";
import type { Transaction } from "../domain/entities";
import type { ImportSource } from "../domain/entities/ImportSource";
import { normalizeKey } from "../domain/entities/Key";
import type {
  ImportCategoryOption,
  ImportPreview,
  ImportRepository,
} from "../domain/repositories/ImportRepository";
import { computeFingerprint } from "./computeFingerprint";
import { getDatabase } from "./db";
import { parseExcel } from "./excelParser";
import { parseAbancaCsv } from "./parsers/abancaParser";
import { type ExcelCell, parseIngExcel } from "./parsers/ingParser";
import { classifySavings } from "./savingsClassifier";

export class TauriImportRepository implements ImportRepository {
  async preview(source: ImportSource, file: File): Promise<ImportPreview> {
    let candidates: Transaction[] = [];
    let errors: string[] = [];
    let categoryOptions: ImportCategoryOption[] | undefined;

    if (source === "excel") {
      const buffer = await file.arrayBuffer();
      const result = await parseExcel(buffer);
      candidates = result.transactions;
      errors = result.errors;
      categoryOptions = result.categories;
    } else if (source === "ing") {
      const buffer = await file.arrayBuffer();
      const rows = await invoke<ExcelCell[][]>("read_excel_cells", {
        fileBytes: Array.from(new Uint8Array(buffer)),
      });
      const result = parseIngExcel(rows);
      candidates = result.transactions;
      errors = result.errors;
    } else if (source === "abanca") {
      const result = parseAbancaCsv(await file.text());
      candidates = result.transactions;
      errors = result.errors;
    } else {
      throw new Error(`Fuente de importación no soportada: ${source}`);
    }

    const db = await getDatabase();
    const rows = await db.select<{ fingerprint: string }[]>(
      "SELECT fingerprint FROM transactions WHERE fingerprint IS NOT NULL",
    );
    const existing = new Set(rows.map((r) => r.fingerprint));

    const transactions: Transaction[] = [];
    let skipped = 0;
    for (const tx of candidates) {
      const fingerprint = computeFingerprint(tx);
      if (existing.has(fingerprint)) {
        skipped++;
      } else {
        transactions.push(tx);
      }
    }

    return {
      transactions: classifySavings(transactions, source),
      errors,
      skipped,
      categoryOptions,
    };
  }

  async confirm(
    transactions: ImportPreview["transactions"],
    categoryOptions?: ImportCategoryOption[],
  ): Promise<number> {
    const db = await getDatabase();

    for (const option of categoryOptions ?? []) {
      const key = normalizeKey(option.label);
      await db.execute(
        "INSERT OR IGNORE INTO categories (label, key, type, active) VALUES (?, ?, ?, 1)",
        [option.label, key, option.type],
      );
    }

    const existingRows = await db.select<{ fingerprint: string }[]>(
      "SELECT fingerprint FROM transactions WHERE fingerprint IS NOT NULL",
    );
    const existing = new Set(existingRows.map((r) => r.fingerprint));

    let inserted = 0;
    for (const tx of transactions) {
      const fingerprint = computeFingerprint(tx);
      if (existing.has(fingerprint)) {
        continue;
      }
      await db.execute(
        "INSERT INTO transactions (date, type, category, concept, amount, year, month, person, fingerprint) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          tx.date,
          tx.type,
          tx.category,
          tx.concept || tx.category,
          tx.amount,
          tx.year,
          tx.month,
          tx.person || "",
          fingerprint,
        ],
      );
      existing.add(fingerprint);
      inserted++;
    }

    return inserted;
  }
}
