export const importSources = ["excel", "ing", "abanca"] as const;

export type ImportSource = (typeof importSources)[number];

export const importSourceLabels: Record<ImportSource, string> = {
  excel: "Excel",
  ing: "ING",
  abanca: "Abanca",
};

export const upcomingImportSources = [
  { id: "revolut", label: "Revolut" },
  { id: "n26", label: "N26" },
] as const;
