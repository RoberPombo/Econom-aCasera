export const importSources = ["excel"] as const;

export type ImportSource = (typeof importSources)[number];

export const importSourceLabels: Record<ImportSource, string> = {
  excel: "Excel",
};

export const upcomingImportSources = [
  { id: "ing", label: "ING" },
  { id: "revolut", label: "Revolut" },
  { id: "n26", label: "N26" },
] as const;
