import { useRef, useState } from "react";
import type { Person, TransactionType } from "../../domain/entities";
import { Transaction } from "../../domain/entities";
import type { ImportSource } from "../../domain/entities/ImportSource";
import {
  importSourceLabels,
  importSources,
  upcomingImportSources,
} from "../../domain/entities/ImportSource";
import { normalizeKey } from "../../domain/entities/Key";
import {
  btn,
  btnSecondary,
  hint,
  sectionTitle,
  table,
  tableWrap,
  td,
  th,
} from "../styles";

const acceptBySource: Record<ImportSource, string> = {
  excel: ".xlsx,.xls",
  ing: ".xls,.xlsx",
};

const sourceHints: Record<ImportSource, string> = {
  excel: "Formato Excel (.xlsx o .xls)",
  ing: "Formato Excel (.xls o .xlsx) descargado desde ING",
};

const ingDownloadGuide =
  "Para descargar los movimientos en Excel: inicia sesión en la web/app de ING, entra en la " +
  "cuenta, abre Movimientos, pulsa en el icono de descarga y elige la opción “Excel”. " +
  "El archivo descargado suele llamarse movements-XXXXX.xls. Súbelo aquí tal cual.";

export type ImportRow = {
  date: string;
  type: TransactionType;
  category: string;
  concept: string;
  amount: string;
  person: string;
};

interface Props {
  persons: Person[];
  onPreview: (
    source: ImportSource,
    file: File,
  ) => Promise<{
    transactions: Transaction[];
    errors: string[];
    skipped: number;
  }>;
  onConfirm: (transactions: Transaction[]) => Promise<number>;
}

function formatAmount(value: number | string): string {
  const num =
    typeof value === "number" ? value : parseFloat(value.replace(",", "."));
  if (Number.isNaN(num)) return String(value);
  return num.toFixed(2).replace(".", ",");
}

function transactionToRow(tx: Transaction): ImportRow {
  return {
    date: tx.date,
    type: tx.type,
    category: tx.category,
    concept: tx.concept,
    amount: formatAmount(tx.amount),
    person: tx.person,
  };
}

function rowToTransaction(row: ImportRow): Transaction {
  return Transaction.create({
    date: row.date,
    type: row.type,
    category: normalizeKey(row.category.trim()),
    concept: row.concept.trim(),
    amount: parseFloat(row.amount.replace(",", ".")) || 0,
    person: normalizeKey(row.person.trim()),
  });
}

function validateRow(row: ImportRow, index: number): string[] {
  const errors: string[] = [];
  if (!row.date || Number.isNaN(new Date(row.date).getTime())) {
    errors.push(`Fila ${index + 1}: fecha inválida`);
  }
  if (!["income", "expense", "savings"].includes(row.type)) {
    errors.push(`Fila ${index + 1}: tipo inválido`);
  }
  if (!row.category.trim()) {
    errors.push(`Fila ${index + 1}: categoría vacía`);
  }
  if (!row.concept.trim()) {
    errors.push(`Fila ${index + 1}: concepto vacío`);
  }
  const amount = parseFloat(row.amount.replace(",", "."));
  if (Number.isNaN(amount) || amount <= 0) {
    errors.push(`Fila ${index + 1}: importe inválido`);
  }
  return errors;
}

