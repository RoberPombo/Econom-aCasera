import type { SummaryResult } from "../../domain/repositories/TransactionRepository";
import { btnSecondary } from "../styles";
import { MonthlyBarChart } from "./MonthlyBarChart";
import { SummaryBreakdown } from "./SummaryBreakdown";

interface SummaryModalProps {
  year: number;
  report: SummaryResult;
  onYearChange: (year: number) => void;
  onClose: () => void;
}

function formatMoney(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export function SummaryModal({
  year,
  report,
  onYearChange,
  onClose,
}: SummaryModalProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="print-area">
      <h2 className="mt-0 mb-4 text-[1.2rem] font-bold">Resumen {year}</h2>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onYearChange(year - 1)}
            aria-label="Año anterior"
            className="cursor-pointer rounded-lg border border-line bg-surface px-3 py-2 text-[0.95rem] text-body hover:opacity-90"
          >
            ←
          </button>
          <span className="min-w-[90px] text-center text-[1.1rem] font-bold">
            {year}
          </span>
          <button
            type="button"
            onClick={() => onYearChange(year + 1)}
            aria-label="Año siguiente"
            className="cursor-pointer rounded-lg border border-line bg-surface px-3 py-2 text-[0.95rem] text-body hover:opacity-90"
          >
            →
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={btnSecondary}
            onClick={handlePrint}
            title="Imprimir el resumen o guardarlo como PDF"
          >
            🖨 Imprimir / PDF
          </button>
          <button
            type="button"
            className={btnSecondary}
            onClick={onClose}
            aria-label="Cerrar resumen"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-surface p-2">
          <div className="text-[0.75rem] text-muted">Ingresos</div>
          <div
            className="text-[0.95rem] font-semibold"
            style={{ color: "var(--color-income)" }}
          >
            {formatMoney(report.summary.income)}
          </div>
        </div>
        <div className="rounded-lg bg-surface p-2">
          <div className="text-[0.75rem] text-muted">Gastos</div>
          <div
            className="text-[0.95rem] font-semibold"
            style={{ color: "var(--color-expense)" }}
          >
            {formatMoney(report.summary.expense)}
          </div>
        </div>
        <div className="rounded-lg bg-surface p-2">
          <div className="text-[0.75rem] text-muted">Balance</div>
          <div
            className="text-[0.95rem] font-semibold"
            style={{
              color:
                report.summary.balance >= 0
                  ? "var(--color-balance-positive)"
                  : "var(--color-balance-negative)",
            }}
          >
            {formatMoney(report.summary.balance)}
          </div>
        </div>
      </div>

      <MonthlyBarChart months={report.monthly} />

      <SummaryBreakdown
        categories={report.categories}
        monthly={report.monthly}
        annual={report.annual}
      />
    </div>
  );
}
