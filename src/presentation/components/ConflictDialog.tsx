import { useState } from "react";

interface Props {
  onReload: () => Promise<void>;
  onOverwrite: () => Promise<void>;
  onCancel: () => void;
}

export function ConflictDialog({ onReload, onOverwrite, onCancel }: Props) {
  const [confirming, setConfirming] = useState(false);

  async function handleReload() {
    await onReload();
  }

  async function handleOverwrite() {
    await onOverwrite();
  }

  if (confirming) {
    return (
      <div className="modal-overlay">
        <div className="modal">
          <h2>Confirmar</h2>
          <p>¿Seguro? Se perderán los cambios hechos en otro dispositivo.</p>
          <div className="modal-actions">
            <button className="danger" onClick={handleOverwrite}>
              Sí, usar mis datos locales
            </button>
            <button className="secondary" onClick={() => setConfirming(false)}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Conflicto detectado</h2>
        <p>Los datos han cambiado en otro dispositivo.</p>
        <p>¿Qué quieres hacer?</p>
        <div className="modal-actions">
          <button onClick={handleReload}>Recargar datos remotos</button>
          <button onClick={() => setConfirming(true)}>Usar mis datos locales</button>
          <button className="secondary" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
