import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type {
  AnnualSummary,
  CategorySummary,
  MonthlySummary,
} from "../../domain/entities";
import { SummaryBreakdown } from "../components/SummaryBreakdown";

describe("SummaryBreakdown", () => {
  const categories: CategorySummary[] = [
    { category: "Nómina", type: "income", amount: 1500 },
    { category: "Comida", type: "expense", amount: 250.5 },
  ];

  const monthly: MonthlySummary[] = [
    { month: 1, income: 1000, expense: 200, balance: 800 },
    { month: 2, income: 1500, expense: 300, balance: 1200 },
  ];

  const annual: AnnualSummary[] = [
    { year: 2025, income: 2000, expense: 500, balance: 1500 },
    { year: 2026, income: 2500, expense: 800, balance: 1700 },
  ];

  test("renders the category breakdown with amounts", () => {
    render(
      <SummaryBreakdown categories={categories} monthly={[]} annual={[]} />,
    );

    expect(screen.getByText("Nómina")).toBeInTheDocument();
    expect(screen.getByText("Comida")).toBeInTheDocument();
    expect(screen.getByText(/1500,00/)).toBeInTheDocument();
    expect(screen.getByText(/250,50/)).toBeInTheDocument();
  });

  test("renders monthly rows with totals when there are several months", () => {
    render(<SummaryBreakdown categories={[]} monthly={monthly} annual={[]} />);

    expect(screen.getByText("Enero")).toBeInTheDocument();
    expect(screen.getByText("Febrero")).toBeInTheDocument();
    expect(screen.getByText(/1000,00/)).toBeInTheDocument();
    expect(screen.getByText(/1200,00/)).toBeInTheDocument();
  });

  test("renders annual rows with totals when there are several years", () => {
    render(<SummaryBreakdown categories={[]} monthly={[]} annual={annual} />);

    expect(screen.getByText("2025")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
    expect(screen.getByText(/2000,00/)).toBeInTheDocument();
    expect(screen.getByText(/2500,00/)).toBeInTheDocument();
  });

  test("hides monthly and annual blocks when they have a single entry", () => {
    render(
      <SummaryBreakdown
        categories={[]}
        monthly={[{ month: 6, income: 100, expense: 50, balance: 50 }]}
        annual={[{ year: 2026, income: 100, expense: 50, balance: 50 }]}
      />,
    );

    expect(screen.queryByText("Junio")).not.toBeInTheDocument();
    expect(screen.queryByText("2026")).not.toBeInTheDocument();
  });

  test("shows an empty state when there is no data", () => {
    render(<SummaryBreakdown categories={[]} monthly={[]} annual={[]} />);

    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });
});
