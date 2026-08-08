import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import {
  Category,
  Person,
  Settings,
  Transaction,
  TransactionFilters,
} from "../../domain/entities";
import { FakeCompositionRoot } from "../../tests/fakes/compositionRoot";
import App from "../App";
import { AppProvider } from "../context/AppProvider";

const augustSettings = new Settings({
  currentYear: 2026,
  currentMonth: 8,
  viewMode: "monthly",
  theme: "light",
});

function expense(
  id: number,
  date: string,
  category: string,
  amount: number,
  extras: Partial<{
    concept: string;
    receiptPath: string | null;
  }> = {},
) {
  return Transaction.create({
    id,
    date,
    type: "expense",
    category,
    concept: "Mercadona",
    amount,
    receiptPath: null,
    ...extras,
  });
}

function renderApp(
  options: ConstructorParameters<typeof FakeCompositionRoot>[0] = {},
) {
  const root = new FakeCompositionRoot(options);
  render(
    <AppProvider compositionRoot={root.asCompositionRoot()}>
      <App />
    </AppProvider>,
  );
  return root;
}

async function settled() {
  await screen.findByText("Agosto de 2026", undefined, { timeout: 3000 });
}

function modalPanel(title: string) {
  const heading = screen.getByRole("heading", { name: title });
  return heading.parentElement?.parentElement as HTMLElement;
}

async function augustCount(root: FakeCompositionRoot): Promise<number> {
  const { TransactionFilters } = await import("../../domain/entities");
  return (
    await root.transactions.getFiltered(
      TransactionFilters.defaultMonth(2026, 8),
    )
  ).length;
}

const defaultCategories = [
  Category.create({ id: 1, label: "Comida", type: "expense" }),
];

