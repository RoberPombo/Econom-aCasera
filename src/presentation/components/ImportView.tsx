import { useRef, useState } from "react";
import { Transaction } from "../../domain/entities";
import type { Person } from "../../domain/entities";
import type { ImportSource } from "../../domain/entities/ImportSource";
import { importSources, importSourceLabels, upcomingImportSources } from "../../domain/entities/ImportSource";
import { btn, btnSecondary, hint, sectionTitle, table, tableWrap, td, th } from "../styles";

const acceptBySource: Record<ImportSource, string> = {
  excel: ".xlsx,.xls",
  ing: ".pdf",
};

export type ImportRow = {
  date: string;
  type: "income" | "expense";
  category: string;
  concept: string;
  amount: string;
  person: string;
};

interface Props {
  persons: Person[];
  onPreview: (source: ImportSource, file: File) => Promise<{ transactions: Transaction[]; errors: string[] }>;
  onConfirm: (transactions: Transaction[]) => Promise<number>;
}

function transactionToRow(tx: Transaction): ImportRow {
  return {
    date: tx.date,
    type: tx.type,
    category: tx.category,
    concept: tx.concept,
    amount: String(tx.amount),
    person: tx.person,
  };
}

function rowToTransaction(row: ImportRow): Transaction {
  return Transaction.create({
    date: row.date,
    type: row.type,
    category: row.category.trim(),
    concept: row.concept.trim(),
    amount: parseFloat(row.amount) || 0,
    person: row.person.trim(),
  });
}

function validateRow(row: ImportRow, index: number): string[] {
  const errors: string[] = [];
  if (!row.date || isNaN(new Date(row.date).getTime())) {
    errors.push(`Fila ${index + 1}: fecha inválida`);
  }
  if (!["income", "expense"].includes(row.type)) {
    errors.push(`Fila ${index + 1}: tipo inválido`);
  }
  if (!row.category.trim()) {
    errors.push(`Fila ${index + 1}: categoría vacía`);
  }
  if (!row.concept.trim()) {
    errors.push(`Fila ${index + 1}: concepto vacío`);
  }
  const amount = parseFloat(row.amount);
  if (isNaN(amount) || amount <= 0) {
    errors.push(`Fila ${index + 1}: importe inválido`);
  }
  return errors;
}

export function ImportView({ persons, onPreview, onConfirm }: Props) {
  const [source, setSource] = useState<ImportSource>("excel");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parserErrors, setParserErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePersons = persons.filter((p) => p.active);

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    setRows([]);
    setParserErrors([]);
    try {
      const result = await onPreview(source, file);
      setRows(result.transactions.map(transactionToRow));
      setParserErrors(result.errors);
    } catch (err) {
      setParserErrors([String(err)]);
    } finally {
      setLoading(false);
    }
  }

  function updateRow(index: number, patch: Partial<ImportRow>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm() {
    if (validationErrors.length > 0) return;
    setSaving(true);
    try {
      const transactions = rows.map(rowToTransaction);
      await onConfirm(transactions);
      setRows([]);
      setParserErrors([]);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setParserErrors((prev) => [...prev, String(err)]);
    } finally {
      setSaving(false);
    }
  }

  function handleSourceClick(s: ImportSource) {
    setSource(s);
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setRows([]);
    setParserErrors([]);
  }

  const validationErrors = rows.flatMap((row, index) => validateRow(row, index));
  const allErrors = [...parserErrors, ...validationErrors];

  return (
    <div>
      <h2 className={sectionTitle}>Importar</h2>
      <p className={hint}>
        Pulsa sobre la fuente para elegir el archivo y previsualizar los movimientos antes de guardarlos.
      </p>

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={acceptBySource[source]}
        onChange={handleFileChange}
        disabled={loading}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {importSources.map((s) => (
          <button
            key={s}
            type="button"
            className={`cursor-pointer rounded-lg border px-3 py-2 text-[0.95rem] ${
              source === s
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-body"
            }`}
            onClick={() => handleSourceClick(s)}
            disabled={loading}
          >
            {importSourceLabels[s]}
          </button>
        ))}
        {upcomingImportSources.map((s) => (
          <span
            key={s.id}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-[0.95rem] text-muted"
            title="Próximamente"
          >
            {s.label} (próx.)
          </span>
        ))}
      </div>

      {file && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-body">Archivo: <strong>{file.name}</strong></span>
          <button className={`${btn} px-3 py-1 text-[0.85rem]`} onClick={handlePreview} disabled={loading}>
            {loading ? "Leyendo..." : "Previsualizar"}
          </button>
          <button
            className={`${btnSecondary} px-3 py-1 text-[0.85rem]`}
            onClick={() => {
              setFile(null);
              setRows([]);
              setParserErrors([]);
              if (inputRef.current) inputRef.current.value = "";
            }}
            disabled={loading}
          >
            Cambiar
          </button>
        </div>
      )}

      {allErrors.length > 0 && (
        <div className="mb-4 rounded-lg border border-expense bg-surface p-3">
          <p className="font-semibold text-expense">Errores detectados:</p>
          <ul className="my-2 list-disc pl-5">
            {allErrors.map((e, i) => (
              <li key={i} className="text-expense">
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className={tableWrap}>
            <table className={table}>
              <thead>
                <tr>
                  <th className={th}>Fecha</th>
                  <th className={th}>Tipo</th>
                  <th className={th}>Categoría</th>
                  <th className={th}>Concepto</th>
                  <th className={th}>Importe</th>
                  <th className={th}>Persona</th>
                  <th className={th}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const rowErrors = validateRow(row, index).length > 0;
                  return (
                    <tr key={index} className={rowErrors ? "bg-expense/10" : undefined}>
                      <td className={td}>
                        <input
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          type="date"
                          value={row.date}
                          onChange={(e) => updateRow(index, { date: e.target.value })}
                        />
                      </td>
                      <td className={td}>
                        <select
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          value={row.type}
                          onChange={(e) => updateRow(index, { type: e.target.value as "income" | "expense" })}
                        >
                          <option value="income">Ingreso</option>
                          <option value="expense">Gasto</option>
                        </select>
                      </td>
                      <td className={td}>
                        <input
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          type="text"
                          value={row.category}
                          onChange={(e) => updateRow(index, { category: e.target.value })}
                        />
                      </td>
                      <td className={td}>
                        <input
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          type="text"
                          value={row.concept}
                          onChange={(e) => updateRow(index, { concept: e.target.value })}
                        />
                      </td>
                      <td className={td}>
                        <input
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={row.amount}
                          onChange={(e) => updateRow(index, { amount: e.target.value })}
                        />
                      </td>
                      <td className={td}>
                        <select
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          value={row.person}
                          onChange={(e) => updateRow(index, { person: e.target.value })}
                        >
                          <option value="">Sin asignar</option>
                          {activePersons.map((p) => (
                            <option key={String(p.id)} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={td}>
                        <button className={`${btnSecondary} px-2 py-1 text-[0.85rem]`} onClick={() => removeRow(index)}>
                          Quitar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className={btn}
              onClick={handleConfirm}
              disabled={validationErrors.length > 0 || saving}
            >
              {saving ? "Guardando..." : `Guardar ${rows.length} movimientos`}
            </button>
            <button
              className={btnSecondary}
              onClick={() => {
                setRows([]);
                setParserErrors([]);
              }}
            >
              Limpiar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
