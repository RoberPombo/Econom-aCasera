import type { Category, Person, Transaction } from "../../domain/entities";
import { tableWrap, table, th, td, btnAction, income, expense } from "../styles";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  persons: Person[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
}

export function TransactionList({ transactions, categories, persons, onEdit, onDelete }: Props) {
  function formatMoney(n: number) {
    return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  }

  function formatDate(d: string) {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  const categoryLabels = new Map(categories.map((c) => [c.key, c.label]));
  const personLabels = new Map(persons.map((p) => [p.key, p.label]));

  return (
    <div className={tableWrap}>
      <table className={table}>
        <thead>
          <tr>
            <th className={th}>Fecha</th>
            <th className={th}>Tipo</th>
            <th className={th}>Categoría</th>
            <th className={th}>Persona</th>
            <th className={th}>Concepto</th>
            <th className={th}>Importe</th>
            <th className={th}></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td className={td}>{formatDate(t.date)}</td>
              <td className={td}>{t.type === "income" ? "Ingreso" : "Gasto"}</td>
              <td className={td}>{categoryLabels.get(t.category) || t.category}</td>
              <td className={td}>{personLabels.get(t.person) || t.person || "—"}</td>
              <td className={td}>{t.concept}</td>
              <td className={`${td} ${t.type === "income" ? income : expense}`}>{formatMoney(t.amount)}</td>
              <td className={`${td} whitespace-nowrap`}>
                <button className={`${btnAction} bg-[#6b7280]`} onClick={() => onEdit(t)}>✎</button>
                <button className={`${btnAction} bg-[#dc2626]`} onClick={() => onDelete(Number(t.id))}>
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
