import { useState, useEffect } from "react";
import type { Transaction, Category } from "./api";

interface Props {
  onSubmit: (t: Transaction) => void;
  onCancel?: () => void;
  editing?: Transaction | null;
  categories: Category[];
  year: number;
  month: number;
}

export function TransactionForm({ onSubmit, onCancel, editing, categories, year, month }: Props) {
  const [form, setForm] = useState<Transaction>({
    date: `${year}-${String(month).padStart(2, "0")}-01`,
    type: "expense",
    category: "",
    concept: "",
    amount: 0,
    year,
    month,
  });

  useEffect(() => {
    if (editing) {
      setForm({ ...editing });
    } else {
      setForm({
        date: `${year}-${String(month).padStart(2, "0")}-01`,
        type: "expense",
        category: "",
        concept: "",
        amount: 0,
        year,
        month,
      });
    }
  }, [editing, year, month]);

  const filteredCategories = categories.filter((c) => c.type === form.type && c.active === 1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ ...form });
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-row">
        <label>Tipo</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as "income" | "expense", category: "" })}
          required
        >
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
      </div>
      <div className="form-row">
        <label>Fecha</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
      </div>
      <div className="form-row">
        <label>Categoría</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        >
          <option value="">Selecciona...</option>
          {filteredCategories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Concepto</label>
        <input
          type="text"
          value={form.concept}
          onChange={(e) => setForm({ ...form, concept: e.target.value })}
          required
        />
      </div>
      <div className="form-row">
        <label>Importe</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={form.amount || ""}
          onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit">{editing ? "Guardar" : "Añadir"}</button>
        {editing && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
