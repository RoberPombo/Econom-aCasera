import { invoke } from "@tauri-apps/api/core";
import type { DbInfo } from "../domain/entities/DbInfo";
import type { DbInfoRepository } from "../domain/repositories/DbInfoRepository";

export class TauriDbInfoRepository implements DbInfoRepository {
  async get(): Promise<DbInfo> {
    return invoke<DbInfo>("get_db_info");
  }

  async reload(): Promise<{ ok: boolean; dbPath: string; usesDrive: boolean }> {
    return invoke("reload_database");
  }

  async forceOverwrite(): Promise<{
    ok: boolean;
    dbPath: string;
    usesDrive: boolean;
  }> {
    return invoke("force_overwrite");
  }

  async sync(): Promise<void> {
    await invoke("sync_database");
  }
}
