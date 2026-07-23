import { useState } from "react";
import type { Person } from "../../domain/entities";

interface Props {
  persons: Person[];
  onAdd: (name: string) => void;
  onUpdate: (person: Person) => void;
  onDelete: (id: number) => void;
}

export function PersonsConfig({ persons, onAdd, onUpdate, onDelete }: Props) {
  const [newName, setNewName] = useState("");

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
    if (!confirm(`¿Eliminar "${person.name}"?`)) return;
    onDelete(person.id as number);
  }

  return (
    <div>
      <h2>Miembros familiares</h2>
      <p className="hint">
        Añade las personas de tu unidad familiar para poder asignarles gastos e ingresos.
      </p>
      <form onSubmit={handleAdd} className="inline-form">
        <input
          type="text"
          placeholder="Nombre"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button type="submit">Añadir</button>
      </form>

      <ul className="category-list">
        {persons.map((p) => (
          <li key={p.id} className={p.active ? "" : "inactive"}>
            {p.name}
            <div>
              <button onClick={() => toggleActive(p)}>{p.active ? "Desactivar" : "Activar"}</button>
              <button className="danger" onClick={() => handleDelete(p)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
