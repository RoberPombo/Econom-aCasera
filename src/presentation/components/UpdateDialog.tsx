import { useState } from "react";
import type { UpdateInfo } from "../../domain/repositories/UpdateRepository";
import { formatReleaseNotes } from "../releaseNotes";
import {
  modal,
  modalActions,
  modalBtn,
  modalBtnSecondary,
  modalOverlay,
} from "../styles";

interface Props {
  update: UpdateInfo;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UpdateDialog({ update, onConfirm, onCancel }: Props) {
  const [showNotes, setShowNotes] = useState(false);
  const notes = formatReleaseNotes(update.notes);

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

        {notes.length > 0 && (
          <>
            <button
              type="button"
              className="mt-4 cursor-pointer text-[0.9rem] font-semibold text-primary hover:underline"
              aria-expanded={showNotes}
              onClick={() => setShowNotes((current) => !current)}
            >
              {showNotes ? "Ocultar novedades" : "Ver novedades"}
            </button>
            {showNotes && (
              <div className="mt-3 max-h-[40vh] overflow-y-auto rounded-lg border border-line bg-page p-3">
                {notes.map((block, index) => {
                  const key = `${block.kind}-${index}`;
                  if (block.kind === "title") {
                    return (
                      <p key={key} className="mb-2 font-bold text-[0.95rem]">
                        {block.text}
                      </p>
                    );
                  }
                  if (block.kind === "section") {
                    return (
                      <p
                        key={key}
                        className="mt-3 mb-1 font-semibold text-body"
                      >
                        {block.text}
                      </p>
                    );
                  }
                  if (block.kind === "item") {
                    return (
                      <p
                        key={key}
                        className="my-1 flex gap-2 text-[0.85rem] text-muted"
                      >
                        <span aria-hidden="true">•</span>
                        <span>{block.text}</span>
                      </p>
                    );
                  }
                  return (
                    <p key={key} className="my-1 text-[0.85rem] text-muted">
                      {block.text}
                    </p>
                  );
                })}
              </div>
            )}
          </>
        )}

        <p className="mt-4 text-[0.85rem] text-muted">
          Se descargará el nuevo ejecutable y se reiniciará la aplicación.
        </p>
        <div className={modalActions}>
          <button type="button" className={modalBtn} onClick={onConfirm}>
            Actualizar ahora
          </button>
          <button
            type="button"
            className={modalBtnSecondary}
            onClick={onCancel}
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
}
