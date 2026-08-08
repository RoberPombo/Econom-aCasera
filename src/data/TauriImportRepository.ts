import { invoke } from "@tauri-apps/api/core";
import type { Transaction } from "../domain/entities";
import type { ImportSource } from "../domain/entities/ImportSource";
import type {
  ImportPreview,
  ImportRepository,
} from "../domain/repositories/ImportRepository";
import { computeFingerprint } from "./computeFingerprint";
import { getDatabase } from "./db";
import { parseExcel } from "./excelParser";
import { type ExcelCell, parseIngExcel } from "./parsers/ingParser";

export class TauriImportRepository implements ImportRepository {
  async preview(source: ImportSource, file: File): Promise<ImportPreview> {
    let candidates: Transaction[] = [];
    let errors: string[] = [];

    if (source === "excel") {
      const buffer = await file.arrayBuffer();
      const result = await parseExcel(buffer);
      candidates = result.transactions;
      errors = result.errors;
    } else if (source === "ing") {
      const buffer = await file.arrayBuffer();
      const rows = await invoke<ExcelCell[][]>("read_excel_cells", {
        fileBytes: Array.from(new Uint8Array(buffer)),
      });
      const result = parseIngExcel(rows);
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

    return { transactions, errors, skipped };
  }

  async confirm(transactions: ImportPreview["transactions"]): Promise<number> {
    const db = await getDatabase();

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
