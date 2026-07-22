import type { UpdateInfo } from "../../data/ApiUpdateRepository";

interface Props {
  update: UpdateInfo;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UpdateDialog({ update, onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Nueva versión disponible</h2>
        <p>
          Hay una nueva versión de <strong>Economía Casera</strong>.
        </p>
        <p>
          Versión actual: <strong>{update.currentVersion}</strong>
        </p>
        <p>
          Nueva versión: <strong>{update.version}</strong>
        </p>
        <p className="hint">
          Se descargará el nuevo ejecutable y se reiniciará la aplicación.
        </p>
        <div className="modal-actions">
          <button onClick={onConfirm}>Actualizar ahora</button>
          <button className="secondary" onClick={onCancel}>
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
}
