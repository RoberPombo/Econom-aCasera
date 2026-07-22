import { useEffect, useState } from "react";
import type { Transaction, Category, CategorySummary, MonthlySummary, AnnualSummary, DbInfo } from "./api";
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getCategories,
  getMonthlySummary,
  getAnnualSummary,
  getCurrentYear,
  setCurrentYear,
  getCurrentMonth,
  setCurrentMonth,
  getViewMode,
  setViewMode,
  listCategories,
  getDbInfo,
} from "./api";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { SummaryCards } from "./SummaryCards";
import { MonthlyView } from "./MonthlyView";
import { AnnualView } from "./AnnualView";
import { CategoriesConfig } from "./CategoriesConfig";
import { ImportExcel } from "./ImportExcel";
import { ConflictDialog } from "./ConflictDialog";
import { ConflictError } from "./api";
import "./App.css";

type Tab = "transactions" | "monthly" | "annual" | "categories" | "import";

function App() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [viewMode, setViewModeState] = useState<"monthly" | "annual">("monthly");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [annualSummary, setAnnualSummary] = useState<AnnualSummary[]>([]);
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);
  const [tab, setTab] = useState<Tab>("transactions");
  const [conflict, setConflict] = useState(false);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    refresh();
  }, [year, month, viewMode]);

  async function loadInitial() {
    const [{ year }, { month }, { mode }] = await Promise.all([
      getCurrentYear(),
      getCurrentMonth(),
      getViewMode(),
    ]);
    setYear(year);
    setMonth(month);
    setViewModeState(mode);
  }

  async function refresh() {
    const [tx, sum, catsummary, allCategories, info] = await Promise.all([
      listTransactions(year, viewMode === "monthly" ? month : undefined),
      getSummary(year, viewMode === "monthly" ? month : undefined),
      getCategories(year, viewMode === "monthly" ? month : undefined),
      listCategories(),
      getDbInfo(),
    ]);
    setTransactions(tx);
    setSummary(sum);
    setCategorySummary(catsummary);
    setCategories(allCategories);
    setDbInfo(info);

    const [monthly, annual] = await Promise.all([
      getMonthlySummary(year),
      getAnnualSummary(),
    ]);
    setMonthlySummary(monthly);
    setAnnualSummary(annual);
  }

  async function changeYear(delta: number) {
    const newYear = year + delta;
    await setCurrentYear(newYear);
    setYear(newYear);
  }

  async function changeMonth(newMonth: number) {
    await setCurrentMonth(newMonth);
    setMonth(newMonth);
  }

  async function changeViewMode(mode: "monthly" | "annual") {
    await setViewMode(mode);
    setViewModeState(mode);
  }

  function edit(tx: Transaction) {
    setEditingId(tx.id ?? null);
    setTab("transactions");
  }

  async function withConflictHandling<T>(fn: () => Promise<T>): Promise<T | undefined> {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof ConflictError) {
        setConflict(true);
        return undefined;
      }
      throw err;
    }
  }

  async function handleSubmit(tx: Transaction) {
    const result = await withConflictHandling(async () => {
      if (editingId) {
        return await updateTransaction({ ...tx, id: editingId });
      }
      return await createTransaction(tx);
    });
    if (result === undefined) return;
    setEditingId(null);
    await refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    const result = await withConflictHandling(() => deleteTransaction(id));
    if (result === undefined) return;
    await refresh();
  }

  const editingTx = editingId ? transactions.find((t) => t.id === editingId) : null;

  return (
    <div className="app">
      <header>
        <h1>Gastos e Ingresos</h1>
        <div className="year-selector">
          <button onClick={() => changeYear(-1)}>◀</button>
          <span>{year}</span>
          <button onClick={() => changeYear(1)}>▶</button>
        </div>
      </header>

      <div className="view-controls">
        <div className="view-mode">
          <button className={viewMode === "monthly" ? "active" : ""} onClick={() => changeViewMode("monthly")}>
            Mensual
          </button>
          <button className={viewMode === "annual" ? "active" : ""} onClick={() => changeViewMode("annual")}>
            Anual
          </button>
        </div>
        {viewMode === "monthly" && (
          <select value={month} onChange={(e) => changeMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("es-ES", { month: "long" })}
              </option>
            ))}
          </select>
        )}
      </div>

      <nav className="tabs">
        <button className={tab === "transactions" ? "active" : ""} onClick={() => setTab("transactions")}>
          Movimientos
        </button>
        <button className={tab === "monthly" ? "active" : ""} onClick={() => setTab("monthly")}>
          Mensual
        </button>
        <button className={tab === "annual" ? "active" : ""} onClick={() => setTab("annual")}>
          Anual
        </button>
        <button className={tab === "categories" ? "active" : ""} onClick={() => setTab("categories")}>
          Categorías
        </button>
        <button className={tab === "import" ? "active" : ""} onClick={() => setTab("import")}>
          Importar Excel
        </button>
      </nav>

      <main>
        {tab === "transactions" && (
          <>
            <SummaryCards summary={summary} title={viewMode === "monthly" ? `Resumen ${new Date(year, month - 1).toLocaleString("es-ES", { month: "long", year: "numeric" })}` : `Resumen ${year}`} />
            <section className="form-section">
              <h2>{editingId ? "Editar" : "Nuevo"} movimiento</h2>
              <TransactionForm
                onSubmit={handleSubmit}
                onCancel={() => setEditingId(null)}
                editing={editingTx}
                categories={categories}
                year={year}
                month={month}
              />
            </section>
            <section className="list-section">
              <h2>Movimientos</h2>
              <TransactionList transactions={transactions} onEdit={edit} onDelete={handleDelete} />
            </section>
          </>
        )}

        {tab === "monthly" && (
          <section>
            <MonthlyView monthlySummary={monthlySummary} categories={categorySummary} year={year} />
          </section>
        )}

        {tab === "annual" && (
          <section>
            <AnnualView annualSummary={annualSummary} />
          </section>
        )}

        {tab === "categories" && (
          <section>
            <CategoriesConfig categories={categories} onChange={refresh} onConflict={() => setConflict(true)} />
          </section>
        )}

        {tab === "import" && (
          <section>
            <ImportExcel onImported={refresh} />
          </section>
        )}
      </main>

      {dbInfo && (
        <footer className="db-info">
          {dbInfo.usesDrive ? (
            <>
              <p>✅ Sincronizado con Google Drive</p>
              <p className="hint">Base de datos: <span>{dbInfo.dbPath}</span></p>
              <p className="hint">Copia de seguridad local: <span>{dbInfo.backupPath}</span></p>
            </>
          ) : (
            <>
              <p>⚠️ Google Drive no detectado</p>
              <p className="hint">Base de datos: <span>{dbInfo.dbPath}</span></p>
              <p className="hint">Copia de seguridad: <span>{dbInfo.backupPath}</span></p>
            </>
          )}
        </footer>
      )}

      {conflict && (
        <ConflictDialog
          onResolved={() => {
            setConflict(false);
            refresh();
          }}
          onCancel={() => setConflict(false)}
        />
      )}
    </div>
  );
}

export default App;
