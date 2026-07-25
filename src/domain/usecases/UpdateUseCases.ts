import type { UpdateInfo, UpdateRepository } from "../repositories/UpdateRepository";

export class CheckForUpdateUseCase {
  private readonly repository: UpdateRepository;

  constructor(repository: UpdateRepository) {
    this.repository = repository;
  }

  async execute(): Promise<UpdateInfo | null> {
    return this.repository.check();
  }
}

export class DownloadUpdateUseCase {
  private readonly repository: UpdateRepository;

  constructor(repository: UpdateRepository) {
    this.repository = repository;
  }

  async execute(): Promise<{ ok: boolean; error?: string }> {
    return this.repository.download();
  }
}
