import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, type Mock, test, vi } from "vitest";
import { Person, Transaction } from "../../domain/entities";
import { normalizeKey } from "../../domain/entities/Key";
import { ImportView } from "../components/ImportView";

const persons = [
  Person.create({ id: 1, label: "Ana" }),
  Person.create({ id: 2, label: "Bob", active: false }),
];

type PreviewResult = {
  transactions: Transaction[];
  errors: string[];
  skipped: number;
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
  } = {},
) {
  const onPreview =
    overrides.onPreview ??
    vi.fn<(source: string, file: File) => Promise<PreviewResult>>();
  const onConfirm =
    overrides.onConfirm ?? vi.fn<(ts: Transaction[]) => Promise<number>>();

  render(
    <ImportView
      persons={persons}
      onPreview={onPreview}
      onConfirm={onConfirm}
    />,
  );

  return { onPreview, onConfirm };
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
) {
  return vi
    .fn<(source: string, file: File) => Promise<PreviewResult>>()
    .mockResolvedValue({ transactions, errors, skipped });
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
});
