import { useState } from "react";
import type { Transaction } from "../domain/entities";
import type { ImportCategoryOption } from "../domain/repositories/ImportRepository";
import { BalanceChart } from "./components/BalanceChart";
import { CategoriesConfig } from "./components/CategoriesConfig";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ConflictDialog } from "./components/ConflictDialog";
import { ImportView } from "./components/ImportView";
import { Modal } from "./components/Modal";
import { PersonsConfig } from "./components/PersonsConfig";
import { ReceiptViewer } from "./components/ReceiptViewer";
import { SimilarTransactionDialog } from "./components/SimilarTransactionDialog";
import { SummaryModal } from "./components/SummaryModal";
import { TransactionFiltersBar } from "./components/TransactionFiltersBar";
import {
  TransactionForm,
  type TransactionFormData,
} from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { UpdateDialog } from "./components/UpdateDialog";
import { useAppState } from "./hooks/useAppState";
import {
  app,
  chartGrid,
  chartSection,
  dbInfo,
  dbInfoHint,
  header,
  headerTitle,
  iconBtn,
  iconGroup,
  mainLayout,
  section,
  sectionTitle,
  themeToggle,
} from "./styles";

function AddIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ThemeIcon({ resolvedTheme }: { resolvedTheme: "light" | "dark" }) {
  return resolvedTheme === "dark" ? (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function formatPeriodTitle(
  filters: NonNullable<ReturnType<typeof useAppState>["filters"]>,
): string {
  if (filters.period.mode === "month") {
    const title = new Date(
      filters.period.year,
      filters.period.month - 1,
    ).toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
    });
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  const { from, to } = filters.period;
  if (!from && !to) return "Todo el historial";
  if (from && to) return `${from} — ${to}`;
  if (from) return `Desde ${from}`;
  return `Hasta ${to}`;
}

function App() {
  const state = useAppState();
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [similarMatches, setSimilarMatches] = useState<Transaction[]>([]);
  const [pendingTransaction, setPendingTransaction] =
    useState<TransactionFormData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [reportYear, setReportYear] = useState<number | null>(null);
  const [receiptViewUrl, setReceiptViewUrl] = useState<string | null>(null);
  const [editingReceiptUrl, setEditingReceiptUrl] = useState<string | null>(
    null,
  );

  const currentYear = state.settings?.currentYear ?? new Date().getFullYear();
  const currentMonth =
    state.settings?.currentMonth ?? new Date().getMonth() + 1;
  const filters = state.filters;

  function toSavePayload(data: TransactionFormData) {
    return {
      date: data.date,
      type: data.type,
      category: data.category,
      concept: data.concept,
      amount: data.amount,
      person: data.person,
      receipt: data.receipt
        ? { bytes: data.receipt.bytes, extension: data.receipt.extension }
        : null,
      removeReceipt: data.removeReceipt,
    };
  }

  async function handleSubmit(data: TransactionFormData) {
    if (editingTx) {
      const id =
        typeof editingTx.id === "number" ? editingTx.id : Number(editingTx.id);
      await state.updateTransaction(id, toSavePayload(data));
      setEditingTx(null);
      setEditingReceiptUrl(null);
      setShowAddModal(false);
      return;
    }

    const matches = await state.findSimilarTransactions(
      data.date,
      data.category,
      data.type,
      data.amount,
    );
    if (matches.length > 0) {
      setPendingTransaction(data);
      setSimilarMatches(matches);
      return;
    }

    await state.saveTransaction(toSavePayload(data));
    setShowAddModal(false);
  }

  async function confirmAddAsNew() {
    if (pendingTransaction) {
      await state.saveTransaction(toSavePayload(pendingTransaction));
    }
    setPendingTransaction(null);
    setSimilarMatches([]);
    setShowAddModal(false);
  }

  async function confirmUpdateExisting(tx: Transaction) {
    if (pendingTransaction) {
      const id = typeof tx.id === "number" ? tx.id : Number(tx.id);
      await state.updateTransaction(id, toSavePayload(pendingTransaction));
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

  async function edit(tx: Transaction) {
    setEditingTx(tx);
    setEditingReceiptUrl(null);
    if (tx.receiptPath) {
      try {
        setEditingReceiptUrl(await state.loadReceiptDataUrl(tx.receiptPath));
      } catch {
        setEditingReceiptUrl(null);
      }
    }
    setShowAddModal(true);
  }

  async function viewReceipt(tx: Transaction) {
    if (!tx.receiptPath) return;
    try {
      const url = await state.loadReceiptDataUrl(tx.receiptPath);
      setReceiptViewUrl(url);
    } catch {
      setReceiptViewUrl(null);
    }
  }

  const periodTitle = filters ? formatPeriodTitle(filters) : "";
  const secondaryTitle =
    filters?.period.mode === "month"
      ? `Año ${filters.period.year}`
      : "Totales filtrados";

  async function confirmImport(transactions: Transaction[]) {
    const count = await state.confirmImport(transactions);
    setShowImportModal(false);
    return count;
  }

  async function addImportCategories(
    options: ImportCategoryOption[],
  ): Promise<number> {
    return state.addImportCategories(options);
  }

  function openSummary() {
    setReportYear(currentYear);
    setShowSummaryModal(true);
    void state.loadYearReport(currentYear);
  }

  function changeReportYear(year: number) {
    setReportYear(year);
    void state.loadYearReport(year);
  }

  return (
    <div className={app}>
      <header className={header}>
        <h1 className={headerTitle}>Economía Casera</h1>
        <div className={iconGroup}>
          <button
            type="button"
            className={iconBtn}
            onClick={() => setShowAddModal(true)}
            title="Añadir movimiento"
            aria-label="Añadir movimiento"
          >
            <AddIcon />
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => setShowImportModal(true)}
            title="Importar"
            aria-label="Importar"
          >
            <ImportIcon />
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={openSummary}
            title="Resumen"
            aria-label="Resumen"
          >
            <SummaryIcon />
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => setShowSettingsModal(true)}
            title="Configuración"
            aria-label="Configuración"
          >
            <SettingsIcon />
          </button>
          <button
            type="button"
            className={themeToggle}
            onClick={state.toggleTheme}
            title={`Tema: ${state.settings?.theme ?? "system"}`}
            aria-label="Cambiar tema"
          >
            <ThemeIcon resolvedTheme={state.resolvedTheme} />
          </button>
        </div>
      </header>

      {filters && (
        <TransactionFiltersBar
          filters={filters}
          categories={state.categories}
          persons={state.persons}
          resultCount={state.transactions.length}
          onChange={state.updateFilters}
          onClear={state.clearFilters}
          onPeriodModeChange={state.changePeriodMode}
          onMonthChange={state.changeMonth}
          onYearChange={state.changeYear}
          onRangeChange={state.changeRange}
        />
      )}

      <main className={mainLayout}>
        <section className={chartSection}>
          <div className={chartGrid}>
            <BalanceChart
              title={periodTitle}
              income={state.summary.income}
              expense={state.summary.expense}
              balance={state.summary.balance}
            />
            <BalanceChart
              title={secondaryTitle}
              income={state.yearSummary.income}
              expense={state.yearSummary.expense}
              balance={state.yearSummary.balance}
            />
          </div>
        </section>

        <section className={section}>
          <h2 className={sectionTitle}>Movimientos · {periodTitle}</h2>
          <TransactionList
            transactions={state.transactions}
            categories={state.categories}
            persons={state.persons}
            onEdit={edit}
            onDelete={handleDelete}
            onViewReceipt={viewReceipt}
          />
        </section>
      </main>

      {state.dbInfo && (
        <footer className={dbInfo}>
          {state.dbInfo.usesDrive ? (
            <>
              <p className={dbInfoHint}>✅ Sincronizado con Google Drive</p>
              <p className={dbInfoHint}>
                Base de datos:{" "}
                <span className="break-all">{state.dbInfo.dbPath}</span>
              </p>
              <p className={dbInfoHint}>
                Copia de seguridad local:{" "}
                <span className="break-all">{state.dbInfo.backupPath}</span>
              </p>
            </>
          ) : (
            <>
              <p className={dbInfoHint}>⚠️ Google Drive no detectado</p>
              <p className={dbInfoHint}>
                Base de datos:{" "}
                <span className="break-all">{state.dbInfo.dbPath}</span>
              </p>
              <p className={dbInfoHint}>
                Copia de seguridad:{" "}
                <span className="break-all">{state.dbInfo.backupPath}</span>
              </p>
            </>
          )}
        </footer>
      )}

      {showAddModal && (
        <Modal
          title={editingTx ? "Editar movimiento" : "Añadir movimiento"}
          onClose={() => {
            setShowAddModal(false);
            setEditingTx(null);
            setEditingReceiptUrl(null);
          }}
        >
          <TransactionForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowAddModal(false);
              setEditingTx(null);
              setEditingReceiptUrl(null);
            }}
            initialValue={editingTx ?? undefined}
            categories={state.categories}
            persons={state.persons}
            year={currentYear}
            month={currentMonth}
            existingReceiptUrl={editingReceiptUrl}
          />
        </Modal>
      )}

      {receiptViewUrl && (
        <ReceiptViewer
          src={receiptViewUrl}
          onClose={() => setReceiptViewUrl(null)}
        />
      )}

      {showImportModal && (
        <Modal
          title="Importar movimientos"
          onClose={() => setShowImportModal(false)}
          wide
        >
          <ImportView
            persons={state.persons}
            categories={state.categories}
            onPreview={state.previewImport}
            onConfirm={confirmImport}
            onAddCategories={addImportCategories}
          />
        </Modal>
      )}

      {showSummaryModal && reportYear !== null && (
        <Modal
          title={`Resumen · ${reportYear}`}
          onClose={() => setShowSummaryModal(false)}
          wide
        >
          {state.report ? (
            <SummaryModal
              year={reportYear}
              report={state.report}
              onYearChange={changeReportYear}
              onClose={() => setShowSummaryModal(false)}
            />
          ) : (
            <p>Cargando resumen…</p>
          )}
        </Modal>
      )}

      {showSettingsModal && (
        <Modal
          title="Configuración"
          onClose={() => setShowSettingsModal(false)}
        >
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
