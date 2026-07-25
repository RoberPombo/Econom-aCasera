import type { DbInfo } from "../entities";

export interface DbInfoRepository {
  get(): Promise<DbInfo>;
  reload(): Promise<{ ok: boolean; dbPath: string; usesDrive: boolean }>;
  forceOverwrite(): Promise<{ ok: boolean; dbPath: string; usesDrive: boolean }>;
}
