import type { ImportRepository, ImportPreview } from "../domain/repositories/ImportRepository";
import type { ImportSource } from "../domain/entities/ImportSource";
import { getDatabase } from "./db";
import { parseExcel } from "./excelParser";

export class TauriImportRepository implements ImportRepository {
  async preview(source: ImportSource, file: File): Promise<ImportPreview> {
    if (source === "excel") {
      const buffer = await file.arrayBuffer();
      const { transactions, errors } = parseExcel(buffer);
      return { transactions, errors };
    }

    throw new Error(`Fuente de importación no soportada: ${source}`);
  }

  async confirm(transactions: ImportPreview["transactions"]): Promise<number> {
    const db = await getDatabase();

    for (const tx of transactions) {
      await db.execute(
        "INSERT INTO transactions (date, type, category, concept, amount, year, month, person) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [tx.date, tx.type, tx.category, tx.concept || tx.category, tx.amount, tx.year, tx.month, tx.person || ""]
      );
    }

    return transactions.length;
  }
}
