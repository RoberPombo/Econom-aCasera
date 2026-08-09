import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, type Mock, test, vi } from "vitest";
import { Person, Transaction } from "../../domain/entities";
import { normalizeKey } from "../../domain/entities/Key";
import type { ImportCategoryOption } from "../../domain/repositories/ImportRepository";
import { ImportView } from "../components/ImportView";

const persons = [
  Person.create({ id: 1, label: "Ana" }),
  Person.create({ id: 2, label: "Bob", active: false }),
];

type PreviewResult = {
  transactions: Transaction[];
  errors: string[];
  skipped: number;
  categoryOptions?: ImportCategoryOption[];
};

function tx(
  category: string,
  concept: string,
  amount: number,
  date = "2026-08-10",
): Transaction {
  return Transaction.create({
    date,
    type: "expense",
    category: normalizeKey(category),
    concept,
    amount,
  });
}

function makeFile(name: string): File {
  return new File(["data"], name, { type: "application/vnd.ms-excel" });
}

function renderImport(
  overrides: {
    onPreview?: Mock<(source: string, file: File) => Promise<PreviewResult>>;
    onConfirm?: Mock<(transactions: Transaction[]) => Promise<number>>;
    onAddCategories?: Mock<
      (options: ImportCategoryOption[]) => Promise<number>
    >;
  } = {},
) {
  const onPreview =
    overrides.onPreview ??
    vi.fn<(source: string, file: File) => Promise<PreviewResult>>();
  const onConfirm =
    overrides.onConfirm ?? vi.fn<(ts: Transaction[]) => Promise<number>>();
  const onAddCategories =
    overrides.onAddCategories ??
    vi.fn<(options: ImportCategoryOption[]) => Promise<number>>();

  render(
    <ImportView
      persons={persons}
      onPreview={onPreview}
      onConfirm={onConfirm}
      onAddCategories={onAddCategories}
    />,
  );

  return { onPreview, onConfirm, onAddCategories };
}

function selectFile(file: File) {
  fireEvent.change(
    document.querySelector("input[type=file]") as HTMLInputElement,
    { target: { files: [file] } },
  );
}

function mockPreview(
  transactions: Transaction[],
  errors: string[] = [],
  skipped = 0,
  categoryOptions: ImportCategoryOption[] = [],
) {
  return vi
    .fn<(source: string, file: File) => Promise<PreviewResult>>()
    .mockResolvedValue({ transactions, errors, skipped, categoryOptions });
}

