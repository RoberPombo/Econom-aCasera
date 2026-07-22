import { useState } from "react";
import type { Category } from "./api";
import { createCategory, updateCategory, deleteCategory, ConflictError } from "./api";

interface Props {
  categories: Category[];
  onChange: () => void;
  onConflict: () => void;
}

export function CategoriesConfig({ categories, onChange, onConflict }: Props) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createCategory(newName.trim(), newType);
      setNewName("");
      onChange();
    } catch (err) {
      if (err instanceof ConflictError) onConflict();
      else throw err;
    }
  }

  async function toggleActive(cat: Category) {
    try {
      await updateCategory(cat.id, cat.name, cat.type, cat.active === 1 ? 0 : 1);
      onChange();
    } catch (err) {
      if (err instanceof ConflictError) onConflict();
      else throw err;
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`¿Eliminar "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      onChange();
    } catch (err) {
      if (err instanceof ConflictError) onConflict();
      else throw err;
    }
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
              <li key={c.id} className={c.active === 1 ? "" : "inactive"}>
                {c.name}
                <div>
                  <button onClick={() => toggleActive(c)}>{c.active === 1 ? "Desactivar" : "Activar"}</button>
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
              <li key={c.id} className={c.active === 1 ? "" : "inactive"}>
                {c.name}
                <div>
                  <button onClick={() => toggleActive(c)}>{c.active === 1 ? "Desactivar" : "Activar"}</button>
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
