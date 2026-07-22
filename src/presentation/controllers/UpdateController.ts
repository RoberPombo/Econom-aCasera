import type { AppContainer } from "../../application/AppContainer";
import { tmpdir } from "os";
import { join } from "path";

export class UpdateController {
  constructor(private readonly container: AppContainer) {}

  async check(): Promise<Response> {
    const update = await this.container.updateService.checkForUpdates();
    return Response.json(update ?? { version: null });
  }

  async download(): Promise<Response> {
    const update = await this.container.updateService.checkForUpdates();
    if (!update) return Response.json({ ok: false, error: "No update available" });

    const suffix = process.platform === "win32" ? ".exe" : "";
    const tempPath = join(tmpdir(), `economiacasera-update-${Date.now()}${suffix}`);

    try {
      await this.container.updateService.downloadUpdate(update.downloadUrl, tempPath);
      this.container.updateService.applyUpdate(tempPath);
      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ ok: false, error: String(err) }, { status: 500 });
    }
  }
}
