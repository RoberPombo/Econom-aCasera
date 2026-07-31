import type { Summary } from "../../domain/entities";
import { summaryGrid, income, expense } from "../styles";

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
      <div className={summaryGrid}>
        <div className="rounded-lg border-t-4 border-income bg-surface p-4 text-center shadow-card">
          <div className="mb-1 text-[0.9rem] text-muted">Ingresos</div>
          <div className={`text-[1.4rem] font-bold ${income}`}>{formatMoney(summary.income)}</div>
        </div>
        <div className="rounded-lg border-t-4 border-expense bg-surface p-4 text-center shadow-card">
          <div className="mb-1 text-[0.9rem] text-muted">Gastos</div>
          <div className={`text-[1.4rem] font-bold ${expense}`}>{formatMoney(summary.expense)}</div>
        </div>
        <div className="rounded-lg border-t-4 border-primary bg-surface p-4 text-center shadow-card">
          <div className="mb-1 text-[0.9rem] text-muted">Balance</div>
          <div className="text-[1.4rem] font-bold text-primary">{formatMoney(summary.balance)}</div>
        </div>
      </div>
    </div>
  );
}
