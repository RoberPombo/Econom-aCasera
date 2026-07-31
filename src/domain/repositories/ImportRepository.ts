import type { Transaction } from "../entities";
import type { ImportSource } from "../entities/ImportSource";

export interface ImportPreview {
  transactions: Transaction[];
  errors: string[];
}

export interface ImportRepository {
  preview(source: ImportSource, file: File): Promise<ImportPreview>;
  confirm(transactions: Transaction[]): Promise<number>;
}
