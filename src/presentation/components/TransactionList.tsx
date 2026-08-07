import type { Category, Person, Transaction } from "../../domain/entities";
import {
  btnAction,
  expense,
  iconBtn,
  income,
  table,
  tableWrap,
  td,
  th,
} from "../styles";

interface Props {
  transactions: Transaction[];
  categories: Category[];
  persons: Person[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
  onViewReceipt: (t: Transaction) => void;
}

function ReceiptIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 3-2 3 2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export function TransactionList({
  transactions,
  categories,
  persons,
  onEdit,
  onDelete,
  onViewReceipt,
}: Props) {
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
              <td className={td}>
                {t.type === "income" ? "Ingreso" : "Gasto"}
              </td>
              <td className={td}>
                {categoryLabels.get(t.category) || t.category}
              </td>
              <td className={td}>
                {personLabels.get(t.person) || t.person || "—"}
              </td>
              <td className={td}>
                <span className="inline-flex items-center gap-2">
                  {t.concept}
                  {t.hasReceipt && (
                    <button
                      type="button"
                      className={`${iconBtn} !px-1.5 !py-1`}
                      title="Ver ticket"
                      aria-label={`Ver ticket de ${t.concept}`}
                      onClick={() => onViewReceipt(t)}
                    >
                      <ReceiptIcon />
                    </button>
                  )}
                </span>
              </td>
              <td className={`${td} ${t.type === "income" ? income : expense}`}>
                {formatMoney(t.amount)}
              </td>
              <td className={`${td} whitespace-nowrap`}>
                <button
                  type="button"
                  className={`${btnAction} bg-[#6b7280]`}
                  onClick={() => onEdit(t)}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className={`${btnAction} bg-[#dc2626]`}
                  onClick={() => onDelete(Number(t.id))}
                >
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
