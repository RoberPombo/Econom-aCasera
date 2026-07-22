import type { Summary } from "./api";

interface Props {
  summary: Summary;
  title?: string;
}

export function SummaryCards({ summary, title }: Props) {
  function formatMoney(n: number) {
    return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  }

  return (
    <div>
      {title && <h2>{title}</h2>}
      <div className="summary">
        <div className="card income">
          <div>Ingresos</div>
          <div>{formatMoney(summary.income)}</div>
        </div>
        <div className="card expense">
          <div>Gastos</div>
          <div>{formatMoney(summary.expense)}</div>
        </div>
        <div className="card balance">
          <div>Balance</div>
          <div>{formatMoney(summary.balance)}</div>
        </div>
      </div>
    </div>
  );
}
