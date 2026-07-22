export interface SummaryData {
  income: number;
  expense: number;
}

export class Summary {
  readonly income: number;
  readonly expense: number;
  readonly balance: number;

  constructor(data: SummaryData) {
    this.income = Math.round(data.income * 100) / 100;
    this.expense = Math.round(data.expense * 100) / 100;
    this.balance = Math.round((this.income - this.expense) * 100) / 100;
  }
}
