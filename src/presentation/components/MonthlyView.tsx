import type { MonthlySummary, CategorySummary } from "../../domain/entities";

interface Props {
  monthlySummary: MonthlySummary[];
  categories: CategorySummary[];
  year: number;
}

export function MonthlyView({ monthlySummary, categories, year }: Props) {
  function formatMoney(n: number) {
    return n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
  }

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const data = Array.from({ length: 12 }, (_, i) => {
    const found = monthlySummary.find((m) => m.month === i + 1);
    return found || { month: i + 1, income: 0, expense: 0, balance: 0 };
  });

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div>
      <h2>Resumen mensual {year}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th>Ingresos</th>
              <th>Gastos</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.month}>
                <td>{months[m.month - 1]}</td>
                <td className="income">{formatMoney(m.income)}</td>
                <td className="expense">{formatMoney(m.expense)}</td>
                <td className={m.balance >= 0 ? "income" : "expense"}>{formatMoney(m.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="category-grid">
        <div>
          <h3>Ingresos por categoría</h3>
          <ul>
            {incomeCategories.map((c) => (
              <li key={c.category}>
                {c.category}: <span className="income">{formatMoney(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Gastos por categoría</h3>
          <ul>
            {expenseCategories.map((c) => (
              <li key={c.category}>
                {c.category}: <span className="expense">{formatMoney(c.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
