import { useState, useEffect } from "react";
import type { Transaction, Category } from "../../domain/entities";

export type TransactionFormData = {
  date: string;
  type: "income" | "expense";
  category: string;
  concept: string;
  amount: number;
};

interface Props {
  onSubmit: (t: TransactionFormData) => void;
  onCancel?: () => void;
  initialValue?: Transaction;
  categories: Category[];
  year: number;
  month: number;
}

export function TransactionForm({ onSubmit, onCancel, initialValue, categories, year, month }: Props) {
  const [form, setForm] = useState<TransactionFormData>({
    date: `${year}-${String(month).padStart(2, "0")}-01`,
    type: "expense",
    category: "",
    concept: "",
    amount: 0,
  });

  useEffect(() => {
    if (initialValue) {
      setForm({
        date: initialValue.date,
        type: initialValue.type,
        category: initialValue.category,
        concept: initialValue.concept,
        amount: initialValue.amount,
      });
    } else {
      setForm({
        date: `${year}-${String(month).padStart(2, "0")}-01`,
        type: "expense",
        category: "",
        concept: "",
        amount: 0,
      });
    }
  }, [initialValue, year, month]);

  const filteredCategories = categories.filter((c) => c.type === form.type && c.active);

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
        <button type="submit">{initialValue ? "Guardar" : "Añadir"}</button>
        {initialValue && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
