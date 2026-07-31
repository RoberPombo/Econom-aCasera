import { useState, useRef } from "react";
import { hint, importResult, input } from "../styles";

interface Props {
  onImport: (file: File) => Promise<{ imported: number; errors: string[] }>;
  onImported: () => void;
}

export function ImportExcel({ onImport, onImported }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await onImport(file);
      setResult(res);
      if (res.imported > 0) onImported();
    } catch (err) {
      alert("Error al importar: " + String(err));
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <h2>Importar desde Excel</h2>
      <p className={hint}>
        Se espera un archivo con una hoja por mes (Ene., Feb., Mar., ...) y una tabla de transacciones con:
        categoría, tipo, día, mes, año, euros y descripción.
      </p>
      <input ref={inputRef} className={input} type="file" accept=".xlsx,.xls" onChange={handleFile} disabled={loading} />
      {loading && <p>Importando...</p>}
      {result && (
        <div className={importResult}>
          <p>Importados: {result.imported}</p>
          {result.errors.length > 0 && (
            <details>
              <summary>Errores ({result.errors.length})</summary>
              <ul className="my-4 list-disc pl-10">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
