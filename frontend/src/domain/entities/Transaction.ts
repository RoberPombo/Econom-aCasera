import { Entity } from "./Entity";
import { Amount } from "./Amount";

export type TransactionType = "income" | "expense";

export interface TransactionData {
  id?: number;
  date: string;
  type: TransactionType;
  category: string;
  concept: string;
  amount: number;
  year?: number;
  month?: number;
}

export class Transaction extends Entity {
  readonly date: string;
  readonly type: TransactionType;
  readonly category: string;
  readonly concept: string;
  readonly amount: number;
  readonly year: number;
  readonly month: number;

  private constructor(data: TransactionData & { year: number; month: number }) {
    super(data.id ?? crypto.randomUUID());

    this.date = data.date;
    this.type = data.type;
    this.category = data.category;
    this.concept = data.concept;
    this.amount = data.amount;
    this.year = data.year;
    this.month = data.month;
  }

  static create(data: TransactionData): Transaction {
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      throw new Error("La fecha no es válida");
    }

    Amount.create(data.amount);
    const year = data.year ?? date.getFullYear();
    const month = data.month ?? date.getMonth() + 1;

    return new Transaction({
      ...data,
      year,
      month,
    });
  }

  withUpdates(data: Partial<TransactionData>): Transaction {
    return Transaction.create({
      id: typeof this.id === "number" ? this.id : undefined,
      date: data.date ?? this.date,
      type: data.type ?? this.type,
      category: data.category ?? this.category,
      concept: data.concept ?? this.concept,
      amount: data.amount ?? this.amount,
      year: data.year ?? this.year,
      month: data.month ?? this.month,
    });
  }
}
