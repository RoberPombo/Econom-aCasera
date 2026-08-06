import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Category, Person, TransactionFilters, TransactionType, PeriodMode } from "../../domain/entities";
import {
  filtersBar,
  filtersRow,
  filtersGroup,
  filtersLabel,
  input,
  inputInline,
  btnGhost,
  btnGhostActive,
  btnSecondary,
  label,
  periodToggle,
} from "../styles";

export interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  categories: Category[];
  persons: Person[];
  resultCount: number;
  onChange: (filters: TransactionFilters) => void;
  onClear: () => void;
  onPeriodModeChange: (mode: PeriodMode) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (delta: number) => void;
  onRangeChange: (from?: string, to?: string) => void;
}

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function amountToDraft(value: number | null): string {
  return value === null ? "" : String(value);
}

function parseAmountDraft(value: string): number | null {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function TransactionFiltersBar({
  filters,
  categories,
  persons,
  resultCount,
  onChange,
  onClear,
  onPeriodModeChange,
  onMonthChange,
  onYearChange,
  onRangeChange,
}: TransactionFiltersBarProps) {
  const periodMode = filters.period.mode;
  const activeCategories = categories.filter((c) => c.active);
  const activePersons = persons.filter((p) => p.active);
  const [minAmountDraft, setMinAmountDraft] = useState(amountToDraft(filters.minAmount));
  const [maxAmountDraft, setMaxAmountDraft] = useState(amountToDraft(filters.maxAmount));

  useEffect(() => {
    setMinAmountDraft(amountToDraft(filters.minAmount));
    setMaxAmountDraft(amountToDraft(filters.maxAmount));
  }, [filters.minAmount, filters.maxAmount]);

  const selectedType: "" | TransactionType =
    filters.types.length === 1 ? filters.types[0] : "";

  function setType(value: string) {
    if (!value) {
      onChange(filters.withUpdates({ types: [] }));
      return;
    }
    onChange(filters.withUpdates({ types: [value as TransactionType] }));
  }

  function setCategory(value: string) {
    if (!value) {
      onChange(filters.withUpdates({ categoryKeys: [] }));
      return;
    }
    onChange(filters.withUpdates({ categoryKeys: toggleInList(filters.categoryKeys, value) }));
  }

  function setPerson(value: string) {
    if (!value) {
      onChange(filters.withUpdates({ personKeys: [] }));
      return;
    }
    onChange(filters.withUpdates({ personKeys: toggleInList(filters.personKeys, value) }));
  }

  function commitAmount(which: "min" | "max", draft: string) {
    const parsed = parseAmountDraft(draft);
    if (which === "min") {
      onChange(filters.withUpdates({ minAmount: parsed }));
    } else {
      onChange(filters.withUpdates({ maxAmount: parsed }));
    }
  }

  const rangeFrom = filters.period.mode === "range" ? filters.period.from ?? "" : "";
  const rangeTo = filters.period.mode === "range" ? filters.period.to ?? "" : "";

  function isoToDate(iso?: string): Date | null {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function dateToIso(date: Date | null): string | undefined {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const currentYear = filters.period.mode === "month" ? filters.period.year : new Date().getFullYear();
  const currentMonth = filters.period.mode === "month" ? filters.period.month : new Date().getMonth() + 1;

  const amountInverted =
    filters.minAmount !== null && filters.maxAmount !== null && filters.minAmount > filters.maxAmount;
  const dateInverted = periodMode === "range" && !!rangeFrom && !!rangeTo && rangeFrom > rangeTo;

  return (
    <div className={filtersBar}>
      <div className={periodToggle} role="group" aria-label="Modo de periodo">
        <button
          type="button"
          className={periodMode === "month" ? btnGhostActive : btnGhost}
          onClick={() => onPeriodModeChange("month")}
          aria-pressed={periodMode === "month"}
        >
          Por mes
        </button>
        <button
          type="button"
          className={periodMode === "range" ? btnGhostActive : btnGhost}
          onClick={() => onPeriodModeChange("range")}
          aria-pressed={periodMode === "range"}
        >
          Por rango
        </button>
      </div>

      {periodMode === "month" ? (
        <div className={filtersRow}>
          <div className="flex flex-wrap items-center gap-2">
            {MONTHS.map((labelText, index) => {
              const month = index + 1;
              const isActive = month === currentMonth;
              return (
                <button
                  key={month}
                  type="button"
                  className={isActive ? btnGhostActive : btnGhost}
                  onClick={() => onMonthChange(month)}
                  aria-pressed={isActive}
                >
                  {labelText}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2 text-xl font-semibold">
            <button type="button" className={btnGhost} onClick={() => onYearChange(-1)} aria-label="Año anterior">
              ◀
            </button>
            <span className="min-w-[5ch] text-center">{currentYear}</span>
            <button type="button" className={btnGhost} onClick={() => onYearChange(1)} aria-label="Año siguiente">
              ▶
            </button>
          </div>
        </div>
      ) : (
        <div className={filtersRow}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className={label} htmlFor="filter-from">Desde</label>
              <DatePicker
                id="filter-from"
                selected={isoToDate(rangeFrom)}
                onChange={(date: Date | null) => onRangeChange(dateToIso(date), rangeTo || undefined)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Desde"
                className={inputInline}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                calendarStartDay={1}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={label} htmlFor="filter-to">Hasta</label>
              <DatePicker
                id="filter-to"
                selected={isoToDate(rangeTo)}
                onChange={(date: Date | null) => onRangeChange(rangeFrom || undefined, dateToIso(date))}
                className={inputInline}
                placeholderText="Hasta"
                dateFormat="yyyy-MM-dd"
                shouldCloseOnSelect
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                calendarStartDay={1}
              />
            </div>
          </div>
          {dateInverted && (
            <p className="m-0 self-end pb-2 text-[0.85rem] text-expense" role="alert">
              El inicio es posterior al fin. Rango no aplicado.
            </p>
          )}
          {!dateInverted && (
            <p className="text-[0.85rem] text-muted m-0 self-end pb-2">
              Sin fechas = todo el historial
            </p>
          )}
        </div>
      )}

      {amountInverted && (
        <p className="mb-3 rounded-lg border border-expense bg-expense/10 p-2 text-[0.85rem] text-expense" role="alert">
          {filters.minAmount !== null && filters.maxAmount !== null && filters.minAmount > filters.maxAmount
            ? "El importe mínimo es mayor que el máximo. El filtro de importes no se aplica hasta corregirlo."
            : ""}
        </p>
      )}

      <div className={filtersRow}>
        <div className={filtersGroup}>
          <label className={filtersLabel} htmlFor="filter-search">Buscar</label>
          <input
            id="filter-search"
            className={input}
            type="search"
            placeholder="Concepto, categoría o persona…"
            value={filters.search}
            onChange={(e) => onChange(filters.withUpdates({ search: e.target.value }))}
          />
        </div>

        <div className={filtersGroup}>
          <label className={filtersLabel} htmlFor="filter-type">Tipo</label>
          <select
            id="filter-type"
            className={inputInline}
            value={selectedType}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
        </div>

        <div className={filtersGroup}>
          <label className={filtersLabel} htmlFor="filter-category">Categoría</label>
          <select
            id="filter-category"
            className={inputInline}
            value=""
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">
              {filters.categoryKeys.length === 0
                ? "Todas"
                : `${filters.categoryKeys.length} seleccionada(s)`}
            </option>
            {activeCategories.map((c) => (
              <option key={c.key} value={c.key}>
                {filters.categoryKeys.includes(c.key) ? "✓ " : ""}
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className={filtersGroup}>
          <label className={filtersLabel} htmlFor="filter-person">Persona</label>
          <select
            id="filter-person"
            className={inputInline}
            value=""
            onChange={(e) => setPerson(e.target.value)}
          >
            <option value="">
              {filters.personKeys.length === 0
                ? "Todas"
                : `${filters.personKeys.length} seleccionada(s)`}
            </option>
            {activePersons.map((p) => (
              <option key={p.key} value={p.key}>
                {filters.personKeys.includes(p.key) ? "✓ " : ""}
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className={filtersGroup}>
          <label className={filtersLabel} htmlFor="filter-min-amount">Importe min</label>
          <input
            id="filter-min-amount"
            className={inputInline}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={minAmountDraft}
            onChange={(e) => {
              const draft = e.target.value;
              setMinAmountDraft(draft);
              if (draft.trim() === "" || Number.isFinite(Number(draft.replace(",", ".")))) {
                commitAmount("min", draft);
              }
            }}
            onBlur={() => {
              setMinAmountDraft(amountToDraft(filters.minAmount));
            }}
          />
        </div>

        <div className={filtersGroup}>
          <label className={filtersLabel} htmlFor="filter-max-amount">Importe max</label>
          <input
            id="filter-max-amount"
            className={inputInline}
            type="text"
            inputMode="decimal"
            placeholder="∞"
            value={maxAmountDraft}
            onChange={(e) => {
              const draft = e.target.value;
              setMaxAmountDraft(draft);
              if (draft.trim() === "" || Number.isFinite(Number(draft.replace(",", ".")))) {
                commitAmount("max", draft);
              }
            }}
            onBlur={() => {
              setMaxAmountDraft(amountToDraft(filters.maxAmount));
            }}
          />
        </div>

        <div className="flex items-end gap-2">
          <button type="button" className={btnSecondary} onClick={onClear} disabled={!filters.hasExtraFilters}>
            Limpiar filtros
          </button>
          <span className="text-[0.9rem] text-muted pb-2" aria-live="polite">
            {resultCount} movimiento{resultCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {(filters.categoryKeys.length > 0 || filters.personKeys.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.categoryKeys.map((key) => {
            const cat = categories.find((c) => c.key === key);
            return (
              <button
                key={`cat-${key}`}
                type="button"
                className={btnGhostActive}
                onClick={() => onChange(filters.withUpdates({ categoryKeys: filters.categoryKeys.filter((k) => k !== key) }))}
              >
                {cat?.label ?? key} ×
              </button>
            );
          })}
          {filters.personKeys.map((key) => {
            const person = persons.find((p) => p.key === key);
            return (
              <button
                key={`person-${key}`}
                type="button"
                className={btnGhostActive}
                onClick={() => onChange(filters.withUpdates({ personKeys: filters.personKeys.filter((k) => k !== key) }))}
              >
                {person?.label ?? key} ×
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
