import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Modal } from "../components/Modal";
import { ReceiptViewer } from "../components/ReceiptViewer";

describe("Modal", () => {
  test("renders the title and children", () => {
    const onClose = vi.fn();

    render(
      <Modal title="Editar" onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    );

    expect(screen.getByRole("heading", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  test("closes via the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal title="Editar" onClose={onClose}>
        {null}
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("closes with the Escape key", () => {
    const onClose = vi.fn();

    render(
      <Modal title="Editar" onClose={onClose}>
        {null}
      </Modal>,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("closes when the backdrop itself is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal title="Editar" onClose={onClose}>
        {null}
      </Modal>,
    );

    fireEvent.click(container.firstChild as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("does not close when clicking inside the dialog", () => {
    const onClose = vi.fn();

    render(
      <Modal title="Editar" onClose={onClose}>
        <p>Contenido</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText("Contenido"));

    expect(onClose).not.toHaveBeenCalled();
  });

  test("removes the keydown listener on unmount", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <Modal title="Editar" onClose={onClose}>
        {null}
      </Modal>,
    );

    unmount();
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("ReceiptViewer", () => {
  test("shows the receipt image and closes with the button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ReceiptViewer src="data:image/png;base64,AAAA" onClose={onClose} />,
    );

    const dialog = screen.getByRole("dialog", {
      name: "Foto del ticket",
    });
    expect(dialog).toBeInTheDocument();
    expect(dialog.querySelector("img")).toHaveAttribute(
      "src",
      "data:image/png;base64,AAAA",
    );

    await user.click(screen.getByRole("button", { name: "Cerrar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("closes with the Escape key", () => {
    const onClose = vi.fn();

    render(<ReceiptViewer src="x" onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("ignores other keys", () => {
    const onClose = vi.fn();

    render(<ReceiptViewer src="x" onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });

  test("closes when the backdrop itself is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(<ReceiptViewer src="x" onClose={onClose} />);

    fireEvent.click(container.firstChild as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
