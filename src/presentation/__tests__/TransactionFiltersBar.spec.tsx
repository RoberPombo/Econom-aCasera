import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, type Mock, test, vi } from "vitest";
import {
  Category,
  type PeriodMode,
  Person,
  TransactionFilters,
} from "../../domain/entities";
import { TransactionFiltersBar } from "../components/TransactionFiltersBar";

const categories = [
  Category.create({ id: 1, label: "Comida", type: "expense" }),
  Category.create({ id: 2, label: "Nómina", type: "income" }),
  Category.create({
    id: 3,
    label: "Transporte",
    type: "expense",
    active: false,
  }),
];
const persons = [
  Person.create({ id: 1, label: "Ana" }),
  Person.create({ id: 2, label: "Bob", active: false }),
];

interface HandlerMocks {
  onChange: Mock<(f: TransactionFilters) => void>;
  onClear: Mock<() => void>;
  onPeriodModeChange: Mock<(mode: PeriodMode) => void>;
  onMonthChange: Mock<(month: number) => void>;
  onYearChange: Mock<(delta: number) => void>;
  onRangeChange: Mock<(from?: string, to?: string) => void>;
}

interface Handlers extends Partial<HandlerMocks> {
  resultCount?: number;
}

function Harness({
  initial,
  handlers,
}: {
  initial: TransactionFilters;
  handlers: Handlers;
}) {
  const [filters, setFilters] = useState(initial);
  const onChange =
    handlers.onChange ?? vi.fn<(f: TransactionFilters) => void>();

  return (
    <TransactionFiltersBar
      filters={filters}
      categories={categories}
      persons={persons}
      resultCount={handlers.resultCount ?? 3}
      onChange={(f) => {
        onChange(f);
        setFilters(f);
      }}
      onClear={handlers.onClear ?? (() => {})}
      onPeriodModeChange={handlers.onPeriodModeChange ?? (() => {})}
      onMonthChange={handlers.onMonthChange ?? (() => {})}
      onYearChange={handlers.onYearChange ?? (() => {})}
      onRangeChange={handlers.onRangeChange ?? (() => {})}
    />
  );
}

function renderBar(
  filters = TransactionFilters.defaultMonth(2026, 8),
  handlers: Handlers = {},
) {
  const h: HandlerMocks & { resultCount?: number } = {
    onChange: vi.fn<(f: TransactionFilters) => void>(),
    onClear: vi.fn<() => void>(),
    onPeriodModeChange: vi.fn<(mode: PeriodMode) => void>(),
    onMonthChange: vi.fn<(month: number) => void>(),
    onYearChange: vi.fn<(delta: number) => void>(),
    onRangeChange: vi.fn<(from?: string, to?: string) => void>(),
    ...handlers,
  };
  render(<Harness initial={filters} handlers={h} />);
  return h;
}

