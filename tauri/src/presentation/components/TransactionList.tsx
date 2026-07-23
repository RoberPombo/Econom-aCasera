import type { Transaction } from "../../domain/entities";

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: number) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: Props) {
  function formatMoney(n: number) {
    return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  }

  function formatDate(d: string) {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Persona</th>
            <th>Concepto</th>
            <th>Importe</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{formatDate(t.date)}</td>
              <td>{t.type === "income" ? "Ingreso" : "Gasto"}</td>
              <td>{t.category}</td>
              <td>{t.person || "—"}</td>
              <td>{t.concept}</td>
              <td className={t.type}>{formatMoney(t.amount)}</td>
              <td className="actions">
                <button onClick={() => onEdit(t)}>✎</button>
                <button className="danger" onClick={() => onDelete(Number(t.id))}>
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
