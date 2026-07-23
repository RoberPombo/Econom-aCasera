export interface ExcelImportRepository {
  importExcel(file: File): Promise<{ imported: number; errors: string[] }>;
}
