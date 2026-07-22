export interface UpdateInfo {
  version: string;
  downloadUrl: string;
  currentVersion: string;
}

export class ApiUpdateRepository {
  async check(): Promise<UpdateInfo | null> {
    const res = await fetch("/api/update/check");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.version) return null;
    return data as UpdateInfo;
  }

  async download(): Promise<{ ok: boolean; error?: string }> {
    const res = await fetch("/api/update/download", { method: "POST" });
    return res.json();
  }
}
