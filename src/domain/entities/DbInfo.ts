export interface DbInfo {
  dbPath: string;
  backupPath: string;
  usesDrive: boolean;
  driveFolder: string | null;
  hasConflict: boolean;
}
