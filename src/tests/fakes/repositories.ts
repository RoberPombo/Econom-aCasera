import {
  Category,
  type DbInfo,
  Person,
  Settings,
  Transaction,
  TransactionFilters,
} from "../../domain/entities";
import type { ImportSource } from "../../domain/entities/ImportSource";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";
import type { DbInfoRepository } from "../../domain/repositories/DbInfoRepository";
import type {
  ImportCategoryOption,
  ImportPreview,
  ImportRepository,
} from "../../domain/repositories/ImportRepository";
import type { PersonRepository } from "../../domain/repositories/PersonRepository";
import type { ReceiptRepository } from "../../domain/repositories/ReceiptRepository";
import type { SettingsRepository } from "../../domain/repositories/SettingsRepository";
import type {
  SummaryResult,
  TransactionRepository,
} from "../../domain/repositories/TransactionRepository";
import type {
  UpdateInfo,
  UpdateRepository,
} from "../../domain/repositories/UpdateRepository";

export function defaultSettings(): Settings {
  return new Settings({
    currentYear: 2026,
    currentMonth: 7,
    viewMode: "monthly",
    theme: "system",
  });
}

export class InMemoryTransactionRepository implements TransactionRepository {
  private nextId = 1;

  constructor(private readonly items: Transaction[] = []) {}

  async getById(id: number): Promise<Transaction | null> {
    return this.items.find((t) => t.id === id) ?? null;
  }

  async getByYearAndMonth(
    year: number,
    month?: number,
  ): Promise<Transaction[]> {
    return this.items.filter(
      (t) => t.year === year && (month === undefined || t.month === month),
    );
  }

  async getByDate(date: string): Promise<Transaction[]> {
    return this.items.filter((t) => t.date === date);
  }

