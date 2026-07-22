import type { TransactionRepository } from "../repositories/TransactionRepository";

export class GetSummaryUseCase {
  constructor(private readonly repository: TransactionRepository) {}

  async execute(year: number, month?: number) {
    const [summary, categories, monthly, annual] = await Promise.all([
      this.repository.getSummary(year, month),
      this.repository.getCategories(year, month),
      this.repository.getMonthlySummary(year),
      this.repository.getAnnualSummary(),
    ]);

    return { summary, categories, monthly, annual };
  }
}
