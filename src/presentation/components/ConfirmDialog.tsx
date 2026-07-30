interface Props {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, confirmLabel = "Eliminar", onConfirm, onCancel }: Props) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Confirmar</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="secondary" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
