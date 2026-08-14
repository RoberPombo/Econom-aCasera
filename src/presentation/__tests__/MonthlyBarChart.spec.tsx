import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { MonthlyBarChart } from "../components/MonthlyBarChart";

describe("MonthlyBarChart", () => {
  test("renders the legend, the month labels and the totals column", () => {
    render(
      <MonthlyBarChart
        months={[{ month: 8, income: 1500, expense: 400, balance: 1100 }]}
      />,
    );

    expect(
      screen.getByRole("img", {
        name: "Gráfica mensual de ingresos, gastos y ahorro",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ingresos")).toBeInTheDocument();
    expect(screen.getByText("Gastos")).toBeInTheDocument();
    expect(screen.getByText("Ahorro")).toBeInTheDocument();
    expect(screen.getByText("ENE")).toBeInTheDocument();
    expect(screen.getByText("DIC")).toBeInTheDocument();
    expect(screen.getByText("TOT")).toBeInTheDocument();
  });

  test("draws a bar per series for months with data and for the totals", () => {
    const { container } = render(
      <MonthlyBarChart
        months={[{ month: 8, income: 1500, expense: 400, balance: 1100 }]}
      />,
    );

    expect(container.querySelectorAll("rect")).toHaveLength(6);
  });

  test("shows the empty state when there is no data", () => {
    render(<MonthlyBarChart months={[]} />);

    expect(screen.getByText("Sin datos")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
