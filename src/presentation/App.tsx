import { useState } from "react";
import type { Transaction } from "../domain/entities";
import { useAppState } from "./hooks/useAppState";
import { TransactionForm, type TransactionFormData } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { SummaryCards } from "./components/SummaryCards";
import { MonthlyView } from "./components/MonthlyView";
import { AnnualView } from "./components/AnnualView";
import { CategoriesConfig } from "./components/CategoriesConfig";
import { PersonsConfig } from "./components/PersonsConfig";
import { ImportExcel } from "./components/ImportExcel";
import { ConflictDialog } from "./components/ConflictDialog";
import { UpdateDialog } from "./components/UpdateDialog";
import "./components/App.css";

type Tab = "transactions" | "monthly" | "annual" | "categories" | "persons" | "import";

function App() {
  const state = useAppState();
  const [tab, setTab] = useState<Tab>("transactions");
  const [editingId, setEditingId] = useState<number | null>(null);

  const currentYear = state.settings?.currentYear ?? new Date().getFullYear();
  const currentMonth = state.settings?.currentMonth ?? 1;
  const viewMode = state.settings?.viewMode ?? "monthly";

  async function handleSubmit(data: TransactionFormData) {
    if (editingId) {
      await state.updateTransaction(editingId, data);
    } else {
      await state.saveTransaction(data);
    }
    setEditingId(null);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este movimiento?")) return;
    await state.deleteTransaction(id);
  }

  function edit(tx: Transaction) {
    setEditingId(typeof tx.id === "number" ? tx.id : Number(tx.id));
    setTab("transactions");
  }

  const editingTx = editingId ? state.transactions.find((t) => t.id === editingId) : null;

  return (
    <div className="app">
      <header>
        <h1>Economía Casera</h1>
        <div className="year-selector">
          <button onClick={() => state.changeYear(-1)}>◀</button>
          <span>{currentYear}</span>
          <button onClick={() => state.changeYear(1)}>▶</button>
        </div>
        <button
          className="theme-toggle"
          onClick={state.toggleTheme}
          title={`Tema: ${state.settings?.theme ?? "system"}`}
        >
          {state.resolvedTheme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      <div className="view-controls">
        <div className="view-mode">
          <button className={viewMode === "monthly" ? "active" : ""} onClick={() => state.changeViewMode("monthly")}>
            Mensual
          </button>
          <button className={viewMode === "annual" ? "active" : ""} onClick={() => state.changeViewMode("annual")}>
            Anual
          </button>
        </div>
        {viewMode === "monthly" && (
          <select value={currentMonth} onChange={(e) => state.changeMonth(Number(e.target.value))}>
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
        <button className={tab === "persons" ? "active" : ""} onClick={() => setTab("persons")}>
          Personas
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
                viewMode === "monthly"
                  ? `Resumen ${new Date(currentYear, currentMonth - 1).toLocaleString("es-ES", { month: "long", year: "numeric" })}`
                  : `Resumen ${currentYear}`
              }
            />
            <section className="form-section">
              <h2>{editingId ? "Editar" : "Nuevo"} movimiento</h2>
              <TransactionForm
                onSubmit={handleSubmit}
                onCancel={() => setEditingId(null)}
                initialValue={editingTx ?? undefined}
                categories={state.categories}
                persons={state.persons}
                year={currentYear}
                month={currentMonth}
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
            <MonthlyView monthlySummary={state.monthlySummary} categories={state.categorySummary} year={currentYear} />
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
              onAdd={state.createCategory}
              onUpdate={state.updateCategory}
              onDelete={state.removeCategory}
            />
          </section>
        )}

        {tab === "persons" && (
          <section>
            <PersonsConfig
              persons={state.persons}
              onAdd={state.createPerson}
              onUpdate={state.updatePerson}
              onDelete={state.removePerson}
            />
          </section>
        )}

        {tab === "import" && (
          <section>
            <ImportExcel onImport={state.importExcel} onImported={state.refresh} />
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

      {state.showConflict && (
        <ConflictDialog
          onReload={state.reloadDatabase}
          onOverwrite={state.forceOverwrite}
          onCancel={state.closeConflict}
        />
      )}

      {state.updateInfo && (
        <UpdateDialog
          update={state.updateInfo}
          onConfirm={state.downloadUpdate}
          onCancel={state.dismissUpdate}
        />
      )}
    </div>
  );
}

export default App;
