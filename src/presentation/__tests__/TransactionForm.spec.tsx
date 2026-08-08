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

  const utils = render(
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

  return { onSubmit, onCancel, ...utils };
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

  test("updates the date field", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    const date = screen.getByLabelText("Fecha");
    await user.clear(date);
    await user.type(date, "2026-08-15");

    await user.selectOptions(screen.getByLabelText("Categoría"), "comida");
    await user.type(screen.getByLabelText("Concepto"), "Cena");
    await user.type(screen.getByLabelText("Importe"), "20");
    await user.click(screen.getByRole("button", { name: "Añadir" }));

    const data = onSubmit.mock.calls[0][0];
    expect(data.date).toBe("2026-08-15");
  });

  test("infers the receipt extension from the file name and type", async () => {
    const cases: { file: File; extension: string }[] = [
      {
        file: new File(["x"], "ticket.jpeg", { type: "image/jpeg" }),
        extension: "jpg",
      },
      {
        file: new File(["x"], "ticket.jpg", { type: "image/jpeg" }),
        extension: "jpg",
      },
      {
        file: new File(["x"], "ticket.raw", { type: "image/png" }),
        extension: "png",
      },
      {
        file: new File(["x"], "ticket.raw", { type: "image/webp" }),
        extension: "webp",
      },
      {
        file: new File(["x"], "ticket", { type: "image/jpeg" }),
        extension: "jpg",
      },
    ];

    for (const { file, extension } of cases) {
      const { onSubmit, unmount } = renderForm();
      const user = userEvent.setup();
      await user.upload(screen.getByLabelText("Ticket"), file);

      await user.selectOptions(screen.getByLabelText("Categoría"), "comida");
      await user.type(screen.getByLabelText("Concepto"), "A");
      await user.type(screen.getByLabelText("Importe"), "1");
      await user.click(screen.getByRole("button", { name: "Añadir" }));

      const data = onSubmit.mock.calls[onSubmit.mock.calls.length - 1]?.[0];
      expect(data?.receipt?.extension).toBe(extension);
      unmount();
    }
  });

  test("revokes the previous preview when a new file is attached", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.upload(
      screen.getByLabelText("Ticket"),
      new File(["a"], "a.png", { type: "image/png" }),
    );
    await user.upload(
      screen.getByLabelText("Ticket"),
      new File(["y"], "b.png", { type: "image/png" }),
    );

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  test("revokes the preview when the photo is removed after an upload", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.upload(
      screen.getByLabelText("Ticket"),
      new File(["a"], "a.png", { type: "image/png" }),
    );
    await user.click(screen.getByRole("button", { name: "Quitar foto" }));

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  test("attaches an image pasted from the clipboard", async () => {
    renderForm();
    const form = screen
      .getByRole("button", { name: "Añadir" })
      .closest("form") as HTMLElement;
    const file = new File(["p"], "paste.png", { type: "image/png" });

    fireEvent.paste(form, {
      clipboardData: {
        items: [
          { type: "text/plain", getAsFile: () => null },
          { type: "image/png", getAsFile: () => file },
        ],
      },
    });

    expect(
      await screen.findByAltText("Vista previa del ticket"),
    ).toHaveAttribute("src", "blob:mock-url");
  });

  test("ignores pasted content without an image", () => {
    renderForm();
    const form = screen
      .getByRole("button", { name: "Añadir" })
      .closest("form") as HTMLElement;

    fireEvent.paste(form, {
      clipboardData: { items: [{ type: "text/plain", getAsFile: () => null }] },
    });

    expect(
      screen.queryByAltText("Vista previa del ticket"),
    ).not.toBeInTheDocument();
  });

  test("ignores pasted content when the form is an income", () => {
    renderForm();
    const form = screen
      .getByRole("button", { name: "Añadir" })
      .closest("form") as HTMLElement;

    fireEvent.change(screen.getByLabelText("Tipo"), {
      target: { value: "income" },
    });
    fireEvent.paste(form, {
      clipboardData: {
        items: [
          {
            type: "image/png",
            getAsFile: () => new File(["x"], "p.png", { type: "image/png" }),
          },
        ],
      },
    });

    expect(
      screen.queryByAltText("Vista previa del ticket"),
    ).not.toBeInTheDocument();
  });

  test("highlights the dropzone while dragging over it", () => {
    renderForm();
    const dropzone = screen.getByText(
      "Arrastra una imagen, pégala (Ctrl+V) o elige un archivo",
    ).parentElement as HTMLElement;

    fireEvent.dragOver(dropzone);
    fireEvent.dragLeave(dropzone);

    expect(dropzone).not.toHaveClass("border-primary");
  });

  test("opens the file picker from the choose button", async () => {
    const user = userEvent.setup();
    renderForm();
    const input = screen.getByLabelText("Ticket") as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click").mockImplementation(() => {});

    await user.click(screen.getByRole("button", { name: /Elegir archivo/ }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  test("does nothing when the file input is cleared", () => {
    renderForm();
    const input = screen.getByLabelText("Ticket");

    fireEvent.change(input, { target: { files: [] } });

    expect(
      screen.queryByAltText("Vista previa del ticket"),
    ).not.toBeInTheDocument();
  });

  test("ignores a paste without clipboard items", () => {
    renderForm();
    const form = screen
      .getByRole("button", { name: "Añadir" })
      .closest("form") as HTMLElement;

    fireEvent.paste(form, { clipboardData: undefined });

    expect(
      screen.queryByAltText("Vista previa del ticket"),
    ).not.toBeInTheDocument();
  });

  test("ignores pasted image items without a file", () => {
    renderForm();
    const form = screen
      .getByRole("button", { name: "Añadir" })
      .closest("form") as HTMLElement;

    fireEvent.paste(form, {
      clipboardData: {
        items: [{ type: "image/png", getAsFile: () => null }],
      } as unknown as DataTransfer,
    });

    expect(
      screen.queryByAltText("Vista previa del ticket"),
    ).not.toBeInTheDocument();
  });

  test("ignores a drop without files", () => {
    renderForm();
    const zone = screen.getByText(
      "Arrastra una imagen, pégala (Ctrl+V) o elige un archivo",
    ).parentElement as HTMLElement;

    fireEvent.drop(zone, { dataTransfer: { files: [] } });

    expect(
      screen.queryByAltText("Vista previa del ticket"),
    ).not.toBeInTheDocument();
  });
});