  async getFiltered(filters: TransactionFilters): Promise<Transaction[]> {
    return this.items.filter((t) => {
      if (filters.period.mode === "month") {
        if (t.year !== filters.period.year || t.month !== filters.period.month)
          return false;
      } else {
        if (filters.period.from && t.date < filters.period.from) return false;
        if (filters.period.to && t.date > filters.period.to) return false;
      }
      if (filters.types.length && !filters.types.includes(t.type)) return false;
      if (
        filters.categoryKeys.length &&
        !filters.categoryKeys.includes(t.category)
      )
        return false;
      if (filters.personKeys.length && !filters.personKeys.includes(t.person))
        return false;
      if (filters.minAmount !== null && t.amount < filters.minAmount)
        return false;
      if (filters.maxAmount !== null && t.amount > filters.maxAmount)
        return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = `${t.concept} ${t.category} ${t.person}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const created = Transaction.create({
      id: this.nextId++,
      date: transaction.date,
      type: transaction.type,
      category: transaction.category,
      concept: transaction.concept,
      amount: transaction.amount,
      year: transaction.year,
      month: transaction.month,
      person: transaction.person,
      receiptPath: transaction.receiptPath,
    });
    this.items.push(created);
    return created;
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const index = this.items.findIndex((t) => t.id === transaction.id);
    if (index >= 0) this.items[index] = transaction;
    return transaction;
  }

  async delete(id: number): Promise<void> {
    const index = this.items.findIndex((t) => t.id === id);
    if (index >= 0) this.items.splice(index, 1);
  }

  async getSummary(year: number, month?: number): Promise<SummaryResult> {
    return this.getSummaryFiltered(
      TransactionFilters.defaultMonth(year, month ?? 1),
    );
  }

  async getSummaryFiltered(
    filters: TransactionFilters,
  ): Promise<SummaryResult> {
    const txs = await this.getFiltered(filters);
    const income = txs
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = txs
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return {
      summary: {
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
        balance: Math.round((income - expense) * 100) / 100,
      },
      categories: [],
      monthly: [],
      annual: [],
    };
  }
}

export class InMemoryPersonRepository implements PersonRepository {
  constructor(private readonly items: Person[] = []) {}

  async getAll(): Promise<Person[]> {
    return this.items;
  }

  async create(label: string): Promise<Person> {
    const person = Person.create({ label });
    this.items.push(person);
    return person;
  }

  async update(person: Person): Promise<void> {
    const index = this.items.findIndex((p) => p.id === person.id);
    if (index >= 0) this.items[index] = person;
  }

  async delete(id: number): Promise<void> {
    const index = this.items.findIndex((p) => p.id === id);
    if (index >= 0) this.items.splice(index, 1);
  }
}

export class InMemoryCategoryRepository implements CategoryRepository {
  constructor(private readonly items: Category[] = []) {}

  async getAll(): Promise<Category[]> {
    return this.items;
  }

  async create(label: string, type: "income" | "expense"): Promise<Category> {
    const category = Category.create({ label, type });
    this.items.push(category);
    return category;
  }

  async update(category: Category): Promise<void> {
    const index = this.items.findIndex((c) => c.id === category.id);
    if (index >= 0) this.items[index] = category;
  }

  async delete(id: number): Promise<void> {
    const index = this.items.findIndex((c) => c.id === id);
    if (index >= 0) this.items.splice(index, 1);
  }
}

export class InMemorySettingsRepository implements SettingsRepository {
  constructor(private settings: Settings = defaultSettings()) {}

  async get(): Promise<Settings> {
    return this.settings;
  }

  async setCurrentYear(year: number): Promise<void> {
    this.settings = this.settings.withYear(year);
  }

  async setCurrentMonth(month: number): Promise<void> {
    this.settings = this.settings.withMonth(month);
  }

  async setViewMode(mode: Settings["viewMode"]): Promise<void> {
    this.settings = this.settings.withViewMode(mode);
  }

  async setTheme(theme: Settings["theme"]): Promise<void> {
    this.settings = this.settings.withTheme(theme);
  }
}

export class InMemoryReceiptRepository implements ReceiptRepository {
  readonly saved: { transactionId: number; extension: string }[] = [];
  readonly deleted: string[] = [];

  async save(
    transactionId: number,
    _bytes: Uint8Array,
    extension: string,
  ): Promise<string> {
    this.saved.push({ transactionId, extension });
    return `receipts/${transactionId}.${extension}`;
  }

  async readAsDataUrl(relativePath: string): Promise<string> {
    if (relativePath.startsWith("fail:")) {
      throw new Error(`No se pudo leer el ticket ${relativePath}`);
    }
    return "data:image/png;base64,ZGVtbw==";
  }

  async delete(relativePath: string): Promise<void> {
    this.deleted.push(relativePath);
  }
}

export class InMemoryDbInfoRepository implements DbInfoRepository {
  syncCount = 0;
  hasConflict = false;

  constructor(options: { hasConflict?: boolean } = {}) {
    this.hasConflict = options.hasConflict ?? false;
  }

  async get(): Promise<DbInfo> {
    return {
      dbPath: "/db.sqlite",
      backupPath: "",
      usesDrive: false,
      driveFolder: null,
      hasConflict: this.hasConflict,
    };
  }

  async reload(): Promise<{ ok: boolean; dbPath: string; usesDrive: boolean }> {
    return { ok: true, dbPath: "/db.sqlite", usesDrive: false };
  }

  async forceOverwrite(): Promise<{
    ok: boolean;
    dbPath: string;
    usesDrive: boolean;
  }> {
    this.hasConflict = false;
    return { ok: true, dbPath: "/db.sqlite", usesDrive: false };
  }

  async sync(): Promise<void> {
    this.syncCount += 1;
  }
}

export class FakeUpdateRepository implements UpdateRepository {
  constructor(
    private readonly info: UpdateInfo | null = null,
    private readonly downloadResult: { ok: boolean; error?: string } = {
      ok: true,
    },
  ) {}

  async check(): Promise<UpdateInfo | null> {
    return this.info;
  }

  async download(): Promise<{ ok: boolean; error?: string }> {
    return this.downloadResult;
  }
}

export class FakeImportRepository implements ImportRepository {
  previewResult: ImportPreview;
  confirmResult: number;
  confirmCalls = 0;
  addCategoriesResult = 0;
  addCategoriesCalls: ImportCategoryOption[][] = [];

  constructor(
    previewResult: ImportPreview = {
      transactions: [],
      errors: [],
      skipped: 0,
    },
    confirmResult = 0,
  ) {
    this.previewResult = previewResult;
    this.confirmResult = confirmResult;
  }

  async preview(_source: ImportSource, _file: File): Promise<ImportPreview> {
    return this.previewResult;
  }

  async confirm(transactions: ImportPreview["transactions"]): Promise<number> {
    this.confirmCalls += 1;
    return transactions.length > 0 ? this.confirmResult : 0;
  }

  async addCategories(options: ImportCategoryOption[]): Promise<number> {
    this.addCategoriesCalls.push(options);
    return this.addCategoriesResult;
  }
}
