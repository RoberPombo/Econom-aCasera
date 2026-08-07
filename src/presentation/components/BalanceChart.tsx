interface BalanceChartProps {
  title: string;
  income: number;
  expense: number;
  balance: number;
}

export function BalanceChart({
  title,
  income,
  expense,
  balance,
}: BalanceChartProps) {
  function formatMoney(n: number) {
    return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  }

  const radius = 70;
  const stroke = 36;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(income + expense, 1);
  const incomeLength = (income / total) * circumference;
  const expenseLength = (expense / total) * circumference;
  const hasData = income > 0 || expense > 0;

  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <h3 className="mb-3 text-center text-[1rem] font-semibold">{title}</h3>

      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="mx-auto block h-auto w-full max-w-[220px] tablet:max-w-[260px] ultrawide:max-w-[320px]"
      >
        {/* background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />

        {hasData ? (
          <>
            {/* income slice */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--color-income)"
              strokeWidth={stroke}
              strokeDasharray={`${incomeLength} ${circumference - incomeLength}`}
              strokeDashoffset={-circumference / 4}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            {/* expense slice */}
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke="var(--color-expense)"
              strokeWidth={stroke}
              strokeDasharray={`${expenseLength} ${circumference - expenseLength}`}
              strokeDashoffset={-(circumference / 4 + incomeLength)}
              strokeLinecap="butt"
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          </>
        ) : (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[0.75rem]"
            fill="var(--color-muted)"
          >
            Sin datos
          </text>
        )}
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-surface p-2">
          <div className="text-[0.75rem] text-muted">Ingresos</div>
          <div
            className="text-[0.85rem] font-semibold"
            style={{ color: "var(--color-income)" }}
          >
            {formatMoney(income)}
          </div>
        </div>
        <div className="rounded-lg bg-surface p-2">
          <div className="text-[0.75rem] text-muted">Gastos</div>
          <div
            className="text-[0.85rem] font-semibold"
            style={{ color: "var(--color-expense)" }}
          >
            {formatMoney(-expense)}
          </div>
        </div>
        <div className="rounded-lg bg-surface p-2">
          <div className="text-[0.75rem] text-muted">Balance</div>
          <div
            className="text-[0.85rem] font-semibold"
            style={{
              color:
                balance >= 0
                  ? "var(--color-balance-positive)"
                  : "var(--color-balance-negative)",
            }}
          >
            {formatMoney(balance)}
          </div>
        </div>
      </div>
    </div>
  );
}
