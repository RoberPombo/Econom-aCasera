import type { DbInfoRepository } from "../repositories/DbInfoRepository";
import type { DbInfo } from "../entities";

export class GetDbInfoUseCase {
  private readonly repository: DbInfoRepository;

  constructor(repository: DbInfoRepository) {
    this.repository = repository;
  }

  async execute(): Promise<DbInfo> {
    return this.repository.get();
  }
}

export class ReloadDatabaseUseCase {
  private readonly repository: DbInfoRepository;

  constructor(repository: DbInfoRepository) {
    this.repository = repository;
  }

  async execute(): Promise<{ ok: boolean; dbPath: string; usesDrive: boolean }> {
    return this.repository.reload();
  }
}

export class ForceOverwriteUseCase {
  private readonly repository: DbInfoRepository;

  constructor(repository: DbInfoRepository) {
    this.repository = repository;
  }

  async execute(): Promise<{ ok: boolean; dbPath: string; usesDrive: boolean }> {
    return this.repository.forceOverwrite();
  }
}
