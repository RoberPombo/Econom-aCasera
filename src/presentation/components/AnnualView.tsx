import type { AnnualSummary } from "../../domain/entities";

interface Props {
  annualSummary: AnnualSummary[];
}

export function AnnualView({ annualSummary }: Props) {
  function formatMoney(n: number) {
    return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  }

  return (
    <div>
      <h2>Resumen anual</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Año</th>
              <th>Ingresos</th>
              <th>Gastos</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {annualSummary.map((a) => (
              <tr key={a.year}>
                <td>{a.year}</td>
                <td className="income">{formatMoney(a.income)}</td>
                <td className="expense">{formatMoney(a.expense)}</td>
                <td className={a.balance >= 0 ? "income" : "expense"}>{formatMoney(a.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
