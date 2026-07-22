import { useState, useRef } from "react";
import { importExcel } from "./api";

interface Props {
  onImported: () => void;
}

export function ImportExcel({ onImported }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await importExcel(file);
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
      <p className="hint">
        Se espera un archivo con una hoja por mes (Ene., Feb., Mar., ...) y una tabla de transacciones con:
        categoría, tipo, día, mes, año, euros y descripción.
      </p>
      <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleFile} disabled={loading} />
      {loading && <p>Importando...</p>}
      {result && (
        <div className="import-result">
          <p>Importados: {result.imported}</p>
          {result.errors.length > 0 && (
            <details>
              <summary>Errores ({result.errors.length})</summary>
              <ul>
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
