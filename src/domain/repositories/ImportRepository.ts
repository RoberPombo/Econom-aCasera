import type { Transaction } from "../entities";
import type { ImportSource } from "../entities/ImportSource";

export type ImportCategoryOption = {
  label: string;
  type: "income" | "expense";
};

export interface ImportPreview {
  transactions: Transaction[];
  errors: string[];
  skipped: number;
  categoryOptions?: ImportCategoryOption[];
}

export interface ImportRepository {
  preview(source: ImportSource, file: File): Promise<ImportPreview>;
  confirm(transactions: Transaction[]): Promise<number>;
  addCategories(options: ImportCategoryOption[]): Promise<number>;
}
