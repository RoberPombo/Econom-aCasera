import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { UpdateDialog } from "../components/UpdateDialog";

describe("ConfirmDialog", () => {
  test("renders the message and confirms with the default label", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        message="¿Eliminar el gasto?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Confirmar" }),
    ).toBeInTheDocument();
    expect(screen.getByText("¿Eliminar el gasto?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("uses the custom confirm label", () => {
    render(
      <ConfirmDialog
        message="¿Borrar?"
        onConfirm={() => {}}
        onCancel={() => {}}
        confirmLabel="Borrar definitivamente"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Borrar definitivamente" }),
    ).toBeInTheDocument();
  });
});

describe("UpdateDialog", () => {
  test("renders the versions and triggers the actions", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <UpdateDialog
        update={{
          version: "2.0.0",
          downloadUrl: "https://example.com/app.exe",
          currentVersion: "1.0.0",
          notes: "",
        }}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Nueva versión disponible" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
    expect(screen.getByText("2.0.0")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Actualizar ahora" }));
    await user.click(screen.getByRole("button", { name: "Más tarde" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("shows the release notes only when the user asks for them", async () => {
    const user = userEvent.setup();

    render(
      <UpdateDialog
        update={{
          version: "2.0.0",
          downloadUrl: "",
          currentVersion: "1.0.0",
          notes: `### Bug Fixes

* fix a crash on start ([#191](https://example.com/issues/191)) ([def5678](https://example.com/commit/def5678))`,
        }}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByText("Correcciones")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ver novedades" }));

    expect(screen.getByText("Correcciones")).toBeInTheDocument();
    expect(screen.getByText("fix a crash on start (#191)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ocultar novedades" }));

    expect(screen.queryByText("Correcciones")).not.toBeInTheDocument();
  });

  test("does not offer release notes when the update has none", () => {
    render(
      <UpdateDialog
        update={{
          version: "2.0.0",
          downloadUrl: "",
          currentVersion: "1.0.0",
          notes: "",
        }}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Ver novedades" }),
    ).not.toBeInTheDocument();
  });
});
