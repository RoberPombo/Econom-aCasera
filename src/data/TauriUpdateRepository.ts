import { getVersion } from "@tauri-apps/api/app";
import { check } from "@tauri-apps/plugin-updater";
import type {
  UpdateInfo,
  UpdateRepository,
} from "../domain/repositories/UpdateRepository";

export class TauriUpdateRepository implements UpdateRepository {
  async check(): Promise<UpdateInfo | null> {
    try {
      const update = await check();
      if (!update) return null;
      const currentVersion = await getVersion();
      return {
        version: update.version,
        downloadUrl: "",
        currentVersion,
      };
    } catch {
      // Updater endpoint may not be available yet (e.g. dev mode or no releases published).
      return null;
    }
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
