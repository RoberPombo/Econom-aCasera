import { useState } from "react";
import type { Person } from "../../domain/entities";
import { ConfirmDialog } from "./ConfirmDialog";
import { inlineForm, inputInline, btn, btnItem, listReset, listItem, listItemInactive, hint, sectionTitle } from "../styles";

interface Props {
  persons: Person[];
  onAdd: (name: string) => void;
  onUpdate: (person: Person) => void;
  onDelete: (id: number) => void;
}

export function PersonsConfig({ persons, onAdd, onUpdate, onDelete }: Props) {
  const [newName, setNewName] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Person | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName("");
  }

  function toggleActive(person: Person) {
    onUpdate(person.toggleActive());
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
      <p className={hint}>
        Añade las personas de tu unidad familiar para poder asignarles gastos e ingresos.
      </p>
      <form onSubmit={handleAdd} className={inlineForm}>
        <input
          className={inputInline}
          type="text"
          placeholder="Nombre"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit" className={`${btn} max-mobile:w-full`}>Añadir</button>
      </form>

      <ul className={listReset}>
        {persons.map((p) => (
          <li key={p.id} className={`${listItem} ${p.active ? "" : listItemInactive}`}>
            {p.name}
            <div>
              <button className={btnItem} onClick={() => toggleActive(p)}>{p.active ? "Desactivar" : "Activar"}</button>
              <button className={`${btnItem} bg-[#dc2626]`} onClick={() => handleDelete(p)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {pendingDelete && (
        <ConfirmDialog
          message={`¿Eliminar "${pendingDelete.name}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