describe("App", () => {
  test("renders the shell with the seeded month data", async () => {
    renderApp({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-05", "comida", 40)],
      categories: defaultCategories,
      persons: [],
    });
    await settled();
    await screen.findByText("Mercadona");

    expect(
      screen.getByRole("heading", { name: "Economía Casera" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Movimientos · Agosto de 2026" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Google Drive no detectado/)).toBeInTheDocument();
  });

  test("adds a new transaction from the form modal", async () => {
    const user = userEvent.setup();
    const root = renderApp({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-05", "comida", 40)],
      categories: defaultCategories,
    });
    await settled();
    await screen.findByText("Mercadona");

    await user.click(screen.getByRole("button", { name: "Añadir movimiento" }));
    const dialog = modalPanel("Añadir movimiento");

    await user.selectOptions(
      within(dialog).getByLabelText("Categoría"),
      "comida",
    );
    await user.type(within(dialog).getByLabelText("Concepto"), "Cine");
    await user.type(within(dialog).getByLabelText("Importe"), "12");
    await user.click(within(dialog).getByRole("button", { name: "Añadir" }));

    expect(await screen.findByText("Cine")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Añadir movimiento" }),
    ).not.toBeInTheDocument();
    expect(await augustCount(root)).toBe(2);
  });

  test("warns about a similar transaction and adds it as new", async () => {
    const user = userEvent.setup();
    const root = renderApp({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-01", "comida", 12)],
      categories: defaultCategories,
    });
    await settled();
    await screen.findByText("Mercadona");

    await user.click(screen.getByRole("button", { name: "Añadir movimiento" }));
    const dialog = modalPanel("Añadir movimiento");
    await user.selectOptions(
      within(dialog).getByLabelText("Categoría"),
      "comida",
    );
    await user.type(within(dialog).getByLabelText("Concepto"), "Cine");
    await user.type(within(dialog).getByLabelText("Importe"), "12");
    await user.click(within(dialog).getByRole("button", { name: "Añadir" }));

    expect(
      screen.getByRole("heading", { name: "Movimiento similar encontrado" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Añadir como nuevo" }));

    expect(await screen.findByText("Cine")).toBeInTheDocument();
    expect(await augustCount(root)).toBe(2);
  });

  test("updates the existing transaction from the similar dialog", async () => {
    const user = userEvent.setup();
    const root = renderApp({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-01", "comida", 12)],
      categories: defaultCategories,
    });
    await settled();
    await screen.findByText("Mercadona");

    await user.click(screen.getByRole("button", { name: "Añadir movimiento" }));
    const dialog = modalPanel("Añadir movimiento");
    await user.selectOptions(
      within(dialog).getByLabelText("Categoría"),
      "comida",
    );
    await user.type(within(dialog).getByLabelText("Concepto"), "Cine");
    await user.type(within(dialog).getByLabelText("Importe"), "12");
    await user.click(within(dialog).getByRole("button", { name: "Añadir" }));
    await user.click(screen.getByRole("button", { name: "Actualizar" }));

    expect(await screen.findByText("Cine")).toBeInTheDocument();
    expect(await augustCount(root)).toBe(1);
    const txs = await root.transactions.getFiltered(
      TransactionFilters.defaultMonth(2026, 8),
    );
    expect(txs[0].concept).toBe("Cine");
  });

  test("edits an existing transaction", async () => {
    const user = userEvent.setup();
    const root = renderApp({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-05", "comida", 40)],
      categories: defaultCategories,
    });
    await settled();
    await screen.findByText("Mercadona");

    await user.click(screen.getByRole("button", { name: "✎" }));
    const dialog = modalPanel("Editar movimiento");
    const concept = within(dialog).getByLabelText("Concepto");
    await user.clear(concept);
    await user.type(concept, "Nuevo concepto");
    await user.click(within(dialog).getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Nuevo concepto")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Importar movimientos" }),
    ).not.toBeInTheDocument();
    const txs = await root.transactions.getFiltered(
      TransactionFilters.defaultMonth(2026, 8),
    );
    expect(txs[0].concept).toBe("Nuevo concepto");
  });

  test("deletes a transaction after the confirmation dialog", async () => {
    const user = userEvent.setup();
    const root = renderApp({
      settings: augustSettings,
      transactions: [expense(1, "2026-08-05", "comida", 40)],
      categories: [],
    });
    await settled();
    await screen.findByText("Mercadona");

    await user.click(screen.getByRole("button", { name: "🗑" }));
    expect(screen.getByText("¿Eliminar este movimiento?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Eliminar" }));

    await waitFor(() => {
      expect(screen.queryByText("Mercadona")).not.toBeInTheDocument();
    });
    expect(await augustCount(root)).toBe(0);
  });

  test("views and closes the receipt of a transaction", async () => {
    const user = userEvent.setup();
    renderApp({
      settings: augustSettings,
      transactions: [
        expense(1, "2026-08-05", "comida", 40, { receiptPath: "r/1.png" }),
      ],
      categories: [],
    });
    await settled();
    await screen.findByText("Mercadona");

    await user.click(
      screen.getByRole("button", { name: "Ver ticket de Mercadona" }),
    );

    expect(
      screen.getByRole("dialog", { name: "Foto del ticket" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "data:image/png;base64,ZGVtbw==",
    );

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(
      screen.queryByRole("heading", { name: "Configuración" }),
    ).not.toBeInTheDocument();
  });

  test("opens and closes the import modal", async () => {
    const user = userEvent.setup();
    renderApp({ settings: augustSettings });
    await settled();

    await user.click(screen.getByRole("button", { name: "Importar" }));
    expect(
      screen.getByRole("heading", { name: "Importar movimientos" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Excel/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(
      screen.queryByRole("heading", { name: "Editar movimiento" }),
    ).not.toBeInTheDocument();
  });

  test("opens the settings modal with the category and person config", async () => {
    const user = userEvent.setup();
    renderApp({
      settings: augustSettings,
      categories: defaultCategories,
      persons: [Person.create({ id: 1, label: "Ana" })],
    });
    await settled();

    await user.click(screen.getByRole("button", { name: "Configuración" }));

    expect(
      screen.getByRole("heading", { name: "Configuración" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Categorías")).toBeInTheDocument();
    expect(screen.getByText("Miembros familiares")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(
      screen.queryByRole("heading", { name: "Editar movimiento" }),
    ).not.toBeInTheDocument();
  });

  test("navigates to the next year from the filters bar", async () => {
    const user = userEvent.setup();
    renderApp({ settings: augustSettings });
    await settled();

    await user.click(screen.getByRole("button", { name: "Año siguiente" }));

    expect(
      await screen.findByText("Agosto de 2027", undefined, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  test("cycles the theme and updates the document attribute", async () => {
    const user = userEvent.setup();
    renderApp({ settings: augustSettings });
    await settled();

    expect(document.documentElement).toHaveAttribute("data-theme", "light");

    await user.click(screen.getByRole("button", { name: "Cambiar tema" }));
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    });

    await user.click(screen.getByRole("button", { name: "Cambiar tema" }));
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute("data-theme", "light");
    });
  });

  test("shows the conflict dialog and resolves it with the local data", async () => {
    const user = userEvent.setup();
    const root = renderApp({ settings: augustSettings, hasDbConflict: true });
    await settled();

    await waitFor(
      () => {
        expect(screen.getByText("Usar mis datos locales")).toBeInTheDocument();
      },
      { timeout: 7000 },
    );

    await user.click(
      screen.getByRole("button", { name: "Usar mis datos locales" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Sí, usar mis datos locales" }),
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Usar mis datos locales"),
      ).not.toBeInTheDocument();
    });
    expect(root.dbInfo.hasConflict).toBe(false);
  }, 15000);

  test("shows the update dialog and dismisses it", async () => {
    const user = userEvent.setup();
    renderApp({
      settings: augustSettings,
      updateInfo: {
        version: "2.0.0",
        downloadUrl: "https://example.com/app",
        currentVersion: "1.9.0",
      },
    });
    await settled();

    expect(
      screen.getByRole("heading", { name: "Nueva versión disponible" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2.0.0")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Más tarde" }));

    expect(
      screen.queryByRole("heading", { name: "Nueva versión disponible" }),
    ).not.toBeInTheDocument();
  });
});
