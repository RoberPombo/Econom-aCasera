import type { ExcelImportRepository } from "../repositories/ExcelImportRepository";

export class ImportExcelUseCase {
  private readonly repository: ExcelImportRepository;

  constructor(repository: ExcelImportRepository) {
    this.repository = repository;
  }

  async execute(file: File): Promise<{ imported: number; errors: string[] }> {
    return this.repository.importExcel(file);
  }
}
