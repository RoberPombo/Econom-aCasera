import { describe, expect, test } from "vitest";
import {
  InMemoryDbInfoRepository,
  InMemoryReceiptRepository,
  InMemoryTransactionRepository,
} from "../../tests/fakes/repositories";
import { Transaction } from "../entities";
import { CreateTransactionUseCase } from "../usecases/CreateTransactionUseCase";
import { DeleteTransactionUseCase } from "../usecases/DeleteTransactionUseCase";
import { UpdateTransactionUseCase } from "../usecases/UpdateTransactionUseCase";

function expenseWithReceipt(id: number, path: string): Transaction {
  return Transaction.create({
    id,
    date: "2026-08-01",
    type: "expense",
    category: "comida",
    concept: "Mercadona",
    amount: 40,
    receiptPath: path,
  });
}

describe("CreateTransactionUseCase", () => {
  test("creates a transaction without receipt and syncs the db", async () => {
    const repo = new InMemoryTransactionRepository();
    const receipts = new InMemoryReceiptRepository();
    const dbInfo = new InMemoryDbInfoRepository();
    const create = new CreateTransactionUseCase(repo, receipts, dbInfo);

    const created = await create.execute({
      date: "2026-08-01",
      type: "expense",
      category: "comida",
      concept: "Mercadona",
      amount: 40,
    });

    expect(created.receiptPath).toBeNull();
    expect(typeof created.id).toBe("number");
    expect(receipts.saved).toHaveLength(0);
    expect(dbInfo.syncCount).toBe(1);
    await expect(repo.getById(created.id as number)).resolves.toEqual(created);
  });

  test("saves the receipt for an expense and stores its path", async () => {
    const repo = new InMemoryTransactionRepository();
    const receipts = new InMemoryReceiptRepository();
    const dbInfo = new InMemoryDbInfoRepository();
    const create = new CreateTransactionUseCase(repo, receipts, dbInfo);

    const created = await create.execute({
      date: "2026-08-01",
      type: "expense",
      category: "comida",
      concept: "Mercadona",
      amount: 40,
      receipt: { bytes: new Uint8Array([1, 2]), extension: "png" },
    });

    expect(created.receiptPath).toBe("receipts/1.png");
    expect(receipts.saved).toEqual([{ transactionId: 1, extension: "png" }]);
    expect(dbInfo.syncCount).toBe(1);
  });

  test("never saves a receipt for an income transaction", async () => {
    const repo = new InMemoryTransactionRepository();
    const receipts = new InMemoryReceiptRepository();
    const dbInfo = new InMemoryDbInfoRepository();
    const create = new CreateTransactionUseCase(repo, receipts, dbInfo);

    const created = await create.execute({
      date: "2026-08-01",
      type: "income",
      category: "nomina",
      concept: "Nómina",
      amount: 1500,
      receipt: { bytes: new Uint8Array([1]), extension: "png" },
    });

    expect(created.receiptPath).toBeNull();
    expect(receipts.saved).toHaveLength(0);
    expect(dbInfo.syncCount).toBe(1);
  });
});

describe("UpdateTransactionUseCase", () => {
  test("throws when the transaction does not exist", async () => {
    const update = new UpdateTransactionUseCase(
      new InMemoryTransactionRepository(),
      new InMemoryReceiptRepository(),
      new InMemoryDbInfoRepository(),
    );

    await expect(update.execute(99, { concept: "Cambio" })).rejects.toThrow(
      "Transaction not found",
    );
  });

  test("updates fields and keeps the receipt", async () => {
    const repo = new InMemoryTransactionRepository([
      expenseWithReceipt(1, "receipts/1.png"),
    ]);
    const receipts = new InMemoryReceiptRepository();
    const dbInfo = new InMemoryDbInfoRepository();
    const update = new UpdateTransactionUseCase(repo, receipts, dbInfo);

    const updated = await update.execute(1, { concept: "Supermercado" });

    expect(updated.concept).toBe("Supermercado");
    expect(updated.receiptPath).toBe("receipts/1.png");
    expect(receipts.deleted).toHaveLength(0);
    expect(dbInfo.syncCount).toBe(1);
  });

  test("deletes the receipt when changing to income", async () => {
    const repo = new InMemoryTransactionRepository([
      expenseWithReceipt(1, "receipts/1.png"),
    ]);
    const receipts = new InMemoryReceiptRepository();
    const update = new UpdateTransactionUseCase(
      repo,
      receipts,
      new InMemoryDbInfoRepository(),
    );

    const updated = await update.execute(1, { type: "income" });

    expect(updated.type).toBe("income");
    expect(updated.receiptPath).toBeNull();
    expect(receipts.deleted).toEqual(["receipts/1.png"]);
  });

  test("deletes the receipt when removeReceipt is set", async () => {
    const repo = new InMemoryTransactionRepository([
      expenseWithReceipt(1, "receipts/1.png"),
    ]);
    const receipts = new InMemoryReceiptRepository();
    const update = new UpdateTransactionUseCase(
      repo,
      receipts,
      new InMemoryDbInfoRepository(),
    );

    const updated = await update.execute(1, { removeReceipt: true });

    expect(updated.receiptPath).toBeNull();
    expect(receipts.deleted).toEqual(["receipts/1.png"]);
  });

  test("replaces the receipt when a new one is provided", async () => {
    const repo = new InMemoryTransactionRepository([
      expenseWithReceipt(1, "receipts/old.png"),
    ]);
    const receipts = new InMemoryReceiptRepository();
    const update = new UpdateTransactionUseCase(
      repo,
      receipts,
      new InMemoryDbInfoRepository(),
    );

    const updated = await update.execute(1, {
      receipt: { bytes: new Uint8Array([9]), extension: "jpg" },
    });

    expect(updated.receiptPath).toBe("receipts/1.jpg");
    expect(receipts.deleted).toEqual(["receipts/old.png"]);
    expect(receipts.saved).toEqual([{ transactionId: 1, extension: "jpg" }]);
  });
});

describe("DeleteTransactionUseCase", () => {
  test("deletes a transaction without receipt and syncs", async () => {
    const repo = new InMemoryTransactionRepository([
      Transaction.create({
        id: 1,
        date: "2026-08-01",
        type: "expense",
        category: "comida",
        concept: "Mercadona",
        amount: 40,
      }),
    ]);
    const receipts = new InMemoryReceiptRepository();
    const dbInfo = new InMemoryDbInfoRepository();
    const remove = new DeleteTransactionUseCase(repo, receipts, dbInfo);

    await remove.execute(1);

    await expect(repo.getById(1)).resolves.toBeNull();
    expect(receipts.deleted).toHaveLength(0);
    expect(dbInfo.syncCount).toBe(1);
  });

  test("deletes the receipt file when the transaction has one", async () => {
    const repo = new InMemoryTransactionRepository([
      expenseWithReceipt(1, "receipts/1.png"),
    ]);
    const receipts = new InMemoryReceiptRepository();
    const remove = new DeleteTransactionUseCase(
      repo,
      receipts,
      new InMemoryDbInfoRepository(),
    );

    await remove.execute(1);

    await expect(repo.getById(1)).resolves.toBeNull();
    expect(receipts.deleted).toEqual(["receipts/1.png"]);
  });
});
