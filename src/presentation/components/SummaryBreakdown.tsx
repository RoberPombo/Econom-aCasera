import type {
  AnnualSummary,
  CategorySummary,
  MonthlySummary,
} from "../../domain/entities";
import {
  expense,
  income,
  listItem,
  listReset,
  section,
  sectionTitle,
  table,
  tableWrap,
  td,
  th,
} from "../styles";

interface Props {
  categories: CategorySummary[];
  monthly: MonthlySummary[];
  annual: AnnualSummary[];
}

function formatMoney(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

function formatMonth(month: number) {
  const name = new Date(2000, month - 1, 1).toLocaleString("es-ES", {
    month: "long",
  });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function balanceClass(balance: number) {
  return balance >= 0 ? "text-balance-positive" : "text-balance-negative";
}

export function SummaryBreakdown({ categories, monthly, annual }: Props) {
  const incomes = categories.filter((c) => c.type === "income");
  const expenses = categories.filter((c) => c.type === "expense");
  const hasCategories = incomes.length + expenses.length > 0;

  return (
    <section className={section} aria-label="Resumen">
      <h2 className={sectionTitle}>Resumen</h2>

      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-3">
        <div>
          <h3 className="mb-2 text-[0.95rem] font-semibold text-muted">
            Por categorías
          </h3>
          {hasCategories ? (
            <ul className={listReset}>
              {incomes.map((c) => (
                <li key={`income-${c.category}`} className={listItem}>
                  <span className="text-[0.9rem]">{c.category}</span>
                  <span className={income}>{formatMoney(c.amount)}</span>
                </li>
              ))}
              {expenses.map((c) => (
                <li key={`expense-${c.category}`} className={listItem}>
                  <span className="text-[0.9rem]">{c.category}</span>
                  <span className={expense}>{formatMoney(c.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[0.9rem] text-muted">Sin datos</p>
          )}
        </div>

        {monthly.length > 1 && (
          <div>
            <h3 className="mb-2 text-[0.95rem] font-semibold text-muted">
              Por meses
            </h3>
            <div className={tableWrap}>
              <table className={table}>
                <thead>
                  <tr>
                    <th className={th}>Mes</th>
                    <th className={th}>Ingresos</th>
                    <th className={th}>Gastos</th>
                    <th className={th}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.month}>
                      <td className={td}>{formatMonth(m.month)}</td>
                      <td className={`${td} ${income}`}>
                        {formatMoney(m.income)}
                      </td>
                      <td className={`${td} ${expense}`}>
                        {formatMoney(m.expense)}
                      </td>
                      <td className={`${td} ${balanceClass(m.balance)}`}>
                        {formatMoney(m.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {annual.length > 1 && (
          <div>
            <h3 className="mb-2 text-[0.95rem] font-semibold text-muted">
              Por años
            </h3>
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
                  {annual.map((a) => (
                    <tr key={a.year}>
                      <td className={td}>{a.year}</td>
                      <td className={`${td} ${income}`}>
                        {formatMoney(a.income)}
                      </td>
                      <td className={`${td} ${expense}`}>
                        {formatMoney(a.expense)}
                      </td>
                      <td className={`${td} ${balanceClass(a.balance)}`}>
                        {formatMoney(a.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
