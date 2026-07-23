import type { ExcelImportRepository } from "../domain/repositories/ExcelImportRepository";
import { getDatabase } from "./db";
import { parseExcel } from "./excelParser";

export class TauriExcelRepository implements ExcelImportRepository {
  async importExcel(file: File): Promise<{ imported: number; errors: string[] }> {
    const buffer = await file.arrayBuffer();
    const { transactions, errors } = parseExcel(buffer);
    const db = await getDatabase();

    for (const tx of transactions) {
      await db.execute(
        "INSERT INTO transactions (date, type, category, concept, amount, year, month, person) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [tx.date, tx.type, tx.category, tx.concept || tx.category, tx.amount, tx.year, tx.month, tx.person || ""]
      );
    }

    return { imported: transactions.length, errors };
  }
}
