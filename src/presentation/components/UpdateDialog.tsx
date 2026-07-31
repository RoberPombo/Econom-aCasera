import type { UpdateInfo } from "../../domain/repositories/UpdateRepository";
import { modal, modalActions, modalBtn, modalBtnSecondary, modalOverlay } from "../styles";

interface Props {
  update: UpdateInfo;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UpdateDialog({ update, onConfirm, onCancel }: Props) {
  return (
    <div className={modalOverlay}>
      <div className={modal}>
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
        <p className="mt-4 text-[0.85rem] text-muted">
          Se descargará el nuevo ejecutable y se reiniciará la aplicación.
        </p>
        <div className={modalActions}>
          <button className={modalBtn} onClick={onConfirm}>Actualizar ahora</button>
          <button className={modalBtnSecondary} onClick={onCancel}>
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
}