describe("TransactionFiltersBar", () => {
  test("renders the month grid with the current month pressed", () => {
    renderBar();

    expect(screen.getByRole("button", { name: "Ago" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Ene" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  test("navigates months and years", async () => {
    const user = userEvent.setup();
    const { onMonthChange, onYearChange } = renderBar();

    await user.click(screen.getByRole("button", { name: "Sep" }));
    await user.click(screen.getByRole("button", { name: "Año anterior" }));
    await user.click(screen.getByRole("button", { name: "Año siguiente" }));

    expect(onMonthChange).toHaveBeenCalledWith(9);
    expect(onYearChange.mock.calls).toEqual([[-1], [1]]);
  });

  test("switches the period mode with the toggle", async () => {
    const user = userEvent.setup();
    const { onPeriodModeChange } = renderBar();

    await user.click(screen.getByRole("button", { name: "Por rango" }));
    await user.click(screen.getByRole("button", { name: "Por mes" }));

    expect(onPeriodModeChange.mock.calls).toEqual([["range"], ["month"]]);
  });

  test("renders the range inputs with the hint text", () => {
    renderBar(TransactionFilters.create({ period: { mode: "range" } }));

    expect(screen.getByLabelText("Desde")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasta")).toBeInTheDocument();
    expect(
      screen.getByText("Sin fechas = todo el historial"),
    ).toBeInTheDocument();
  });

  test("commits a range date through the Desde picker", () => {
    const { onRangeChange } = renderBar(
      TransactionFilters.create({ period: { mode: "range" } }),
    );
    const from = screen.getByLabelText("Desde");

    fireEvent.change(from, { target: { value: "2026-08-10" } });
    fireEvent.keyDown(from, { key: "Enter", code: "Enter", keyCode: 13 });

    expect(onRangeChange).toHaveBeenCalledWith("2026-08-10", undefined);
  });

  test("warns when the range start is after the end", () => {
    renderBar(
      TransactionFilters.create({
        period: { mode: "range", from: "2026-09-01", to: "2026-08-01" },
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "El inicio es posterior al fin",
    );
  });

  test("typing in the search box updates the filters", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();

    await user.type(screen.getByLabelText("Buscar"), "merc");

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: "merc" }),
    );
  });

  test("restricts the type select to one value", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();

    await user.selectOptions(screen.getByLabelText("Tipo"), "income");

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ types: ["income"] }),
    );
  });

  test("toggles categories from the multiselect", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();

    await user.selectOptions(screen.getByLabelText("Categoría"), "comida");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoryKeys: ["comida"] }),
    );

    await user.selectOptions(screen.getByLabelText("Categoría"), "comida");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoryKeys: [] }),
    );
  });

  test("commits amount filters as numbers", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();

    await user.type(screen.getByLabelText("Importe min"), "10,5");
    await user.type(screen.getByLabelText("Importe max"), "100");

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ maxAmount: 100 }),
    );
    expect(onChange.mock.calls.some(([f]) => f.minAmount === 10.5)).toBe(true);
  });

  test("discards an invalid amount draft and restores it on blur", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();

    await user.type(screen.getByLabelText("Importe min"), "abc");

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(screen.getByLabelText("Importe min"));
    expect(screen.getByLabelText("Importe min")).toHaveValue("");
  });

  test("shows an alert when the amounts are inverted", () => {
    renderBar(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        minAmount: 100,
        maxAmount: 50,
      }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "El importe mínimo es mayor que el máximo",
    );
  });

  test("clears all filters with the reset button", async () => {
    const user = userEvent.setup();
    const { onClear } = renderBar(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        search: "merc",
      }),
    );

    const button = screen.getByRole("button", { name: "Limpiar filtros" });
    expect(button).toBeEnabled();

    await user.click(button);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test("disables the clear button without extra filters", () => {
    renderBar();

    expect(
      screen.getByRole("button", { name: "Limpiar filtros" }),
    ).toBeDisabled();
  });

  test("shows the result count with pluralization", () => {
    renderBar(TransactionFilters.defaultMonth(2026, 8), { resultCount: 1 });

    expect(screen.getByText("1 movimiento")).toBeInTheDocument();
  });

  test("removes a selected filter chip", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        categoryKeys: ["comida"],
        personKeys: ["ana"],
      }),
    );

    await user.click(screen.getByRole("button", { name: /Comida ×/ }));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoryKeys: [] }),
    );
  });

  test("removes a selected person chip and labels the counter", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        personKeys: ["ana"],
      }),
    );

    await user.click(screen.getByRole("button", { name: /Ana ×/ }));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ personKeys: [] }),
    );
  });

  test("clears the type filter from the select", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        types: ["income"],
      }),
    );

    await user.selectOptions(screen.getByLabelText("Tipo"), "");

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ types: [] }),
    );
  });

  test("clears the selected categories from the select", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();

    await user.selectOptions(screen.getByLabelText("Categoría"), "comida");
    expect(
      screen.getByRole("option", { name: "1 seleccionada(s)" }),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Categoría"), "");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoryKeys: [] }),
    );
  });

  test("toggles persons from the multiselect and clears them", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();

    await user.selectOptions(screen.getByLabelText("Persona"), "ana");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ personKeys: ["ana"] }),
    );

    await user.selectOptions(screen.getByLabelText("Persona"), "ana");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ personKeys: [] }),
    );
  });

  test("shows the person counter label with selected persons", () => {
    renderBar(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        personKeys: ["ana", "bob"],
      }),
    );

    expect(
      screen.getByRole("option", { name: "2 seleccionada(s)" }),
    ).toBeInTheDocument();
  });

  test("clearing an amount filter resets it to null", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar();

    await user.type(screen.getByLabelText("Importe min"), "10");
    await user.clear(screen.getByLabelText("Importe min"));

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ minAmount: null }),
    );
  });

  test("restores the max amount draft to the committed value on blur", async () => {
    const user = userEvent.setup();
    renderBar();

    const max = screen.getByLabelText("Importe max");
    await user.type(max, "12x");

    expect(max).toHaveValue("12x");

    fireEvent.blur(max);

    expect(screen.getByLabelText("Importe max")).toHaveValue("12");
  });

  test("clears the Desde date and commits the Hasta date", () => {
    const { onRangeChange } = renderBar(
      TransactionFilters.create({
        period: { mode: "range", from: "2026-08-01" },
      }),
    );

    const from = screen.getByLabelText("Desde");
    fireEvent.change(from, { target: { value: "" } });
    fireEvent.keyDown(from, { key: "Enter", code: "Enter", keyCode: 13 });

    expect(onRangeChange).toHaveBeenCalledWith(undefined, undefined);

    const to = screen.getByLabelText("Hasta");
    fireEvent.change(to, { target: { value: "2026-08-31" } });
    fireEvent.keyDown(to, { key: "Enter", code: "Enter", keyCode: 13 });

    expect(onRangeChange).toHaveBeenCalledWith("2026-08-01", "2026-08-31");
  });

  test("shows the person counter label with selected persons", () => {
    renderBar(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        personKeys: ["ana"],
      }),
    );

    expect(
      screen.getByRole("option", { name: "1 seleccionada(s)" }),
    ).toBeInTheDocument();
  });

  test("clears the persons through the select", async () => {
    const user = userEvent.setup();
    const { onChange } = renderBar(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        personKeys: ["ana"],
      }),
    );

    await user.selectOptions(screen.getByLabelText("Persona"), "");

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ personKeys: [] }),
    );
  });

  test("warns when the minimum exceeds the maximum", async () => {
    const user = userEvent.setup();
    renderBar();

    await user.type(screen.getByLabelText("Importe min"), "99");
    await user.type(screen.getByLabelText("Importe max"), "9");

    expect(screen.getByRole("alert")).toHaveTextContent(
      /mínimo es mayor que el máximo/,
    );
  });

  test("renders chips with the raw key when the filter item is unknown", () => {
    const { onChange } = renderBar(
      TransactionFilters.create({
        period: { mode: "month", year: 2026, month: 8 },
        categoryKeys: ["ghost-cat"],
        personKeys: ["ghost-person"],
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: /ghost-cat/ }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ categoryKeys: [] }),
    );

    fireEvent.click(screen.getByRole("button", { name: /ghost-person/ }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ personKeys: [] }),
    );
  });
});
