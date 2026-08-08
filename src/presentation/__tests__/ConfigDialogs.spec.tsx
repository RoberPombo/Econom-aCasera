import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Category, Transaction } from "../../domain/entities";
import { CategoriesConfig } from "../components/CategoriesConfig";
import { ConflictDialog } from "../components/ConflictDialog";
import { SimilarTransactionDialog } from "../components/SimilarTransactionDialog";

describe("SimilarTransactionDialog", () => {
  const match = Transaction.create({
    id: 1,
    date: "2026-08-05",
    type: "expense",
    category: "comida",
    concept: "Mercadona",
    amount: 40,
  });

  test("lists the matches and updates the selected one", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    render(
      <SimilarTransactionDialog
        matches={[match]}
        onUpdate={onUpdate}
        onAddNew={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Movimiento similar encontrado" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mercadona")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Actualizar" }));

    expect(onUpdate).toHaveBeenCalledWith(match);
  });

  test("adds as new and cancels", async () => {
    const user = userEvent.setup();
    const onAddNew = vi.fn();
    const onCancel = vi.fn();

    render(
      <SimilarTransactionDialog
        matches={[match]}
        onUpdate={vi.fn()}
        onAddNew={onAddNew}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Añadir como nuevo" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onAddNew).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("ConflictDialog", () => {
  test("reloads the remote data", async () => {
    const user = userEvent.setup();
    const onReload = vi.fn().mockResolvedValue(undefined);

    render(
      <ConflictDialog
        onReload={onReload}
        onOverwrite={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Conflicto detectado" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Recargar datos remotos" }),
    );

    expect(onReload).toHaveBeenCalledTimes(1);
  });

  test("asks for confirmation before overwriting with local data", async () => {
    const user = userEvent.setup();
    const onOverwrite = vi.fn().mockResolvedValue(undefined);

    render(
      <ConflictDialog
        onReload={vi.fn()}
        onOverwrite={onOverwrite}
        onCancel={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Usar mis datos locales" }),
    );

    expect(
      screen.getByRole("heading", { name: "Confirmar" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Sí, usar mis datos locales" }),
    );

    expect(onOverwrite).toHaveBeenCalledTimes(1);
  });

  test("cancels the overwrite confirm and the dialog", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConflictDialog
        onReload={vi.fn()}
        onOverwrite={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Usar mis datos locales" }),
    );
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(
      screen.getByRole("heading", { name: "Conflicto detectado" }),
    ).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Cancelar" })[0]);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("CategoriesConfig", () => {
  const comida = Category.create({
    id: 1,
    label: "Comida",
    type: "expense",
  });
  const nomina = Category.create({ id: 2, label: "Nómina", type: "income" });

  function renderConfig(
    onAdd = vi.fn(),
    onUpdate = vi.fn(),
    onDelete = vi.fn(),
  ) {
    const utils = render(
      <CategoriesConfig
        categories={[comida, nomina]}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />,
    );
    return { onAdd, onUpdate, onDelete, ...utils };
  }

  test("renders both sections with the categories", () => {
    renderConfig();

    expect(screen.getByText("Categorías")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Gastos" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Ingresos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Comida")).toBeInTheDocument();
    expect(screen.getByText("Nómina")).toBeInTheDocument();
  });

  test("adds a category with the typed label", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderConfig();

    const gastos = screen
      .getByRole("heading", { name: "Gastos" })
      .closest("form") as HTMLElement;
    await user.type(
      within(gastos).getByPlaceholderText("Nueva gasto"),
      "Transporte",
    );
    await user.click(
      within(gastos).getByRole("button", { name: "Añadir gastos" }),
    );

    expect(onAdd).toHaveBeenCalledWith("Transporte", "expense");
  });

  test("does not add a duplicate in the same type", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderConfig();

    const gastos = screen
      .getByRole("heading", { name: "Gastos" })
      .closest("form") as HTMLElement;
    await user.type(
      within(gastos).getByPlaceholderText("Nueva gasto"),
      "Comida",
    );

    expect(within(gastos).getByRole("button")).toBeDisabled();
    expect(screen.getByText(/Ya existe "Comida"/)).toBeInTheDocument();

    await user.click(within(gastos).getByRole("button"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  test("edits a label in place", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderConfig();

    await user.click(screen.getByRole("button", { name: "Comida" }));
    const input = screen.getByDisplayValue("Comida");
    await user.clear(input);
    await user.type(input, "Supermercado{Enter}");

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Supermercado" }),
    );
  });

  test("toggles a category active state", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderConfig();

    await user.click(screen.getAllByRole("button", { name: "Desactivar" })[0]);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: comida.id, active: false }),
    );
  });

  test("asks for confirmation before deleting", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderConfig();

    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(screen.getByText('¿Eliminar "Comida"?')).toBeInTheDocument();

    const dialogButtons = screen.getAllByRole("button", { name: "Eliminar" });
    await user.click(dialogButtons[dialogButtons.length - 1]);

    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
