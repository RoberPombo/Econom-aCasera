import { useState } from "react";
import {
  modal,
  modalActions,
  modalBtn,
  modalBtnSecondary,
  modalOverlay,
} from "../styles";

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
      <div className={modalOverlay}>
        <div className={modal}>
          <h2>Confirmar</h2>
          <p>¿Seguro? Se perderán los cambios hechos en otro dispositivo.</p>
          <div className={modalActions}>
            <button
              type="button"
              className="min-w-[140px] flex-1 cursor-pointer rounded-lg bg-[#dc2626] px-3 py-2 text-[0.95rem] text-white hover:opacity-90"
              onClick={handleOverwrite}
            >
              Sí, usar mis datos locales
            </button>
            <button
              type="button"
              className={modalBtnSecondary}
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={modalOverlay}>
      <div className={modal}>
        <h2>Conflicto detectado</h2>
        <p>Los datos han cambiado en otro dispositivo.</p>
        <p>¿Qué quieres hacer?</p>
        <div className={modalActions}>
          <button type="button" className={modalBtn} onClick={handleReload}>
            Recargar datos remotos
          </button>
          <button
            type="button"
            className={modalBtn}
            onClick={() => setConfirming(true)}
          >
            Usar mis datos locales
          </button>
          <button
            type="button"
            className={modalBtnSecondary}
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