export function ImportView({ persons, onPreview, onConfirm }: Props) {
  const [source, setSource] = useState<ImportSource>("excel");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parserErrors, setParserErrors] = useState<string[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePersons = persons.filter((p) => p.active);

  async function handlePreview() {
    if (!file) return;
    setLoading(true);
    setRows([]);
    setParserErrors([]);
    setSkipped(0);
    setSaveMessage(null);
    try {
      const result = await onPreview(source, file);
      console.log("[ImportView] preview result", result);
      setRows(result.transactions.map(transactionToRow));
      setParserErrors(result.errors);
      setSkipped(result.skipped);
    } catch (err) {
      setParserErrors([String(err)]);
    } finally {
      setLoading(false);
    }
  }

  function updateRow(index: number, patch: Partial<ImportRow>) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm() {
    if (validationErrors.length > 0) return;
    setSaving(true);
    try {
      const transactions = rows.map(rowToTransaction);
      const inserted = await onConfirm(transactions);
      const skippedNow = transactions.length - inserted;
      setSaveMessage(
        inserted > 0
          ? `Guardados ${inserted} movimiento${inserted > 1 ? "s" : ""}${skippedNow > 0 ? ` (${skippedNow} ya existían)` : ""}.`
          : `No se guardó nada: los ${transactions.length} movimiento${transactions.length > 1 ? "s" : ""} ya existían en la base de datos.`,
      );
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
    setSkipped(0);
    setSaveMessage(null);
  }

  const validationErrors = rows.flatMap((row, index) =>
    validateRow(row, index),
  );
  const extensionErr = extensionError();
  const allErrors = [
    ...(extensionErr ? [extensionErr] : []),
    ...parserErrors,
    ...validationErrors,
  ];
  const showIngGuide =
    source === "ing" && (extensionErr != null || parserErrors.length > 0);

  function extensionError(): string | null {
    if (!file) return null;
    const lower = file.name.toLowerCase();
    if (source === "ing" && !/(\.xls|\.xlsx)$/.test(lower)) {
      return `El archivo "${file.name}" no es un Excel de ING. ${ingDownloadGuide}`;
    }
    return null;
  }

  return (
    <div>
      <h2 className={sectionTitle}>Importar</h2>
      <p className={hint}>
        Pulsa sobre la fuente para elegir el archivo y previsualizar los
        movimientos antes de guardarlos.
        {source === "ing" &&
          ` La fuente ING espera el Excel de movimientos (${acceptBySource.ing}).`}
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
            title={sourceHints[s]}
          >
            {importSourceLabels[s]}
            <span className="ml-2 rounded bg-black/10 px-1.5 py-0.5 text-[0.7rem]">
              {s === "ing" ? ".xls" : ".xlsx"}
            </span>
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
          <span className="text-body">
            Archivo: <strong>{file.name}</strong>
          </span>
          <button
            type="button"
            className={`${btn} px-3 py-1 text-[0.85rem]`}
            onClick={handlePreview}
            disabled={loading}
          >
            {loading ? "Leyendo..." : "Previsualizar"}
          </button>
          <button
            type="button"
            className={`${btnSecondary} px-3 py-1 text-[0.85rem]`}
            onClick={() => {
              setFile(null);
              setRows([]);
              setParserErrors([]);
              setSkipped(0);
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
          {showIngGuide && (
            <div className="mt-2 rounded-lg border border-line bg-surface p-3 text-body">
              <p className="font-semibold">
                ¿Cómo descargar los movimientos de ING?
              </p>
              <p className="mt-1 text-[0.9rem]">{ingDownloadGuide}</p>
            </div>
          )}
        </div>
      )}

      {skipped > 0 && (
        <p className="mb-4 text-muted">
          {rows.length === 0
            ? `No se guardará nada: los ${skipped} movimiento${skipped > 1 ? "s" : ""} del archivo ya existen en la base de datos.`
            : `${skipped} movimiento${skipped > 1 ? "s" : ""} omitido${skipped > 1 ? "s" : ""} porque ya existen en la base de datos.`}
        </p>
      )}

      {saveMessage && <p className="mb-4 text-body">{saveMessage}</p>}

      {!loading &&
        file &&
        rows.length === 0 &&
        parserErrors.length === 0 &&
        skipped === 0 && (
          <p className="mb-4 text-muted">
            No se encontraron movimientos en el archivo. Comprueba que sea el
            Excel de movimientos correcto
            {source === "ing" && " descargado desde ING"} y que contenga las
            columnas de fecha, categoría e importe.
          </p>
        )}

      {rows.length > 0 && (
        <>
          <div className={tableWrap}>
            <table className={`${table} table-fixed`}>
              <thead>
                <tr>
                  <th className={`${th} w-[120px]`}>Fecha</th>
                  <th className={`${th} w-[120px]`}>Tipo</th>
                  <th className={`${th} w-[130px]`}>Categoría</th>
                  <th className={`${th} min-w-[220px]`}>Concepto</th>
                  <th className={`${th} w-[115px]`}>Importe (€)</th>
                  <th className={`${th} w-[160px]`}>Persona</th>
                  <th className={`${th} w-[80px]`}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const rowErrors = validateRow(row, index).length > 0;
                  return (
                    <tr
                      key={index}
                      className={rowErrors ? "bg-expense/10" : undefined}
                    >
                      <td className={`${td} align-top`}>
                        <input
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            updateRow(index, { date: e.target.value })
                          }
                        />
                      </td>
                      <td className={`${td} align-top`}>
                        <select
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          value={row.type}
                          onChange={(e) =>
                            updateRow(index, {
                              type: e.target.value as TransactionType,
                            })
                          }
                        >
                          <option value="income">Ingreso</option>
                          <option value="expense">Gasto</option>
                          <option value="savings">Ahorro</option>
                        </select>
                      </td>
                      <td className={`${td} align-top`}>
                        <input
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          type="text"
                          value={row.category}
                          onChange={(e) =>
                            updateRow(index, { category: e.target.value })
                          }
                        />
                      </td>
                      <td className={`${td} align-top`}>
                        <textarea
                          className="w-full min-h-[3rem] resize-y rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          rows={2}
                          value={row.concept}
                          onChange={(e) =>
                            updateRow(index, {
                              concept: e.target.value.replace(/\n/g, " "),
                            })
                          }
                        />
                      </td>
                      <td className={`${td} align-top`}>
                        <input
                          className="w-full rounded-lg border border-line bg-surface p-2 text-right text-[0.95rem] text-body"
                          type="text"
                          inputMode="decimal"
                          value={row.amount}
                          onChange={(e) =>
                            updateRow(index, { amount: e.target.value })
                          }
                          onBlur={() =>
                            updateRow(index, {
                              amount: formatAmount(row.amount),
                            })
                          }
                        />
                      </td>
                      <td className={`${td} align-top`}>
                        <select
                          className="w-full rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body"
                          value={row.person}
                          onChange={(e) =>
                            updateRow(index, { person: e.target.value })
                          }
                        >
                          <option value="">Sin asignar</option>
                          {activePersons.map((p) => (
                            <option key={String(p.id)} value={p.key}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className={`${td} align-top`}>
                        <button
                          type="button"
                          className={`${btnSecondary} px-2 py-1 text-[0.85rem]`}
                          onClick={() => removeRow(index)}
                        >
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
              type="button"
              className={btn}
              onClick={handleConfirm}
              disabled={validationErrors.length > 0 || saving}
            >
              {saving ? "Guardando..." : `Guardar ${rows.length} movimientos`}
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                setRows([]);
                setParserErrors([]);
                setSkipped(0);
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
