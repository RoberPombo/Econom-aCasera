import { reloadDatabase, forceOverwrite } from "./api";

interface Props {
  onResolved: () => void;
  onCancel: () => void;
}

export function ConflictDialog({ onResolved, onCancel }: Props) {
  async function handleReload() {
    await reloadDatabase();
    onResolved();
  }

  async function handleOverwrite() {
    if (!confirm("¿Seguro? Se perderán los cambios hechos en otro dispositivo.")) return;
    await forceOverwrite();
    onResolved();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Conflicto detectado</h2>
        <p>Los datos han cambiado en otro dispositivo.</p>
        <p>¿Qué quieres hacer?</p>
        <div className="modal-actions">
          <button onClick={handleReload}>Recargar datos remotos</button>
          <button onClick={handleOverwrite}>Usar mis datos locales</button>
          <button className="secondary" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
