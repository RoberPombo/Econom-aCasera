import { useState } from "react";
import type { Transaction } from "./api";
import { useAppState } from "./hooks/useAppState";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { SummaryCards } from "./SummaryCards";
import { MonthlyView } from "./MonthlyView";
import { AnnualView } from "./AnnualView";
import { CategoriesConfig } from "./CategoriesConfig";
import { ImportExcel } from "./ImportExcel";
import { ConflictDialog } from "./ConflictDialog";
import "./App.css";

type Tab = "transactions" | "monthly" | "annual" | "categories" | "import";

function App() {
  const state = useAppState();
  const [tab, setTab] = useState<Tab>("transactions");
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleSubmit(tx: Transaction) {
    const ok = await state.saveTransaction(tx, editingId);
    if (ok) setEditingId(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    await state.removeTransaction(id);
  }

  function edit(tx: Transaction) {
    setEditingId(tx.id ?? null);
    setTab("transactions");
  }

  const editingTx = editingId ? state.transactions.find((t) => t.id === editingId) : null;

  return (
    <div className="app">
      <header>
        <h1>Gastos e Ingresos</h1>
        <div className="year-selector">
          <button onClick={() => state.changeYear(-1)}>◀</button>
          <span>{state.year}</span>
          <button onClick={() => state.changeYear(1)}>▶</button>
        </div>
      </header>

      <div className="view-controls">
        <div className="view-mode">
          <button className={state.viewMode === "monthly" ? "active" : ""} onClick={() => state.changeViewMode("monthly")}>
            Mensual
          </button>
          <button className={state.viewMode === "annual" ? "active" : ""} onClick={() => state.changeViewMode("annual")}>
            Anual
          </button>
        </div>
        {state.viewMode === "monthly" && (
          <select value={state.month} onChange={(e) => state.changeMonth(Number(e.target.value))}>
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
            <SummaryCards
              summary={state.summary}
              title={
                state.viewMode === "monthly"
                  ? `Resumen ${new Date(state.year, state.month - 1).toLocaleString("es-ES", { month: "long", year: "numeric" })}`
                  : `Resumen ${state.year}`
              }
            />
            <section className="form-section">
              <h2>{editingId ? "Editar" : "Nuevo"} movimiento</h2>
              <TransactionForm
                onSubmit={handleSubmit}
                onCancel={() => setEditingId(null)}
                editing={editingTx}
                categories={state.categories}
                year={state.year}
                month={state.month}
              />
            </section>
            <section className="list-section">
              <h2>Movimientos</h2>
              <TransactionList transactions={state.transactions} onEdit={edit} onDelete={handleDelete} />
            </section>
          </>
        )}

        {tab === "monthly" && (
          <section>
            <MonthlyView monthlySummary={state.monthlySummary} categories={state.categorySummary} year={state.year} />
          </section>
        )}

        {tab === "annual" && (
          <section>
            <AnnualView annualSummary={state.annualSummary} />
          </section>
        )}

        {tab === "categories" && (
          <section>
            <CategoriesConfig
              categories={state.categories}
              onAdd={state.saveCategory}
              onUpdate={state.updateCategoryState}
              onDelete={state.removeCategory}
            />
          </section>
        )}

        {tab === "import" && (
          <section>
            <ImportExcel onImported={state.refresh} />
          </section>
        )}
      </main>

      {state.dbInfo && (
        <footer className="db-info">
          {state.dbInfo.usesDrive ? (
            <>
              <p>✅ Sincronizado con Google Drive</p>
              <p className="hint">Base de datos: <span>{state.dbInfo.dbPath}</span></p>
              <p className="hint">Copia de seguridad local: <span>{state.dbInfo.backupPath}</span></p>
            </>
          ) : (
            <>
              <p>⚠️ Google Drive no detectado</p>
              <p className="hint">Base de datos: <span>{state.dbInfo.dbPath}</span></p>
              <p className="hint">Copia de seguridad: <span>{state.dbInfo.backupPath}</span></p>
            </>
          )}
        </footer>
      )}

      {state.conflict && (
        <ConflictDialog
          onResolved={() => state.handleConflictResolution("reload")}
          onOverwrite={() => state.handleConflictResolution("overwrite")}
          onCancel={() => state.setConflict(false)}
        />
      )}
    </div>
  );
}

export default App;
