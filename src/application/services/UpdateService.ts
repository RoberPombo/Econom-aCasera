import { existsSync, renameSync, chmodSync } from "fs";
import { execPath } from "process";
import { join, dirname, basename } from "path";

export interface UpdateInfo {
  version: string;
  downloadUrl: string;
  currentVersion: string;
}

const OWNER = "RoberPombo";
const REPO = "Econom-aCasera";

export class UpdateService {
  private readonly currentVersion: string;

  constructor() {
    this.currentVersion = (globalThis as any).APP_VERSION || process.env.APP_VERSION || "0.0.0";
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  async checkForUpdates(): Promise<UpdateInfo | null> {
    const release = await this.fetchLatestRelease();
    if (!release) return null;

    const latestVersion = release.tag_name.replace(/^v/, "");
    if (!this.isNewer(latestVersion, this.currentVersion)) return null;

    const asset = this.findAsset(release.assets);
    if (!asset) return null;

    return {
      version: latestVersion,
      downloadUrl: asset.browser_download_url,
      currentVersion: this.currentVersion,
    };
  }

  private async fetchLatestRelease(): Promise<any | null> {
    try {
      const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": `${REPO}/${this.currentVersion}`,
        },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  private findAsset(assets: any[]): any | null {
    const platform = process.platform;
    const suffix = platform === "win32" ? ".exe" : platform === "darwin" ? "-mac" : "";
    return assets.find((a) => a.name.endsWith(suffix)) || null;
  }

  private isNewer(latest: string, current: string): boolean {
    const normalize = (v: string) => v.replace(/^v/, "").split(".").map(Number);
    const latestParts = normalize(latest);
    const currentParts = normalize(current);
    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const l = latestParts[i] || 0;
      const c = currentParts[i] || 0;
      if (l > c) return true;
      if (l < c) return false;
    }
    return false;
  }

  async downloadUpdate(url: string, targetPath: string): Promise<void> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download update: ${res.statusText}`);

    const blob = await res.blob();
    await Bun.write(targetPath, blob);

    if (process.platform !== "win32") {
      chmodSync(targetPath, 0o755);
    }
  }

  applyUpdate(downloadedPath: string): void {
    const currentBinary = execPath;
    if (process.platform === "win32") {
      const dir = dirname(currentBinary);
      const base = basename(currentBinary);
      const oldPath = join(dir, `${base}.old`);
      const ps1Path = join(dir, "apply-update.ps1");

      if (existsSync(oldPath)) {
        try { require("fs").unlinkSync(oldPath); } catch {}
      }
      renameSync(currentBinary, oldPath);
      renameSync(downloadedPath, currentBinary);

      const script = [
        "Start-Sleep -Seconds 2",
        `Remove-Item -Path '${oldPath.replace(/'/g, "''")}' -ErrorAction SilentlyContinue`,
        `Remove-Item -Path '${ps1Path.replace(/'/g, "''")}' -ErrorAction SilentlyContinue`,
      ].join("\n");
      require("fs").writeFileSync(ps1Path, script);

      const { spawn } = require("child_process");
      spawn("powershell.exe", ["-WindowStyle", "Hidden", "-ExecutionPolicy", "Bypass", "-File", ps1Path], {
        detached: true,
        stdio: "ignore",
      }).unref();
      process.exit(0);
    } else {
      const oldPath = `${currentBinary}.old`;
      if (existsSync(oldPath)) {
        try { require("fs").unlinkSync(oldPath); } catch {}
      }
      renameSync(currentBinary, oldPath);
      renameSync(downloadedPath, currentBinary);

      const { spawn } = require("child_process");
      spawn(currentBinary, process.argv.slice(1), {
        detached: true,
        stdio: "ignore",
      }).unref();
      process.exit(0);
    }
  }
}
