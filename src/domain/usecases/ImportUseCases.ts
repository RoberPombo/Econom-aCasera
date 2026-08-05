import type { ImportRepository, ImportPreview } from "../repositories/ImportRepository";
import type { ImportSource } from "../entities/ImportSource";

export class PreviewImportUseCase {
  private readonly repository: ImportRepository;

  constructor(repository: ImportRepository) {
    this.repository = repository;
  }

  async execute(source: ImportSource, file: File): Promise<ImportPreview> {
    return this.repository.preview(source, file);
  }
}

export class ConfirmImportUseCase {
  private readonly repository: ImportRepository;

  constructor(repository: ImportRepository) {
    this.repository = repository;
  }

  async execute(transactions: ImportPreview["transactions"]): Promise<number> {
    return this.repository.confirm(transactions);
  }
}
