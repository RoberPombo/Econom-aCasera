import { useState } from "react";
import type { Category } from "../../domain/entities";
import { ConfirmDialog } from "./ConfirmDialog";
import { inlineForm, inputInline, btn, btnItem, listReset, listItem, listItemInactive, sectionTitle } from "../styles";

interface Props {
  categories: Category[];
  onAdd: (name: string, type: "income" | "expense") => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: number) => void;
}

function AddIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CategorySection({
  title,
  type,
  items,
  addingType,
  setAddingType,
  newName,
  setNewName,
  onAdd,
  onToggle,
  onDelete,
}: {
  title: string;
  type: "income" | "expense";
  items: Category[];
  addingType: "income" | "expense" | null;
  setAddingType: (type: "income" | "expense" | null) => void;
  newName: string;
  setNewName: (name: string) => void;
  onAdd: (name: string, type: "income" | "expense") => void;
  onToggle: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}) {
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim(), type);
    setNewName("");
    setAddingType(null);
  }

  const isAdding = addingType === type;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="m-0 text-[1.1rem] font-bold">{title}</h3>
        {!isAdding && (
          <button
            type="button"
            className={`${btn} px-2 py-1 text-[0.85rem]`}
            onClick={() => setAddingType(type)}
            title={`Añadir categoría de ${title.toLowerCase()}`}
            aria-label={`Añadir categoría de ${title.toLowerCase()}`}
          >
            <AddIcon />
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className={`${inlineForm} mb-3`}>
          <input
            className={inputInline}
            type="text"
            placeholder={`Nueva categoría de ${title.toLowerCase()}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            autoFocus
          />
          <button type="submit" className={`${btn} text-[0.85rem]`}>Añadir</button>
          <button type="button" className={`${btn} bg-muted text-[0.85rem]`} onClick={() => setAddingType(null)}>
            Cancelar
          </button>
        </form>
      )}

      <ul className={listReset}>
        {items.map((c) => (
          <li key={c.id} className={`${listItem} ${c.active ? "" : listItemInactive}`}>
            {c.name}
            <div>
              <button className={btnItem} onClick={() => onToggle(c)}>
                {c.active ? "Desactivar" : "Activar"}
              </button>
              <button className={`${btnItem} bg-[#dc2626]`} onClick={() => onDelete(c)}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CategoriesConfig({ categories, onAdd, onUpdate, onDelete }: Props) {
  const [newName, setNewName] = useState("");
  const [addingType, setAddingType] = useState<"income" | "expense" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

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

      <CategorySection
        title="Gastos"
        type="expense"
        items={expense}
        addingType={addingType}
        setAddingType={setAddingType}
        newName={newName}
        setNewName={setNewName}
        onAdd={onAdd}
        onToggle={toggleActive}
        onDelete={handleDelete}
      />

      <CategorySection
        title="Ingresos"
        type="income"
        items={income}
        addingType={addingType}
        setAddingType={setAddingType}
        newName={newName}
        setNewName={setNewName}
        onAdd={onAdd}
        onToggle={toggleActive}
        onDelete={handleDelete}
      />

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
