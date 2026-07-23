import { useEffect, useState } from "react";
import Database from "@tauri-apps/plugin-sql";

interface Transaction {
  id: number;
  date: string;
  type: "income" | "expense";
  category: string;
  concept: string;
  amount: number;
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initDb() {
      const db = await Database.load("sqlite:economiacasera.db");

      await db.execute(`
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          concept TEXT NOT NULL,
          amount REAL NOT NULL
        )
      `);

      const existing = await db.select<{ count: number }[]>(
        "SELECT COUNT(*) as count FROM transactions"
      );

      if (existing[0].count === 0) {
        await db.execute(
          `INSERT INTO transactions (date, type, category, concept, amount) VALUES
           ('2026-01-05', 'income', 'Nómina', 'Nómina enero', 1500),
           ('2026-01-08', 'expense', 'Comida', 'Compra semanal', 120.5),
           ('2026-01-12', 'expense', 'Transporte', 'Gasolina', 60),
           ('2026-01-15', 'income', 'Freelance', 'Proyecto web', 350),
           ('2026-01-20', 'expense', 'Ocio', 'Cena con amigos', 45.9)`
        );
      }

      const rows = await db.select<Transaction[]>(
        "SELECT id, date, type, category, concept, amount FROM transactions ORDER BY date"
      );
      setTransactions(rows);

      const totals = await db.select<{ type: string; total: number }[]>(
        "SELECT type, SUM(amount) as total FROM transactions GROUP BY type"
      );
      const income = totals.find((t) => t.type === "income")?.total ?? 0;
      const expense = totals.find((t) => t.type === "expense")?.total ?? 0;
      setSummary({ income, expense, balance: income - expense });

      setLoading(false);
    }

    initDb().catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <main className="container"><p>Cargando...</p></main>;
  }

  return (
    <main className="container">
      <h1>Economía Casera — PoC Tauri</h1>

      <section className="summary">
        <div className="card income">
          <strong>Ingresos</strong>
          <span>{summary.income.toFixed(2)} €</span>
        </div>
        <div className="card expense">
          <strong>Gastos</strong>
          <span>{summary.expense.toFixed(2)} €</span>
        </div>
        <div className="card balance">
          <strong>Balance</strong>
          <span>{summary.balance.toFixed(2)} €</span>
        </div>
      </section>

      <h2>Movimientos</h2>
      <table className="transactions">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Concepto</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className={tx.type}>
              <td>{tx.date}</td>
              <td>{tx.type === "income" ? "Ingreso" : "Gasto"}</td>
              <td>{tx.category}</td>
              <td>{tx.concept}</td>
              <td>{tx.amount.toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

export default App;
