import { useState } from "react";
import type { Transaction } from "../domain/entities";
import { useAppState } from "./hooks/useAppState";
import { TransactionForm, type TransactionFormData } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { BalanceChart } from "./components/BalanceChart";
import { CategoriesConfig } from "./components/CategoriesConfig";
import { PersonsConfig } from "./components/PersonsConfig";
import { ImportView } from "./components/ImportView";
import { ConflictDialog } from "./components/ConflictDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { UpdateDialog } from "./components/UpdateDialog";
import { SimilarTransactionDialog } from "./components/SimilarTransactionDialog";
import { Modal } from "./components/Modal";
import {
  app,
  header,
  headerTitle,
  yearSelector,
  yearBtn,
  themeToggle,
  iconBtn,
  iconGroup,
  monthGrid,
  monthBtn,
  monthBtnActive,
  section,
  sectionTitle,
  chartGrid,
  dbInfo,
  dbInfoHint,
} from "./styles";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function AddIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ThemeIcon({ resolvedTheme }: { resolvedTheme: "light" | "dark" }) {
  return resolvedTheme === "dark" ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function App() {
  const state = useAppState();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [similarMatches, setSimilarMatches] = useState<Transaction[]>([]);
  const [pendingTransaction, setPendingTransaction] = useState<TransactionFormData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const currentYear = state.settings?.currentYear ?? new Date().getFullYear();
  const currentMonth = state.settings?.currentMonth ?? new Date().getMonth() + 1;

  async function handleSubmit(data: TransactionFormData) {
    if (editingId) {
      await state.updateTransaction(editingId, data);
      setEditingId(null);
      setShowAddModal(false);
      return;
    }

    const matches = await state.findSimilarTransactions(data.date, data.category, data.type, data.amount);
    if (matches.length > 0) {
      setPendingTransaction(data);
      setSimilarMatches(matches);
      return;
    }

    await state.saveTransaction(data);
    setShowAddModal(false);
  }

  async function confirmAddAsNew() {
    if (pendingTransaction) {
      await state.saveTransaction(pendingTransaction);
    }
    setPendingTransaction(null);
    setSimilarMatches([]);
    setShowAddModal(false);
  }

  async function confirmUpdateExisting(tx: Transaction) {
    if (pendingTransaction) {
      const id = typeof tx.id === "number" ? tx.id : Number(tx.id);
      await state.updateTransaction(id, pendingTransaction);
    }
    setPendingTransaction(null);
    setSimilarMatches([]);
    setShowAddModal(false);
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
    setShowAddModal(true);
  }

  const editingTx = editingId ? state.transactions.find((t) => t.id === editingId) : null;

  const annualData = state.annualSummary.find((a) => a.year === currentYear) ?? {
    year: currentYear,
    income: 0,
    expense: 0,
    balance: 0,
  };

  const monthTitle = new Date(currentYear, currentMonth - 1).toLocaleString("es-ES", { month: "long", year: "numeric" });
  const annualTitle = `Año ${currentYear}`;

  async function confirmImport(transactions: Transaction[]) {
    const count = await state.confirmImport(transactions);
    setShowImportModal(false);
    return count;
  }

  return (
    <div className={app}>
      <header className={header}>
        <h1 className={headerTitle}>Economía Casera</h1>
        <div className={iconGroup}>
          <button className={iconBtn} onClick={() => setShowAddModal(true)} title="Añadir movimiento" aria-label="Añadir movimiento">
            <AddIcon />
          </button>
          <button className={iconBtn} onClick={() => setShowImportModal(true)} title="Importar" aria-label="Importar">
            <ImportIcon />
          </button>
          <button className={iconBtn} onClick={() => setShowSettingsModal(true)} title="Configuración" aria-label="Configuración">
            <SettingsIcon />
          </button>
          <button
            className={themeToggle}
            onClick={state.toggleTheme}
            title={`Tema: ${state.settings?.theme ?? "system"}`}
            aria-label="Cambiar tema"
          >
            <ThemeIcon resolvedTheme={state.resolvedTheme} />
          </button>
        </div>
      </header>

      <nav className={monthGrid}>
        {MONTHS.map((label, index) => {
          const month = index + 1;
          const isActive = month === currentMonth;
          return (
            <button
              key={month}
              className={isActive ? monthBtnActive : monthBtn}
              onClick={() => state.changeMonth(month)}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
        <div className={`${yearSelector} ml-auto`}>
          <button className={yearBtn} onClick={() => state.changeYear(-1)} aria-label="Año anterior">
            ◀
          </button>
          <span className="min-w-[5ch] text-center">{currentYear}</span>
          <button className={yearBtn} onClick={() => state.changeYear(1)} aria-label="Año siguiente">
            ▶
          </button>
        </div>
      </nav>

      <main>
        <section className={chartGrid}>
          <BalanceChart
            title={monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1)}
            income={state.summary.income}
            expense={state.summary.expense}
            balance={state.summary.balance}
          />
          <BalanceChart
            title={annualTitle}
            income={annualData.income}
            expense={annualData.expense}
            balance={annualData.balance}
          />
        </section>

        <section className={section}>
          <h2 className={sectionTitle}>Movimientos de {monthTitle}</h2>
          <TransactionList transactions={state.transactions} categories={state.categories} persons={state.persons} onEdit={edit} onDelete={handleDelete} />
        </section>
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

      {showAddModal && (
        <Modal title={editingId ? "Editar movimiento" : "Añadir movimiento"} onClose={() => { setShowAddModal(false); setEditingId(null); }}>
          <TransactionForm
            onSubmit={handleSubmit}
            onCancel={() => { setShowAddModal(false); setEditingId(null); }}
            initialValue={editingTx ?? undefined}
            categories={state.categories}
            persons={state.persons}
            year={currentYear}
            month={currentMonth}
          />
        </Modal>
      )}

      {showImportModal && (
        <Modal title="Importar movimientos" onClose={() => setShowImportModal(false)}>
          <ImportView persons={state.persons} onPreview={state.previewImport} onConfirm={confirmImport} />
        </Modal>
      )}

      {showSettingsModal && (
        <Modal title="Configuración" onClose={() => setShowSettingsModal(false)}>
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
        </Modal>
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
