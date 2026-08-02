import { useState, useMemo } from "react";
import type { Person } from "../../domain/entities";
import { normalizeKey } from "../../domain/entities/Key";
import { ConfirmDialog } from "./ConfirmDialog";
import { inputInline, btn, btnItem, listReset, listItem, listItemInactive, sectionTitle } from "../styles";

interface Props {
  persons: Person[];
  onAdd: (name: string) => void;
  onUpdate: (person: Person) => void;
  onDelete: (id: number) => void;
}

function AddIcon({ disabled }: { disabled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={disabled ? 0.5 : 1}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditableLabel({ value, onSave }: { value: string; onSave: (value: string) => void }) {
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
          autoFocus
          onBlur={() => setEditing(false)}
        />
      </form>
    );
  }

  return (
    <span
      className="cursor-pointer hover:underline"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title="Haz clic para editar"
    >
      {value}
    </span>
  );
}

export function PersonsConfig({ persons, onAdd, onUpdate, onDelete }: Props) {
  const [newLabel, setNewLabel] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Person | null>(null);
  const keyMap = useMemo(() => new Map(persons.map((p) => [p.key, p])), [persons]);
  const newKey = normalizeKey(newLabel);
  const existingByKey = newKey ? keyMap.get(newKey) : undefined;
  const canAdd = newLabel.trim().length > 0 && newKey.length > 0 && !existingByKey;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!canAdd) return;
    onAdd(newLabel.trim());
    setNewLabel("");
  }

  function handleDelete(person: Person) {
    setPendingDelete(person);
  }

  function confirmDelete() {
    if (pendingDelete) {
      onDelete(pendingDelete.id as number);
    }
    setPendingDelete(null);
  }

  return (
    <div>
      <h2 className={sectionTitle}>Miembros familiares</h2>

      <form onSubmit={handleAdd} className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="m-0 text-[1.1rem] font-bold">Miembros</h3>
        <input
          className={`${inputInline} max-w-[220px] text-[0.9rem]`}
          type="text"
          placeholder="Nuevo miembro"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <button
          type="submit"
          className={`${btn} px-2 py-1 text-[0.85rem]`}
          disabled={!canAdd}
          title={canAdd ? "Añadir miembro" : "Escribe un nombre válido"}
        >
          <AddIcon disabled={!canAdd} />
        </button>
      </form>

      {existingByKey && (
        <p className="mb-2 text-[0.85rem] text-expense">
          Ya existe "{existingByKey.label}". Edita la etiqueta si quieres cambiarla.
        </p>
      )}

      <ul className={listReset}>
        {persons.map((p) => (
          <li key={p.id} className={`${listItem} ${p.active ? "" : listItemInactive}`}>
            <EditableLabel value={p.label} onSave={(label) => onUpdate(p.withLabel(label))} />
            <div>
              <button className={btnItem} onClick={() => onUpdate(p.toggleActive())}>
                {p.active ? "Desactivar" : "Activar"}
              </button>
              <button className={`${btnItem} bg-[#dc2626]`} onClick={() => handleDelete(p)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

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
