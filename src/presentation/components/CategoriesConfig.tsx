import { useMemo, useState } from "react";
import type { Category } from "../../domain/entities";
import { normalizeKey } from "../../domain/entities/Key";
import {
  btn,
  btnItem,
  inputInline,
  listItem,
  listItemInactive,
  listReset,
  sectionTitle,
} from "../styles";
import { ConfirmDialog } from "./ConfirmDialog";

interface Props {
  categories: Category[];
  onAdd: (name: string, type: "income" | "expense") => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: number) => void;
}

function AddIcon({ disabled }: { disabled?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={disabled ? 0.5 : 1}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CategorySection({
  title,
  type,
  items,
  allItems,
  onAdd,
  onUpdate,
  onDelete,
}: {
  title: string;
  type: "income" | "expense";
  items: Category[];
  allItems: Category[];
  onAdd: (name: string, type: "income" | "expense") => void;
  onUpdate: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const keyMap = useMemo(
    () => new Map(allItems.map((c) => [c.key, c])),
    [allItems],
  );
  const newKey = normalizeKey(newLabel);
  const existingByKey = newKey ? keyMap.get(newKey) : undefined;
  const canAdd =
    newLabel.trim().length > 0 &&
    newKey.length > 0 &&
    (!existingByKey || existingByKey.type !== type);
  const duplicateInSameType = existingByKey && existingByKey.type === type;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    onAdd(newLabel.trim(), type);
    setNewLabel("");
  }

  return (
    <div className="mb-6">
      <form
        onSubmit={handleAdd}
        className="mb-3 flex flex-wrap items-center gap-2"
      >
        <h3 className="m-0 text-[1.1rem] font-bold">{title}</h3>
        <input
          className={`${inputInline} max-w-[220px] text-[0.9rem]`}
          type="text"
          placeholder={`Nueva ${title.toLowerCase().slice(0, -1)}`}
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <button
          type="submit"
          className={`${btn} px-2 py-1 text-[0.85rem]`}
          disabled={!canAdd}
          title={
            canAdd
              ? `Añadir ${title.toLowerCase()}`
              : "Escribe un nombre válido"
          }
        >
          <AddIcon disabled={!canAdd} />
        </button>
      </form>

      {duplicateInSameType && (
        <p className="mb-2 text-[0.85rem] text-expense">
          Ya existe "{existingByKey.label}". Edita la etiqueta si quieres
          cambiarla.
        </p>
      )}

      <ul className={listReset}>
        {items.map((c) => (
          <li
            key={c.id}
            className={`${listItem} ${c.active ? "" : listItemInactive}`}
          >
            <EditableLabel
              value={c.label}
              onSave={(label) => onUpdate(c.withLabel(label))}
            />
            <div>
              <button
                type="button"
                className={btnItem}
                onClick={() => onUpdate(c.toggleActive())}
              >
                {c.active ? "Desactivar" : "Activar"}
              </button>
              <button
                type="button"
                className={`${btnItem} bg-[#dc2626] text-white`}
                onClick={() => onDelete(c)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditableLabel({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = draft.trim();
          if (trimmed && trimmed !== value) {
            onSave(trimmed);
          }
          setEditing(false);
        }}
        className="flex items-center gap-2"
      >
        <input
          className="w-full min-w-[120px] rounded-lg border border-line bg-surface p-1 text-[0.95rem] text-body"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => setEditing(false)}
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent p-0 text-inherit hover:underline"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title="Haz clic para editar"
    >
      {value}
    </button>
  );
}

export function CategoriesConfig({
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: Props) {
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  function handleDelete(cat: Category) {
    setPendingDelete(cat);
  }

  function confirmDelete() {
    if (pendingDelete) {
      onDelete(pendingDelete.id as number);
    }
    setPendingDelete(null);
  }

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <div>
      <h2 className={sectionTitle}>Categorías</h2>

      <CategorySection
        title="Gastos"
        type="expense"
        items={expense}
        allItems={categories}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={handleDelete}
      />

      <CategorySection
        title="Ingresos"
        type="income"
        items={income}
        allItems={categories}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={handleDelete}
      />

      {pendingDelete && (
        <ConfirmDialog
          message={`¿Eliminar "${pendingDelete.label}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
