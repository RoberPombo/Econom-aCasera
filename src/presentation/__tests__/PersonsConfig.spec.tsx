import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, type Mock, test, vi } from "vitest";
import { Person } from "../../domain/entities";
import { PersonsConfig } from "../components/PersonsConfig";

const ana = Person.create({ id: 1, label: "Ana" });
const bob = Person.create({ id: 2, label: "Bob", active: false });

function renderConfig(
  persons: Person[] = [ana, bob],
  overrides: {
    onAdd?: Mock<(name: string) => void>;
    onUpdate?: Mock<(person: Person) => void>;
    onDelete?: Mock<(id: number) => void>;
  } = {},
) {
  const onAdd = overrides.onAdd ?? vi.fn<(name: string) => void>();
  const onUpdate = overrides.onUpdate ?? vi.fn<(person: Person) => void>();
  const onDelete = overrides.onDelete ?? vi.fn<(id: number) => void>();

  render(
    <PersonsConfig
      persons={persons}
      onAdd={onAdd}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />,
  );

  return { onAdd, onUpdate, onDelete };
}

function addForm() {
  return screen
    .getByRole("heading", { name: "Miembros" })
    .closest("form") as HTMLElement;
}

describe("PersonsConfig", () => {
  test("renders the members with their states", () => {
    renderConfig();

    expect(
      screen.getByRole("heading", { name: "Miembros familiares" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Desactivar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Activar" })).toBeInTheDocument();
  });

  test("adds a member with the typed label", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderConfig();

    await user.type(screen.getByPlaceholderText("Nuevo miembro"), "César");
    await user.click(addForm().querySelector("button") as HTMLElement);

    expect(onAdd).toHaveBeenCalledWith("César");
  });

  test("does not add a member when the label collides with an existing key", async () => {
    const user = userEvent.setup();
    const { onAdd } = renderConfig();

    await user.type(screen.getByPlaceholderText("Nuevo miembro"), "Ana ");

    expect(addForm().querySelector("button")).toBeDisabled();
    expect(screen.getByText(/Ya existe "Ana"/)).toBeInTheDocument();

    fireEvent.submit(addForm());

    expect(onAdd).not.toHaveBeenCalled();
  });

  test("ignores the submit when the label is invalid", () => {
    const { onAdd } = renderConfig();

    fireEvent.submit(addForm());

    expect(onAdd).not.toHaveBeenCalled();
  });

  test("edits a label in place on Enter", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderConfig();

    await user.click(screen.getByRole("button", { name: "Ana" }));
    const input = screen.getByDisplayValue("Ana");
    await user.clear(input);
    await user.type(input, "Anabel{Enter}");

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Anabel" }),
    );
  });

  test("discards the edit when the label is unchanged or empty", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderConfig();

    await user.click(screen.getByRole("button", { name: "Ana" }));
    const input = screen.getByDisplayValue("Ana");
    await user.clear(input);
    await user.type(input, "{Enter}");

    expect(onUpdate).not.toHaveBeenCalled();
  });

  test("exits the edit mode when the input loses focus", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderConfig();

    await user.click(screen.getByRole("button", { name: "Ana" }));
    const input = screen.getByDisplayValue("Ana");
    await user.clear(input);
    await user.type(input, "Ana María");
    fireEvent.blur(input);

    expect(screen.queryByDisplayValue("Ana María")).not.toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  test("discards the draft when re-entering the edit mode", async () => {
    const user = userEvent.setup();
    renderConfig();

    await user.click(screen.getByRole("button", { name: "Ana" }));
    const input = screen.getByDisplayValue("Ana");
    await user.clear(input);
    fireEvent.blur(input);

    await user.click(screen.getByRole("button", { name: "Ana" }));

    expect(screen.getByDisplayValue("Ana")).toBeInTheDocument();
  });

  test("toggles the active state of a member", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderConfig();

    await user.click(screen.getAllByRole("button", { name: "Desactivar" })[0]);

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ id: ana.id, active: false }),
    );
  });

  test("asks for confirmation before deleting a member", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderConfig();

    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);

    expect(screen.getByText('¿Eliminar "Ana"?')).toBeInTheDocument();

    const confirm = screen.getAllByRole("button", { name: "Eliminar" });
    await user.click(confirm[confirm.length - 1]);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test("cancels the delete confirmation", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderConfig();

    await user.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByText('¿Eliminar "Ana"?')).not.toBeInTheDocument();
  });
});
