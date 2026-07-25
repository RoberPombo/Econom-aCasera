import { useState } from "react";
import type { Category } from "../../domain/entities";

interface Props {
  categories: Category[];
  onAdd: (name: string, type: "income" | "expense") => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: number) => void;
}

export function CategoriesConfig({ categories, onAdd, onUpdate, onDelete }: Props) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim(), newType);
    setNewName("");
  }

  function toggleActive(cat: Category) {
    onUpdate(cat.toggleActive());
  }

  function handleDelete(cat: Category) {
    if (!confirm(`¿Eliminar "${cat.name}"?`)) return;
    onDelete(cat.id as number);
  }

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <div>
      <h2>Configuración de categorías</h2>
      <form onSubmit={handleAdd} className="inline-form">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <select value={newType} onChange={(e) => setNewType(e.target.value as "income" | "expense")}>
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
        <button type="submit">Añadir</button>
      </form>

      <div className="category-grid">
        <div>
          <h3>Ingresos</h3>
          <ul className="category-list">
            {income.map((c) => (
              <li key={c.id} className={c.active ? "" : "inactive"}>
                {c.name}
                <div>
                  <button onClick={() => toggleActive(c)}>{c.active ? "Desactivar" : "Activar"}</button>
                  <button className="danger" onClick={() => handleDelete(c)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Gastos</h3>
          <ul className="category-list">
            {expense.map((c) => (
              <li key={c.id} className={c.active ? "" : "inactive"}>
                {c.name}
                <div>
                  <button onClick={() => toggleActive(c)}>{c.active ? "Desactivar" : "Activar"}</button>
                  <button className="danger" onClick={() => handleDelete(c)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

