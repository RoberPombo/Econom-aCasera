interface Props {
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
      <div className="w-[90%] max-w-[420px] rounded-lg bg-surface p-6 shadow-card">
        <h2>Confirmar</h2>
        <p>{message}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-w-[140px] flex-1 cursor-pointer rounded-lg bg-[#dc2626] px-3 py-2 text-[0.95rem] text-white hover:opacity-90"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            className="min-w-[140px] flex-1 cursor-pointer rounded-lg bg-muted px-3 py-2 text-white hover:opacity-90"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
