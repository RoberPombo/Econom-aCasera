import type { MonthlySummary } from "../../domain/entities";

const WIDTH = 1000;
const HEIGHT = 410;
const PAD_LEFT = 92;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 44;

const MONTH_LABELS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
  "TOT",
];

const SERIES = [
  { key: "income", label: "Ingresos", color: "var(--color-income)" },
  { key: "expense", label: "Gastos", color: "var(--color-expense)" },
  { key: "balance", label: "Ahorro", color: "var(--color-primary)" },
] as const;

interface MonthlyBarChartProps {
  months: MonthlySummary[];
}

function formatAxisValue(n: number): string {
  if (Math.abs(n) >= 1000) {
    const k = (n / 1000).toLocaleString("es-ES", {
      maximumFractionDigits: 1,
    });
    return `${k} k€`;
  }
  return `${Math.round(n)} €`;
}

export function MonthlyBarChart({ months }: MonthlyBarChartProps) {
  const byMonth = new Map(months.map((m) => [m.month, m]));
  const groups = Array.from({ length: 13 }, (_, i) => {
    const month = i + 1;
    const data = byMonth.get(month) ?? {
      month,
      income: 0,
      expense: 0,
      balance: 0,
    };
    return {
      label: MONTH_LABELS[i],
      income: data.income,
      expense: data.expense,
      balance: data.balance,
      total: {
        income:
          month === 13
            ? months.reduce((sum, m) => sum + m.income, 0)
            : data.income,
        expense:
          month === 13
            ? months.reduce((sum, m) => sum + m.expense, 0)
            : data.expense,
        balance:
          month === 13
            ? months.reduce((sum, m) => sum + m.balance, 0)
            : data.balance,
      },
    };
  });

  const values = groups.flatMap((g) => [g.income, g.expense, g.balance]);
  const maxValue = Math.max(...values, 0);
  const minValue = Math.min(0, ...values);
  const padding = Math.max((maxValue - minValue) * 0.12, 1);
  const yMax = maxValue + padding;
  const yMin = minValue - padding;
  const hasData = values.some((v) => v !== 0);

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const groupWidth = plotWidth / groups.length;
  const barWidth = groupWidth * 0.18;

  function xFor(i: number, barIndex: number): number {
    const barsGap = (groupWidth - barWidth * 3) / 4;
    return (
      PAD_LEFT + i * groupWidth + barsGap * (barIndex + 1) + barWidth * barIndex
    );
  }

  function yFor(v: number): number {
    const ratio = (v - yMin) / (yMax - yMin);
    return PAD_TOP + plotHeight - ratio * plotHeight;
  }

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const ratio = i / (tickCount - 1);
    const value = yMin + (yMax - yMin) * ratio;
    return { y: PAD_TOP + plotHeight - ratio * plotHeight, value };
  });

  return (
    <div className="rounded-lg border border-line bg-surface p-4 shadow-card">
      <h3 className="mb-3 text-center text-[1rem] font-semibold">
        Ingresos, gastos y ahorro por mes
      </h3>

      <div className="mb-2 flex flex-wrap justify-center gap-4">
        {SERIES.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-1.5 text-[0.85rem]"
          >
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            {s.label}
          </span>
        ))}
      </div>

      {hasData ? (
        <svg
          role="img"
          aria-label="Gráfica mensual de ingresos, gastos y ahorro"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="mx-auto block h-auto w-full print-color-exact"
        >
          {ticks.map((tick) => (
            <g key={tick.y}>
              <line
                x1={PAD_LEFT}
                x2={WIDTH - PAD_RIGHT}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--color-line)"
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 8}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="13"
                fill="var(--color-muted)"
              >
                {formatAxisValue(tick.value)}
              </text>
            </g>
          ))}

          {groups.map((group, i) => {
            const isTotal = i === groups.length - 1;
            return (
              <g key={group.label}>
                {SERIES.map((s, barIndex) => {
                  const value = group.total[s.key];
                  if (value === 0) return null;
                  const x = xFor(i, barIndex);
                  const yTop = yFor(Math.max(value, 0));
                  const yBottom = yFor(Math.min(value, 0));
                  return (
                    <rect
                      key={s.key}
                      x={x}
                      y={yTop}
                      width={barWidth}
                      height={Math.max(yBottom - yTop, 1)}
                      fill={s.color}
                      opacity={isTotal ? 0.85 : 1}
                    />
                  );
                })}
                <text
                  x={PAD_LEFT + i * groupWidth + groupWidth / 2}
                  y={HEIGHT - PAD_BOTTOM + 22}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight={isTotal ? "bold" : "normal"}
                  fill="var(--color-muted)"
                  opacity={isTotal ? 1 : 0.85}
                >
                  {group.label}
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <div className="py-10 text-center text-[0.9rem] text-muted">
          Sin datos
        </div>
      )}
    </div>
  );
}
