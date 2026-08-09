import type { TransactionType } from "./Transaction";

export type PeriodMode = "month" | "range";

export type PeriodFilter =
  | { mode: "month"; year: number; month: number }
  | { mode: "range"; from?: string; to?: string };

export interface TransactionFiltersData {
  period: PeriodFilter;
  types?: TransactionType[];
  categoryKeys?: string[];
  personKeys?: string[];
  minAmount?: number | null;
  maxAmount?: number | null;
  search?: string;
}

export class TransactionFilters {
  readonly period: PeriodFilter;
  readonly types: TransactionType[];
  readonly categoryKeys: string[];
  readonly personKeys: string[];
  readonly minAmount: number | null;
  readonly maxAmount: number | null;
  readonly search: string;

  private constructor(data: {
    period: PeriodFilter;
    types: TransactionType[];
    categoryKeys: string[];
    personKeys: string[];
    minAmount: number | null;
    maxAmount: number | null;
    search: string;
  }) {
    this.period = data.period;
    this.types = data.types;
    this.categoryKeys = data.categoryKeys;
    this.personKeys = data.personKeys;
    this.minAmount = data.minAmount;
    this.maxAmount = data.maxAmount;
    this.search = data.search;
  }

  static create(data: TransactionFiltersData): TransactionFilters {
    const types = data.types?.length ? [...data.types] : [];
    const categoryKeys = data.categoryKeys?.length
      ? [...data.categoryKeys]
      : [];
    const personKeys = data.personKeys?.length ? [...data.personKeys] : [];
    const minAmount = data.minAmount ?? null;
    const maxAmount = data.maxAmount ?? null;
    const search = data.search?.trim() ?? "";

    if (data.period.mode === "month") {
      if (data.period.month < 1 || data.period.month > 12) {
        throw new Error("El mes no es válido");
      }
    }

    // Allow temporary inverted ranges while the user is still typing/selecting.
    // Query builder ignores amount/date bounds until they are coherent.
    return new TransactionFilters({
      period:
        data.period.mode === "month"
          ? { mode: "month", year: data.period.year, month: data.period.month }
          : {
              mode: "range",
              from: data.period.from || undefined,
              to: data.period.to || undefined,
            },
      types,
      categoryKeys,
      personKeys,
      minAmount,
      maxAmount,
      search,
    });
  }

  static defaultMonth(year: number, month: number): TransactionFilters {
    return TransactionFilters.create({
      period: { mode: "month", year, month },
    });
  }

  get hasExtraFilters(): boolean {
    return (
      this.types.length > 0 ||
      this.categoryKeys.length > 0 ||
      this.personKeys.length > 0 ||
      this.minAmount !== null ||
      this.maxAmount !== null ||
      this.search.length > 0
    );
  }

  withPeriod(period: PeriodFilter): TransactionFilters {
    return TransactionFilters.create({
      period,
      types: this.types,
      categoryKeys: this.categoryKeys,
      personKeys: this.personKeys,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
      search: this.search,
    });
  }

  withUpdates(data: Partial<TransactionFiltersData>): TransactionFilters {
    return TransactionFilters.create({
      period: data.period ?? this.period,
      types: data.types ?? this.types,
      categoryKeys: data.categoryKeys ?? this.categoryKeys,
      personKeys: data.personKeys ?? this.personKeys,
      minAmount: data.minAmount === undefined ? this.minAmount : data.minAmount,
      maxAmount: data.maxAmount === undefined ? this.maxAmount : data.maxAmount,
      search: data.search === undefined ? this.search : data.search,
    });
  }

  /** Same non-period filters, scoped to a full calendar year (for annual chart in month mode). */
  forYear(year: number): TransactionFilters {
    return TransactionFilters.create({
      period: { mode: "range", from: `${year}-01-01`, to: `${year}-12-31` },
      types: this.types,
      categoryKeys: this.categoryKeys,
      personKeys: this.personKeys,
      minAmount: this.minAmount,
      maxAmount: this.maxAmount,
      search: this.search,
    });
  }

  clearExtra(): TransactionFilters {
    return TransactionFilters.create({ period: this.period });
  }
}
