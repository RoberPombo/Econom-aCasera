import { Amount } from "./Amount";
import { Entity } from "./Entity";

export type TransactionType = "income" | "expense" | "savings";

export interface TransactionData {
  id?: number;
  date: string;
  type: TransactionType;
  category: string;
  concept: string;
  amount: number;
  year?: number;
  month?: number;
  person?: string;
  receiptPath?: string | null;
}

export class Transaction extends Entity {
  readonly date: string;
  readonly type: TransactionType;
  readonly category: string;
  readonly concept: string;
  readonly amount: number;
  readonly year: number;
  readonly month: number;
  readonly person: string;
  readonly receiptPath: string | null;

  private constructor(
    data: TransactionData & {
      year: number;
      month: number;
      receiptPath: string | null;
    },
  ) {
    super(data.id ?? crypto.randomUUID());

    this.date = data.date;
    this.type = data.type;
    this.category = data.category;
    this.concept = data.concept;
    this.amount = data.amount;
    this.year = data.year;
    this.month = data.month;
    this.person = data.person ?? "";
    this.receiptPath = data.type === "expense" ? data.receiptPath : null;
  }

  static create(data: TransactionData): Transaction {
    const date = new Date(data.date);
    if (Number.isNaN(date.getTime())) {
      throw new Error("La fecha no es válida");
    }

    Amount.create(data.amount);
    const isoDateParts = /^(\d{4})-(\d{2})-\d{2}$/.exec(data.date);
    const year = data.year ?? Number(isoDateParts?.[1] ?? date.getFullYear());
    const month =
      data.month ?? Number(isoDateParts?.[2] ?? date.getMonth() + 1);
    const receiptPath = data.receiptPath?.trim() || null;

    if (data.type !== "expense" && receiptPath) {
      throw new Error("Solo los gastos pueden tener foto de ticket");
    }

    return new Transaction({
      ...data,
      year,
      month,
      receiptPath,
    });
  }

  withUpdates(data: Partial<TransactionData>): Transaction {
    const type = data.type ?? this.type;
    const date = data.date ?? this.date;
    const dateChanged = date !== this.date;
    const receiptPath =
      type === "expense"
        ? data.receiptPath === undefined
          ? this.receiptPath
          : data.receiptPath
        : null;

    return Transaction.create({
      id: data.id ?? (typeof this.id === "number" ? this.id : undefined),
      date,
      type,
      category: data.category ?? this.category,
      concept: data.concept ?? this.concept,
      amount: data.amount ?? this.amount,
      year: data.year ?? (dateChanged ? undefined : this.year),
      month: data.month ?? (dateChanged ? undefined : this.month),
      person: data.person ?? this.person,
      receiptPath,
    });
  }

  get hasReceipt(): boolean {
    return Boolean(this.receiptPath);
  }
}
