import type { DbInfo } from "../domain/entities";
import type { DbInfoRepository } from "../domain/repositories/DbInfoRepository";

export class ApiDbInfoRepository implements DbInfoRepository {
  private async api<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`/api${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    return res.json();
  }

  async get(): Promise<DbInfo> {
    return this.api<DbInfo>("/db-info");
  }

  async reload(): Promise<{ ok: boolean; dbPath: string; usesDrive: boolean }> {
    return this.api<{ ok: boolean; dbPath: string; usesDrive: boolean }>("/db/reload", { method: "POST" });
  }

  async forceOverwrite(): Promise<{ ok: boolean; dbPath: string; usesDrive: boolean }> {
    return this.api<{ ok: boolean; dbPath: string; usesDrive: boolean }>("/db/force-overwrite", { method: "POST" });
  }
}
