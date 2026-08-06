import { modalOverlay, modal, btnSecondary } from "../styles";

interface Props {
  src: string;
  onClose: () => void;
}

export function ReceiptViewer({ src, onClose }: Props) {
  return (
    <div className={modalOverlay} onClick={onClose} role="presentation">
      <div
        className={`${modal} max-w-[900px] flex flex-col gap-3`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Foto del ticket"
      >
        <img src={src} alt="Ticket del gasto" className="max-h-[70vh] w-auto max-w-full self-center rounded-lg object-contain" />
        <div className="flex justify-end">
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