describe("ImportView", () => {
  test("shows the available sources and the upcoming ones", () => {
    renderImport();

    expect(screen.getByRole("button", { name: /Excel/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ING/ })).toBeInTheDocument();
    expect(screen.getByText("Revolut (próx.)")).toBeInTheDocument();
    expect(screen.getByText("N26 (próx.)")).toBeInTheDocument();
  });

  test("previews a file and renders the rows for editing", async () => {
    const user = userEvent.setup();
    const { onPreview } = renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)]),
    });
    selectFile(makeFile("movimientos.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(onPreview).toHaveBeenCalledWith(
      "excel",
      expect.objectContaining({ name: "movimientos.xlsx" }),
    );
    expect(screen.getByDisplayValue("Mercadona")).toHaveValue("Mercadona");
    expect(screen.getByDisplayValue("40,50")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar 1 movimientos" }),
    ).toBeEnabled();
  });

  test("shows parser errors and the ING download guide", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([], ["Fila 2: no se pudo parsear"], 1),
    });
    selectFile(makeFile("movimientos.xls"));
    await user.click(screen.getByRole("button", { name: /ING/ }));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(screen.getByText(/no se pudo parsear/)).toBeInTheDocument();
    expect(
      screen.getByText("¿Cómo descargar los movimientos de ING?"),
    ).toBeInTheDocument();
  });

  test("surfaces preview failures as errors", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: vi
        .fn<(source: string, file: File) => Promise<PreviewResult>>()
        .mockRejectedValue(new Error("No se pudo leer el archivo")),
    });
    selectFile(makeFile("broken.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(screen.getByText(/No se pudo leer el archivo/)).toBeInTheDocument();
  });

  test("edits rows and blocks saving while a row is invalid", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderImport({
      onPreview: mockPreview([
        tx("comida", "Mercadona", 40.5),
        tx("nomina", "Cuota", 10, "2026-08-05"),
      ]),
    });
    selectFile(makeFile("rows.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    const concept = screen.getByDisplayValue("Mercadona");
    await user.clear(concept);

    const twoRows = screen.getByRole("button", {
      name: "Guardar 2 movimientos",
    });
    expect(twoRows).toBeDisabled();

    await user.type(concept, "Supermercado");
    expect(twoRows).toBeEnabled();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(screen.getAllByRole("button", { name: "Quitar" })[0]);
    expect(
      screen.getByRole("button", { name: "Guardar 1 movimientos" }),
    ).toBeEnabled();
  });

  test("saves the confirmed rows and reports the inserted count", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)]),
      onConfirm: vi
        .fn<(ts: Transaction[]) => Promise<number>>()
        .mockResolvedValue(1),
    });
    selectFile(makeFile("ok.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));
    await user.click(
      screen.getByRole("button", { name: "Guardar 1 movimientos" }),
    );

    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ concept: "Mercadona", amount: 40.5 }),
    ]);
    expect(screen.getByText(/Guardados 1 movimiento/)).toBeInTheDocument();
  });

  test("reports when all the rows already existed", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([], [], 3),
      onConfirm: vi
        .fn<(ts: Transaction[]) => Promise<number>>()
        .mockResolvedValue(3),
    });
    const file = makeFile("dup.xlsx");
    selectFile(file);
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(
      screen.getByText(/los 3 movimientos del archivo ya existen/),
    ).toBeInTheDocument();
  });

  test("shows the empty preview hint", async () => {
    const user = userEvent.setup();
    renderImport({ onPreview: mockPreview([]) });
    selectFile(makeFile("empty.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(
      screen.getByText(/No se encontraron movimientos en el archivo/),
    ).toBeInTheDocument();
  });

  test("clears the selection with the Cambiar button", async () => {
    const user = userEvent.setup();
    renderImport({ onPreview: mockPreview([tx("comida", "Mercadona", 40.5)]) });
    selectFile(makeFile("clear.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));
    expect(screen.getByDisplayValue("Mercadona")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cambiar" }));

    expect(screen.queryByText("Guardar 1 movimientos")).not.toBeInTheDocument();
    expect(screen.queryByText("Mercadona")).not.toBeInTheDocument();
  });

  test("flags a non-xls file when the ING source is selected", async () => {
    const user = userEvent.setup();
    renderImport();

    await user.click(screen.getByRole("button", { name: /ING/ }));
    selectFile(makeFile("movimientos.txt"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(screen.getByText(/no es un Excel de ING/)).toBeInTheDocument();
    expect(
      screen.getByText("¿Cómo descargar los movimientos de ING?"),
    ).toBeInTheDocument();
  });

  test("reports the skipped duplicates alongside the new rows", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 2),
    });

    selectFile(makeFile("mixed.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(
      screen.getByText(/2 movimientos omitidos porque ya existen/),
    ).toBeInTheDocument();
  });

  test("validates every row cell while editing and blocks the save", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([
        tx("comida", "Mercadona", 40.5, "2026-08-10"),
        tx("nomina", "Cuota", 10, "2026-08-05"),
      ]),
    });
    selectFile(makeFile("invalid.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    const firstRow = screen
      .getByDisplayValue("Mercadona")
      .closest("tr") as HTMLElement;
    const inputs = firstRow.querySelectorAll("input");
    const select = firstRow.querySelector("select") as HTMLSelectElement;

    fireEvent.change(inputs[0], { target: { value: "" } });
    fireEvent.change(select, { target: { value: "weird" } });
    fireEvent.change(inputs[1], { target: { value: "" } });

    const amount = inputs[2] as HTMLInputElement;
    await user.clear(amount);
    await user.type(amount, "abc");
    fireEvent.blur(amount);

    expect(screen.getAllByText(/fecha inválida/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/tipo inválido/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/categoría vacía/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/importe inválido/).length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("abc")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Guardar 2 movimientos" }),
    ).toBeDisabled();
  });

  test("surfaces confirmation failures as errors", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)]),
      onConfirm: vi
        .fn<(ts: Transaction[]) => Promise<number>>()
        .mockRejectedValue(new Error("La base de datos está bloqueada")),
    });
    selectFile(makeFile("err.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));
    await user.click(
      screen.getByRole("button", { name: "Guardar 1 movimientos" }),
    );

    expect(
      await screen.findByText(/La base de datos está bloqueada/),
    ).toBeInTheDocument();
  });

  test("reports when none of the rows could be saved", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)]),
      onConfirm: vi
        .fn<(t: Transaction[]) => Promise<number>>()
        .mockResolvedValue(0),
    });
    selectFile(makeFile("dupe.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));
    await user.click(
      screen.getByRole("button", { name: "Guardar 1 movimientos" }),
    );

    expect((await screen.findByText(/No se guardó nada/)).textContent).toMatch(
      /los 1 movimiento(s)? ya existían/,
    );
  });

  test("reports how many rows were already existed after a partial save", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([
        tx("comida", "Mercadona", 40.5),
        tx("nomina", "Cuota", 10),
      ]),
      onConfirm: vi
        .fn<(t: Transaction[]) => Promise<number>>()
        .mockResolvedValue(1),
    });
    selectFile(makeFile("partial.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));
    await user.click(
      screen.getByRole("button", { name: "Guardar 2 movimientos" }),
    );

    expect(
      (await screen.findByText(/Guardados 1 movimiento/)).textContent,
    ).toMatch(/1 ya existían/);
  });

  test("clears the rows with the Limpiar button", async () => {
    const user = userEvent.setup();
    renderImport({ onPreview: mockPreview([tx("comida", "Mercadona", 40.5)]) });
    selectFile(makeFile("rows.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));
    expect(screen.getByDisplayValue("Mercadona")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpiar" }));

    expect(screen.queryByDisplayValue("Mercadona")).not.toBeInTheDocument();
    expect(screen.queryByText(/Guardar/)).not.toBeInTheDocument();
  });

  test("assigns a person to the row", async () => {
    const user = userEvent.setup();
    renderImport({ onPreview: mockPreview([tx("comida", "Mercadona", 40.5)]) });
    selectFile(makeFile("movimientos.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const personSelect = selects.find((sel) =>
      Array.from(sel.options).some((o) => o.value === "ana"),
    ) as HTMLSelectElement;
    await user.selectOptions(personSelect, "ana");

    expect(personSelect).toHaveValue("ana");
  });

  test("clears the selected file with Cambiar", async () => {
    const user = userEvent.setup();
    const { onPreview } = renderImport();
    selectFile(makeFile("movimientos.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    await user.click(screen.getByRole("button", { name: "Cambiar" }));

    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("movimientos.xlsx")).not.toBeInTheDocument();
  });

  test("does not confirm rows with validation errors", async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)]),
    });
    selectFile(makeFile("movimientos.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    const amount = screen.getByDisplayValue("40,50");
    await user.clear(amount);
    await user.type(amount, "abc");
    await user.click(screen.getByRole("button", { name: /Guardar/ }));

    expect(onConfirm).not.toHaveBeenCalled();
  });

  test("shows the Global category options preselected", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
        { label: "Ingresos por intereses", type: "income" },
        { label: "Alimentación", type: "expense" },
        { label: "Hipoteca / Alquiler / Seguros", type: "expense" },
      ]),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(
      screen.getByText("Categorías de la hoja Global"),
    ).toBeInTheDocument();
    expect(screen.getByText("Ingresos")).toBeInTheDocument();
    expect(screen.getByText("Gastos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nóminas/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: /Alimentación/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("saving the movements does not touch the configuration", async () => {
    const user = userEvent.setup();
    const { onConfirm, onAddCategories } = renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
        { label: "Alimentación", type: "expense" },
      ]),
      onConfirm: vi
        .fn<(ts: Transaction[]) => Promise<number>>()
        .mockResolvedValue(1),
      onAddCategories: vi
        .fn<(options: ImportCategoryOption[]) => Promise<number>>()
        .mockResolvedValue(2),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    await user.click(screen.getByRole("button", { name: /Alimentación/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await user.click(
      screen.getByRole("button", { name: "Guardar 1 movimientos" }),
    );

    expect(onConfirm).toHaveBeenCalledWith([
      expect.objectContaining({ concept: "Mercadona" }),
    ]);
    expect(onAddCategories).not.toHaveBeenCalled();
  });

  test("adds the selected categories with its own button, separate from the movements", async () => {
    const user = userEvent.setup();
    const { onAddCategories, onConfirm } = renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
        { label: "Alimentación", type: "expense" },
      ]),
      onAddCategories: vi
        .fn<(options: ImportCategoryOption[]) => Promise<number>>()
        .mockResolvedValue(2),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    await user.click(
      screen.getByRole("button", { name: "Añadir a la configuración" }),
    );

    expect(onAddCategories).toHaveBeenCalledTimes(1);
    expect(onAddCategories).toHaveBeenCalledWith([
      { label: "Nóminas", type: "income" },
      { label: "Alimentación", type: "expense" },
    ]);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(
      screen.getByText("Añadidas 2 categorías a la configuración"),
    ).toBeInTheDocument();
  });

  test("keeps the movements hidden until the configuration step is resolved", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
        { label: "Alimentación", type: "expense" },
      ]),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(
      screen.getByRole("button", { name: "Añadir a la configuración" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Guardar 1 movimientos" }),
    ).not.toBeInTheDocument();
  });

  test("shows the movements table after the categories are added", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
      ]),
      onAddCategories: vi
        .fn<(options: ImportCategoryOption[]) => Promise<number>>()
        .mockResolvedValue(1),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    await user.click(
      screen.getByRole("button", { name: "Añadir a la configuración" }),
    );

    expect(
      screen.getByRole("button", { name: "Guardar 1 movimientos" }),
    ).toBeInTheDocument();
  });

  test("continues without adding categories when none are chosen", async () => {
    const user = userEvent.setup();
    const { onAddCategories } = renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
      ]),
      onAddCategories: vi
        .fn<(options: ImportCategoryOption[]) => Promise<number>>()
        .mockResolvedValue(1),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(onAddCategories).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Guardar 1 movimientos" }),
    ).toBeInTheDocument();
  });

  test("hides the category box after the step is resolved and shows a summary", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
      ]),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.queryByRole("button", { name: "Añadir a la configuración" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Categorías de configuración sin modificar."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Revisar categorías" }),
    ).toBeInTheDocument();
  });

  test("summarizes the added categories after the step is resolved", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
      ]),
      onAddCategories: vi
        .fn<(options: ImportCategoryOption[]) => Promise<number>>()
        .mockResolvedValue(1),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    await user.click(
      screen.getByRole("button", { name: "Añadir a la configuración" }),
    );

    expect(
      screen.queryByRole("button", { name: "Añadir a la configuración" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Añadidas 1 categorías a la configuración"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Revisar categorías" }),
    ).toBeInTheDocument();
  });

  test("selects or clears all Global categories with the quick buttons", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
        { label: "Alimentación", type: "expense" },
      ]),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    await user.click(screen.getByRole("button", { name: "Ninguna" }));
    expect(screen.getByRole("button", { name: /Nóminas/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByRole("button", { name: /Alimentación/ }),
    ).not.toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Todas" }));
    expect(screen.getByRole("button", { name: /Nóminas/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: /Alimentación/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("clears the selection with the Limpiar button", async () => {
    const user = userEvent.setup();
    renderImport({
      onPreview: mockPreview([tx("comida", "Mercadona", 40.5)], [], 0, [
        { label: "Nóminas", type: "income" },
      ]),
    });
    selectFile(makeFile("economia.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Limpiar" }));

    expect(
      screen.queryByRole("button", { name: "Añadir a la configuración" }),
    ).not.toBeInTheDocument();
  });

  test("reports duplicates when the preview has no new rows", async () => {
    const user = userEvent.setup();
    renderImport({ onPreview: mockPreview([], [], 2) });
    selectFile(makeFile("movimientos.xlsx"));
    await user.click(screen.getByRole("button", { name: "Previsualizar" }));

    expect(
      screen.getByText(
        /No se guardará nada: los 2 movimientos del archivo ya existen/,
      ),
    ).toBeInTheDocument();
  });
});
