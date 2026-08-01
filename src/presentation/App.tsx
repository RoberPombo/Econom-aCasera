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
import { ImportView } from "./components/ImportView";
import { ConflictDialog } from "./components/ConflictDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { UpdateDialog } from "./components/UpdateDialog";
import { SimilarTransactionDialog } from "./components/SimilarTransactionDialog";
import {
  app,
  header,
  headerTitle,
  yearSelector,
  yearBtn,
  themeToggle,
  viewControls,
  viewModeGroup,
  viewModeBtn,
  viewModeBtnActive,
  tabs,
  tabBtn,
  tabBtnActive,
  section,
  sectionTitle,
  input,
  dbInfo,
  dbInfoHint,
} from "./styles";

type Tab = "transactions" | "monthly" | "annual" | "settings" | "import";

function App() {
  const state = useAppState();
  const [tab, setTab] = useState<Tab>("transactions");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [similarMatches, setSimilarMatches] = useState<Transaction[]>([]);
  const [pendingTransaction, setPendingTransaction] = useState<TransactionFormData | null>(null);

  const currentYear = state.settings?.currentYear ?? new Date().getFullYear();
  const currentMonth = state.settings?.currentMonth ?? 1;
  const viewMode = state.settings?.viewMode ?? "monthly";

  async function handleSubmit(data: TransactionFormData) {
    if (editingId) {
      await state.updateTransaction(editingId, data);
      setEditingId(null);
      return;
    }

    const matches = await state.findSimilarTransactions(data.date, data.category, data.type, data.amount);
    if (matches.length > 0) {
      setPendingTransaction(data);
      setSimilarMatches(matches);
      return;
    }

    await state.saveTransaction(data);
  }

  async function confirmAddAsNew() {
    if (pendingTransaction) {
      await state.saveTransaction(pendingTransaction);
    }
    setPendingTransaction(null);
    setSimilarMatches([]);
  }

  async function confirmUpdateExisting(tx: Transaction) {
    if (pendingTransaction) {
      const id = typeof tx.id === "number" ? tx.id : Number(tx.id);
      await state.updateTransaction(id, pendingTransaction);
    }
    setPendingTransaction(null);
    setSimilarMatches([]);
  }

  function cancelSimilarDialog() {
    setPendingTransaction(null);
    setSimilarMatches([]);
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
  }

  async function confirmDelete() {
    if (deletingId !== null) {
      await state.deleteTransaction(deletingId);
    }
    setDeletingId(null);
  }

  function edit(tx: Transaction) {
    setEditingId(typeof tx.id === "number" ? tx.id : Number(tx.id));
    setTab("transactions");
  }

  const editingTx = editingId ? state.transactions.find((t) => t.id === editingId) : null;

  return (
    <div className={app}>
      <header className={header}>
        <h1 className={headerTitle}>Economía Casera</h1>
        <div className={yearSelector}>
          <button className={yearBtn} onClick={() => state.changeYear(-1)}>◀</button>
          <span>{currentYear}</span>
          <button className={yearBtn} onClick={() => state.changeYear(1)}>▶</button>
        </div>
        <button
          className={themeToggle}
          onClick={state.toggleTheme}
          title={`Tema: ${state.settings?.theme ?? "system"}`}
        >
          {state.resolvedTheme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      <div className={viewControls}>
        <div className={viewModeGroup}>
          <button
            className={viewMode === "monthly" ? viewModeBtnActive : viewModeBtn}
            onClick={() => state.changeViewMode("monthly")}
          >
            Mensual
          </button>
          <button
            className={viewMode === "annual" ? viewModeBtnActive : viewModeBtn}
            onClick={() => state.changeViewMode("annual")}
          >
            Anual
          </button>
        </div>
        {viewMode === "monthly" && (
          <select
            className={input}
            value={currentMonth}
            onChange={(e) => state.changeMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString("es-ES", { month: "long" })}
              </option>
            ))}
          </select>
        )}
      </div>

      <nav className={tabs}>
        <button className={tab === "transactions" ? tabBtnActive : tabBtn} onClick={() => setTab("transactions")}>
          Movimientos
        </button>
        <button className={tab === "monthly" ? tabBtnActive : tabBtn} onClick={() => setTab("monthly")}>
          Mensual
        </button>
        <button className={tab === "annual" ? tabBtnActive : tabBtn} onClick={() => setTab("annual")}>
          Anual
        </button>
        <button className={tab === "import" ? tabBtnActive : tabBtn} onClick={() => setTab("import")}>
          Importar
        </button>
        <button
          className={tab === "settings" ? tabBtnActive : tabBtn}
          onClick={() => setTab("settings")}
          title="Configuración"
          aria-label="Configuración"
        >
          ⚙️
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
            <section className={section}>
              <h2 className={sectionTitle}>{editingId ? "Editar" : "Nuevo"} movimiento</h2>
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
            <section className={section}>
              <h2 className={sectionTitle}>Movimientos</h2>
              <TransactionList transactions={state.transactions} onEdit={edit} onDelete={handleDelete} />
            </section>
          </>
        )}

        {tab === "monthly" && (
          <section className={section}>
            <MonthlyView monthlySummary={state.monthlySummary} categories={state.categorySummary} year={currentYear} />
          </section>
        )}

        {tab === "annual" && (
          <section className={section}>
            <AnnualView annualSummary={state.annualSummary} />
          </section>
        )}

        {tab === "settings" && (
          <section className={section}>
            <CategoriesConfig
              categories={state.categories}
              onAdd={state.createCategory}
              onUpdate={state.updateCategory}
              onDelete={state.removeCategory}
            />
            <PersonsConfig
              persons={state.persons}
              onAdd={state.createPerson}
              onUpdate={state.updatePerson}
              onDelete={state.removePerson}
            />
          </section>
        )}

        {tab === "import" && (
          <section className={section}>
            <ImportView persons={state.persons} onPreview={state.previewImport} onConfirm={state.confirmImport} />
          </section>
        )}
      </main>

      {state.dbInfo && (
        <footer className={dbInfo}>
          {state.dbInfo.usesDrive ? (
            <>
              <p className={dbInfoHint}>✅ Sincronizado con Google Drive</p>
              <p className={dbInfoHint}>Base de datos: <span className="break-all">{state.dbInfo.dbPath}</span></p>
              <p className={dbInfoHint}>Copia de seguridad local: <span className="break-all">{state.dbInfo.backupPath}</span></p>
            </>
          ) : (
            <>
              <p className={dbInfoHint}>⚠️ Google Drive no detectado</p>
              <p className={dbInfoHint}>Base de datos: <span className="break-all">{state.dbInfo.dbPath}</span></p>
              <p className={dbInfoHint}>Copia de seguridad: <span className="break-all">{state.dbInfo.backupPath}</span></p>
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

      {deletingId !== null && (
        <ConfirmDialog
          message="¿Eliminar este movimiento?"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {similarMatches.length > 0 && (
        <SimilarTransactionDialog
          matches={similarMatches}
          onUpdate={confirmUpdateExisting}
          onAddNew={confirmAddAsNew}
          onCancel={cancelSimilarDialog}
        />
      )}
    </div>
  );
}

export default App;
