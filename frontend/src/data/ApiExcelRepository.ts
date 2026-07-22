import type { ExcelImportRepository } from "../domain/repositories/ExcelImportRepository";

export class ApiExcelRepository implements ExcelImportRepository {
  async importExcel(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/import-excel", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }

    return res.json();
  }
}
