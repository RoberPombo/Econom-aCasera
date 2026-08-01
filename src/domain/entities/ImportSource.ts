export const importSources = ["excel", "ing"] as const;

export type ImportSource = (typeof importSources)[number];

export const importSourceLabels: Record<ImportSource, string> = {
  excel: "Excel",
  ing: "ING",
};

export const upcomingImportSources = [
  { id: "revolut", label: "Revolut" },
  { id: "n26", label: "N26" },
] as const;
