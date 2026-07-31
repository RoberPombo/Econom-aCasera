import type { AnnualSummary } from "../../domain/entities";
import { income, expense, tableWrap, table, th, td } from "../styles";

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
      <div className={tableWrap}>
        <table className={table}>
          <thead>
            <tr>
              <th className={th}>Año</th>
              <th className={th}>Ingresos</th>
              <th className={th}>Gastos</th>
              <th className={th}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {annualSummary.map((a) => (
              <tr key={a.year}>
                <td className={td}>{a.year}</td>
                <td className={`${td} ${income}`}>{formatMoney(a.income)}</td>
                <td className={`${td} ${expense}`}>{formatMoney(a.expense)}</td>
                <td className={`${td} ${a.balance >= 0 ? income : expense}`}>{formatMoney(a.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
