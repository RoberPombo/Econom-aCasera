import { useState } from "react";
import type { Category } from "../../domain/entities";
import { ConfirmDialog } from "./ConfirmDialog";
import { inlineForm, inputInline, btn, btnItem, categoryGrid, listReset, listItem, listItemInactive, sectionTitle } from "../styles";

interface Props {
  categories: Category[];
  onAdd: (name: string, type: "income" | "expense") => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: number) => void;
}

export function CategoriesConfig({ categories, onAdd, onUpdate, onDelete }: Props) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

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
      <h2 className={sectionTitle}>Configuración de categorías</h2>
      <form onSubmit={handleAdd} className={inlineForm}>
        <input
          className={inputInline}
          type="text"
          placeholder="Nueva categoría"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <select
          className={inputInline}
          value={newType}
          onChange={(e) => setNewType(e.target.value as "income" | "expense")}
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
        <button type="submit" className={`${btn} max-mobile:w-full`}>Añadir</button>
      </form>

      <div className={categoryGrid}>
        <div>
          <h3>Ingresos</h3>
          <ul className={listReset}>
            {income.map((c) => (
              <li key={c.id} className={`${listItem} ${c.active ? "" : listItemInactive}`}>
                {c.name}
                <div>
                  <button className={btnItem} onClick={() => toggleActive(c)}>{c.active ? "Desactivar" : "Activar"}</button>
                  <button className={`${btnItem} bg-[#dc2626]`} onClick={() => handleDelete(c)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Gastos</h3>
          <ul className={listReset}>
            {expense.map((c) => (
              <li key={c.id} className={`${listItem} ${c.active ? "" : listItemInactive}`}>
                {c.name}
                <div>
                  <button className={btnItem} onClick={() => toggleActive(c)}>{c.active ? "Desactivar" : "Activar"}</button>
                  <button className={`${btnItem} bg-[#dc2626]`} onClick={() => handleDelete(c)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

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
