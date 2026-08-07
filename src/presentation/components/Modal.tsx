import { useEffect } from "react";
import { modal, modalOverlay, modalWide } from "../styles";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export function Modal({ title, children, onClose, wide }: ModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: click-away backdrop; closing is also available via close button and Escape
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key closes the modal (listener on window)
    <div
      className={modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${modal} ${wide ? modalWide : ""} max-h-[90vh] overflow-y-auto`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="m-0 text-[1.25rem] font-bold">{title}</h2>
          <button
            type="button"
            className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[1.25rem] text-body"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
