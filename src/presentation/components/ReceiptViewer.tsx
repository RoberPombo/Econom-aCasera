import { useEffect } from "react";
import { isSafeImageSrc } from "../imageSrc";
import { btnSecondary, modal, modalOverlay } from "../styles";

interface Props {
  src: string;
  onClose: () => void;
}

export function ReceiptViewer({ src, onClose }: Props) {
  const safeSrc = isSafeImageSrc(src) ? src : null;
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: click-away backdrop; closing is also available via close button and Escape
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key closes the viewer (listener on window)
    <div
      className={modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${modal} max-w-[900px] flex flex-col gap-3`}
        role="dialog"
        aria-modal="true"
        aria-label="Foto del ticket"
      >
        {safeSrc && (
          <img
            src={safeSrc}
            alt="Ticket del gasto"
            className="max-h-[70vh] w-auto max-w-full self-center rounded-lg object-contain"
          />
        )}
        <div className="flex justify-end">
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
