import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { BalanceChart } from "../components/BalanceChart";

describe("BalanceChart", () => {
  test("renders the title and the formatted amounts", () => {
    render(
      <BalanceChart
        title="Balance agosto"
        income={150000}
        expense={40000}
        balance={110000}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Balance agosto" }),
    ).toBeInTheDocument();
    expect(screen.getByText("150.000,00 €")).toBeInTheDocument();
    expect(screen.getByText("-40.000,00 €")).toBeInTheDocument();
    expect(screen.getByText("110.000,00 €")).toBeInTheDocument();
  });

  test("shows the empty state when there is no data", () => {
    render(<BalanceChart title="Balance" income={0} expense={0} balance={0} />);

    expect(screen.getByText("Sin datos")).toBeInTheDocument();
  });

  test("draws the slices when there is data", () => {
    const { container } = render(
      <BalanceChart title="Balance" income={100} expense={50} balance={50} />,
    );

    expect(container.querySelectorAll("circle")).toHaveLength(3);
    expect(screen.queryByText("Sin datos")).not.toBeInTheDocument();
  });
});
