import { check } from "@tauri-apps/plugin-updater";
import { getVersion } from "@tauri-apps/api/app";
import type { UpdateInfo, UpdateRepository } from "../domain/repositories/UpdateRepository";

export class TauriUpdateRepository implements UpdateRepository {
  async check(): Promise<UpdateInfo | null> {
    const update = await check();
    if (!update) return null;
    const currentVersion = await getVersion();
    return {
      version: update.version,
      downloadUrl: "",
      currentVersion,
    };
  }

  async download(): Promise<{ ok: boolean; error?: string }> {
    const update = await check();
    if (!update) return { ok: false, error: "No update available" };
    try {
      await update.downloadAndInstall();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}
