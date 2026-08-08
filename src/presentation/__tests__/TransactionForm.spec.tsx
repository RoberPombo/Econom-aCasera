import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, type Mock, test, vi } from "vitest";
import { Category, Person, Transaction } from "../../domain/entities";
import {
  TransactionForm,
  type TransactionFormData,
} from "../components/TransactionForm";

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

function renderForm(
  overrides: {
    onSubmit?: (t: TransactionFormData) => void;
    onCancel?: () => void;
    initialValue?: Transaction;
    existingReceiptUrl?: string | null;
  } = {},
) {
  const onSubmit = (overrides.onSubmit ?? vi.fn(() => {})) as Mock<
    (t: TransactionFormData) => void
  >;
  const onCancel = overrides.onCancel;

  render(
    <TransactionForm
      onSubmit={onSubmit}
      onCancel={onCancel}
      initialValue={overrides.initialValue}
      categories={categories}
      persons={persons}
      year={2026}
      month={8}
      existingReceiptUrl={overrides.existingReceiptUrl ?? null}
    />,
  );

  return { onSubmit, onCancel };
}

beforeEach(() => {
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

describe("TransactionForm", () => {
  test("renders a new expense with the default date and filtered options", () => {
    renderForm();

    expect(screen.getByLabelText("Tipo")).toHaveValue("expense");
    expect(screen.getByLabelText("Fecha")).toHaveValue("2026-08-01");
    expect(
      screen.getByText(
        "Arrastra una imagen, pégala (Ctrl+V) o elige un archivo",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("Comida")).toBeInTheDocument();
    expect(screen.queryByText("Nómina")).not.toBeInTheDocument();
    expect(screen.queryByText("Transporte")).not.toBeInTheDocument();

    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.queryByText("Bob")).not.toBeInTheDocument();
  });

  test("submits the filled form data", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.selectOptions(screen.getByLabelText("Tipo"), "expense");
    await user.selectOptions(screen.getByLabelText("Categoría"), "comida");
    await user.selectOptions(screen.getByLabelText("Persona"), "ana");
    await user.type(screen.getByLabelText("Concepto"), "Mercadona");
    await user.type(screen.getByLabelText("Importe"), "40.25");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const data = onSubmit.mock.calls[0][0];
    expect(data).toMatchObject({
      date: "2026-08-01",
      type: "expense",
      category: "comida",
      concept: "Mercadona",
      person: "ana",
      receipt: null,
      removeReceipt: false,
    });
    expect(data.amount).toBe(40.25);
  });

  test("switching to income filters categories and hides the receipt", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.selectOptions(screen.getByLabelText("Tipo"), "income");
    await user.selectOptions(screen.getByLabelText("Categoría"), "nomina");
    await user.type(screen.getByLabelText("Concepto"), "Nómina agosto");
    await user.type(screen.getByLabelText("Importe"), "1500");

    expect(
      screen.queryByText(
        "Arrastra una imagen, pégala (Ctrl+V) o elige un archivo",
      ),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Añadir" }));

    const data = onSubmit.mock.calls[0][0];
    expect(data.type).toBe("income");
    expect(data.category).toBe("nomina");
    expect(data.receipt).toBeNull();
    expect(data.removeReceipt).toBe(true);
  });

  test("prefills the fields when editing and saves with the new values", async () => {
    const user = userEvent.setup();
    const initialValue = Transaction.create({
      id: 1,
      date: "2026-08-05",
      type: "expense",
      category: "comida",
      concept: "Mercadona",
      amount: 40,
    });
    const { onSubmit } = renderForm({
      initialValue,
      existingReceiptUrl: "data:image/png;base64,AAAA",
    });

    expect(screen.getByLabelText("Fecha")).toHaveValue("2026-08-05");
    expect(screen.getByLabelText("Concepto")).toHaveValue("Mercadona");
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Concepto"));
    await user.type(screen.getByLabelText("Concepto"), "Supermercado");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    const data = onSubmit.mock.calls[0][0];
    expect(data.concept).toBe("Supermercado");
    expect(data.removeReceipt).toBe(false);
  });

  test("removeReceipt is set when the photo is removed", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm({
      existingReceiptUrl: "data:image/png;base64,AAAA",
    });

    expect(screen.getByAltText("Vista previa del ticket")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Quitar foto" }));

    expect(
      screen.queryByAltText("Vista previa del ticket"),
    ).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Categoría"), "comida");
    await user.type(screen.getByLabelText("Concepto"), "Mercadona");
    await user.type(screen.getByLabelText("Importe"), "12");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    const data = onSubmit.mock.calls[0][0];
    expect(data.removeReceipt).toBe(true);
  });

  test("attaches the selected image file to the submission", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();
    const file = new File(["x"], "ticket.png", { type: "image/png" });

    await user.upload(screen.getByLabelText("Ticket"), file);

    await user.selectOptions(screen.getByLabelText("Categoría"), "comida");
    await user.type(screen.getByLabelText("Concepto"), "Ticket");
    await user.type(screen.getByLabelText("Importe"), "12");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    const data = onSubmit.mock.calls[0][0];
    expect(data.receipt).toEqual({
      bytes: new Uint8Array(await file.arrayBuffer()),
      extension: "png",
      previewUrl: "blob:mock-url",
    });
    expect(screen.getByAltText("Vista previa del ticket")).toHaveAttribute(
      "src",
      "blob:mock-url",
    );
  });

  test("rejects an unsupported image format dropped into the zone", () => {
    renderForm();
    const dropzone = screen.getByText(
      "Arrastra una imagen, pégala (Ctrl+V) o elige un archivo",
    ).parentElement as HTMLElement;
    const file = new File(["x"], "ticket.gif", { type: "image/gif" });

    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    expect(screen.getByText(/Formato no soportado/)).toBeInTheDocument();
    expect(
      screen.queryByAltText("Vista previa del ticket"),
    ).not.toBeInTheDocument();
  });

  test("rejects a file over 10 MB", async () => {
    const user = userEvent.setup();
    renderForm();
    const file = new File(["x"], "ticket.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 11 * 1024 * 1024 });

    await user.upload(screen.getByLabelText("Ticket"), file);

    expect(
      screen.getByText(/supera el tamaño máximo de 10 MB/),
    ).toBeInTheDocument();
  });

  test("cancels the form", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    renderForm({ onCancel });

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("clears the amount display when the field is emptied", async () => {
    const user = userEvent.setup();
    const initialValue = Transaction.create({
      id: 1,
      date: "2026-08-05",
      type: "expense",
      category: "comida",
      concept: "Mercadona",
      amount: 40,
    });
    renderForm({ initialValue });

    expect(screen.getByLabelText("Importe")).toHaveValue(40);

    await user.clear(screen.getByLabelText("Importe"));

    expect(screen.getByLabelText("Importe")).toHaveValue(null);
  });
});
