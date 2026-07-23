export interface UpdateInfo {
  version: string;
  downloadUrl: string;
  currentVersion: string;
}

export interface UpdateRepository {
  check(): Promise<UpdateInfo | null>;
  download(): Promise<{ ok: boolean; error?: string }>;
}
