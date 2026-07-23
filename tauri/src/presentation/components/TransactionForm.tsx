import { useState, useEffect } from "react";
import type { Transaction, Category, Person } from "../../domain/entities";

export type TransactionFormData = {
  date: string;
  type: "income" | "expense";
  category: string;
  concept: string;
  amount: number;
  person: string;
};

interface Props {
  onSubmit: (t: TransactionFormData) => void;
  onCancel?: () => void;
  initialValue?: Transaction;
  categories: Category[];
  persons: Person[];
  year: number;
  month: number;
}

export function TransactionForm({ onSubmit, onCancel, initialValue, categories, persons, year, month }: Props) {
  const [form, setForm] = useState<TransactionFormData>({
    date: `${year}-${String(month).padStart(2, "0")}-01`,
    type: "expense",
    category: "",
    concept: "",
    amount: 0,
    person: "",
  });

  useEffect(() => {
    if (initialValue) {
      setForm({
        date: initialValue.date,
        type: initialValue.type,
        category: initialValue.category,
        concept: initialValue.concept,
        amount: initialValue.amount,
        person: initialValue.person || "",
      });
    } else {
      setForm({
        date: `${year}-${String(month).padStart(2, "0")}-01`,
        type: "expense",
        category: "",
        concept: "",
        amount: 0,
        person: "",
      });
    }
  }, [initialValue, year, month]);

  const filteredCategories = categories.filter((c) => c.type === form.type && c.active);
  const activePersons = persons.filter((p) => p.active);

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
        <label>Persona</label>
        <select
          value={form.person}
          onChange={(e) => setForm({ ...form, person: e.target.value })}
        >
          <option value="">Sin asignar</option>
          {activePersons.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
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
