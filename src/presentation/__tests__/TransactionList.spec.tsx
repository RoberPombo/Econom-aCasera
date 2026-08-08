import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { Category, Person, Transaction } from "../../domain/entities";
import { TransactionList } from "../components/TransactionList";

const category = Category.create({ label: "Comida", type: "expense" });
const person = Person.create({ id: 1, label: "Ana" });
const transaction = Transaction.create({
  id: 1,
  date: "2026-08-05",
  type: "expense",
  category: category.key,
  concept: "Mercadona",
  amount: 40,
  person: person.key,
});

function renderList(overrides?: {
  transactions?: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: number) => void;
  onViewReceipt?: (t: Transaction) => void;
}) {
  const onEdit = overrides?.onEdit ?? vi.fn();
  const onDelete = overrides?.onDelete ?? vi.fn();
  const onViewReceipt = overrides?.onViewReceipt ?? vi.fn();

  render(
    <TransactionList
      transactions={overrides?.transactions ?? [transaction]}
      categories={[category]}
      persons={[person]}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewReceipt={onViewReceipt}
    />,
  );

  return { onEdit, onDelete, onViewReceipt };
}

describe("TransactionList", () => {
  test("renders the transaction with labels and formatted values", () => {
    renderList();

    expect(screen.getByText("05/08/2026")).toBeInTheDocument();
    expect(screen.getByText("Gasto")).toBeInTheDocument();
    expect(screen.getByText("Comida")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Mercadona")).toBeInTheDocument();
    expect(screen.getByText("40,00 €")).toBeInTheDocument();
  });

  test("shows the person placeholder for transactions without a person", () => {
    renderList({
      transactions: [
        Transaction.create({
          id: 2,
          date: "2026-08-05",
          type: "expense",
          category: "comida",
          concept: "Pan",
          amount: 1,
        }),
      ],
    });

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  test("edit and delete buttons trigger their callbacks", async () => {
    const user = userEvent.setup();
    const { onEdit, onDelete } = renderList();

    await user.click(screen.getByRole("button", { name: "✎" }));
    await user.click(screen.getByRole("button", { name: "🗑" }));

    expect(onEdit).toHaveBeenCalledWith(transaction);
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  test("exposes the receipt button only when the transaction has a receipt", async () => {
    const user = userEvent.setup();
    const withReceipt = Transaction.create({
      id: 3,
      date: "2026-08-05",
      type: "expense",
      category: "comida",
      concept: "Ticket",
      amount: 12,
      receiptPath: "receipts/3.png",
    });
    const { onViewReceipt } = renderList({ transactions: [withReceipt] });

    const receiptButton = screen.getByRole("button", {
      name: "Ver ticket de Ticket",
    });
    await user.click(receiptButton);

    expect(onViewReceipt).toHaveBeenCalledWith(withReceipt);
  });
});
