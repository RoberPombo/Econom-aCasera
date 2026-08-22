import { useEffect, useRef, useState } from "react";
import type {
  Category,
  Person,
  Transaction,
  TransactionType,
} from "../../domain/entities";
import { isSafeImageSrc } from "../imageSrc";
import {
  btn,
  btnGhost,
  btnSecondary,
  formActions,
  formRow,
  input,
  label,
  receiptDropzone,
  receiptPreview,
} from "../styles";

export type ReceiptFormData = {
  bytes: Uint8Array;
  extension: string;
  previewUrl: string;
} | null;

export type TransactionFormData = {
  date: string;
  type: TransactionType;
  category: string;
  concept: string;
  amount: number;
  person: string;
  receipt: ReceiptFormData;
  removeReceipt: boolean;
};

interface Props {
  onSubmit: (t: TransactionFormData) => void;
  onCancel?: () => void;
  initialValue?: Transaction;
  categories: Category[];
  persons: Person[];
  existingReceiptUrl?: string | null;
}

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

function todayIsoDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function extensionFromFile(file: File): string {
  const nameExt = file.name.split(".").pop()?.toLowerCase();
  if (nameExt === "jpeg") return "jpg";
  if (nameExt && ["jpg", "png", "webp"].includes(nameExt)) return nameExt;
  if (file.type.includes("png")) return "png";
  if (file.type.includes("webp")) return "webp";
  return "jpg";
}

export function TransactionForm({
  onSubmit,
  onCancel,
  initialValue,
  categories,
  persons,
  existingReceiptUrl,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<
    Omit<TransactionFormData, "receipt" | "removeReceipt">
  >({
    date: todayIsoDate(),
    type: "expense",
    category: "",
    concept: "",
    amount: 0,
    person: "",
  });
  const [receipt, setReceipt] = useState<ReceiptFormData>(null);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValue) {
      setForm({
        date: initialValue.date,
        type: initialValue.type,
        category: initialValue.category,
        concept: initialValue.concept,
        amount: initialValue.amount,
        person: initialValue.person || "",
      });
    } else {
      setForm({
        date: todayIsoDate(),
        type: "expense",
        category: "",
        concept: "",
        amount: 0,
        person: "",
      });
    }
    setReceipt(null);
    setRemoveReceipt(false);
    setReceiptError(null);
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (receipt?.previewUrl) URL.revokeObjectURL(receipt.previewUrl);
    };
  }, [receipt]);

  const filteredCategories = categories.filter(
    (c) => c.type === form.type && c.active,
  );
  const activePersons = persons.filter((p) => p.active);
  const showReceipt = form.type === "expense";
  const previewSrc =
    receipt?.previewUrl ??
    (!removeReceipt ? (existingReceiptUrl ?? null) : null);
  const safePreviewSrc =
    previewSrc && isSafeImageSrc(previewSrc) ? previewSrc : null;

  async function applyImageFile(file: File) {
    setReceiptError(null);
    if (
      !ALLOWED.includes(file.type) &&
      !/\.(jpe?g|png|webp)$/i.test(file.name)
    ) {
      setReceiptError("Formato no soportado. Usa JPG, PNG o WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setReceiptError("La imagen supera el tamaño máximo de 10 MB.");
      return;
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    const previewUrl = URL.createObjectURL(file);
    if (receipt?.previewUrl) URL.revokeObjectURL(receipt.previewUrl);
    setReceipt({
      bytes: buffer,
      extension: extensionFromFile(file),
      previewUrl,
    });
    setRemoveReceipt(false);
  }

  async function applyClipboardImage(items: DataTransferItemList | undefined) {
    if (!items) return false;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          await applyImageFile(file);
          return true;
        }
      }
    }
    return false;
  }

  function clearReceipt() {
    if (receipt?.previewUrl) URL.revokeObjectURL(receipt.previewUrl);
    setReceipt(null);
    setRemoveReceipt(true);
    setReceiptError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      ...form,
      receipt: form.type === "expense" ? receipt : null,
      removeReceipt: form.type === "expense" ? removeReceipt : true,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      onPaste={async (e) => {
        if (!showReceipt) return;
        const handled = await applyClipboardImage(e.clipboardData?.items);
        if (handled) e.preventDefault();
      }}
    >
      <div className={formRow}>
        <label className={label} htmlFor="tx-type">
          Tipo
        </label>
        <select
          className={input}
          id="tx-type"
          value={form.type}
          onChange={(e) => {
            const type = e.target.value as TransactionType;
            setForm({ ...form, type, category: "" });
            if (type === "income") clearReceipt();
          }}
          required
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
      </div>
      <div className={formRow}>
        <label className={label} htmlFor="tx-date">
          Fecha
        </label>
        <input
          className={`${input} font-[inherit]`}
          id="tx-date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
      </div>
      <div className={formRow}>
        <label className={label} htmlFor="tx-category">
          Categoría
        </label>
        <select
          className={input}
          id="tx-category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          <option value="">Selecciona...</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className={formRow}>
        <label className={label} htmlFor="tx-person">
          Persona
        </label>
        <select
          className={input}
          id="tx-person"
          value={form.person}
          onChange={(e) => setForm({ ...form, person: e.target.value })}
        >
          <option value="">Sin asignar</option>
          {activePersons.map((p) => (
            <option key={p.id} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className={formRow}>
        <label className={label} htmlFor="tx-concept">
          Concepto
        </label>
        <input
          className={input}
          id="tx-concept"
          type="text"
          value={form.concept}
          onChange={(e) => setForm({ ...form, concept: e.target.value })}
          required
        />
      </div>
      <div className={formRow}>
        <label className={label} htmlFor="tx-amount">
          Importe
        </label>
        <input
          className={input}
          id="tx-amount"
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount || ""}
          onChange={(e) =>
            setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
          }
          required
        />
      </div>

      {showReceipt && (
        <div className={formRow}>
          <label className={label} htmlFor="tx-receipt">
            Ticket
          </label>
          <div className="flex flex-col gap-2">
            {/* biome-ignore lint/a11y/noStaticElementInteractions: drag & drop is optional; the "Elegir archivo" button provides a keyboard alternative */}
            <div
              className={`${receiptDropzone} ${dragOver ? "border-primary bg-primary/5" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={async (e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) await applyImageFile(file);
              }}
            >
              <p className="m-0 text-[0.9rem] text-muted">
                Arrastra una imagen, pégala (Ctrl+V) o elige un archivo
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Elegir archivo
                </button>
                {previewSrc && (
                  <button
                    type="button"
                    className={btnSecondary}
                    onClick={clearReceipt}
                  >
                    Quitar foto
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="tx-receipt"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await applyImageFile(file);
                  e.target.value = "";
                }}
              />
            </div>
            {safePreviewSrc && (
              <img
                src={safePreviewSrc}
                alt="Vista previa del ticket"
                className={receiptPreview}
              />
            )}
            {receiptError && (
              <p className="m-0 text-[0.85rem] text-expense">{receiptError}</p>
            )}
          </div>
        </div>
      )}

      <div className={formActions}>
        <button type="submit" className={btn}>
          {initialValue ? "Guardar" : "Añadir"}
        </button>
        {onCancel && (
          <button type="button" className={btnSecondary} onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
