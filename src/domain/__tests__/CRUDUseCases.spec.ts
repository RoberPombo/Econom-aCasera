import { describe, expect, test } from "vitest";
import {
  defaultSettings,
  FakeImportRepository,
  FakeUpdateRepository,
  InMemoryCategoryRepository,
  InMemoryDbInfoRepository,
  InMemoryPersonRepository,
  InMemorySettingsRepository,
  InMemoryTransactionRepository,
} from "../../tests/fakes/repositories";
import { Category, Person, Transaction } from "../entities";
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
  UpdateCategoryUseCase,
} from "../usecases/CategoryUseCases";
import {
  ForceOverwriteUseCase,
  GetDbInfoUseCase,
  ReloadDatabaseUseCase,
} from "../usecases/DbInfoUseCases";
import { GetTransactionsByDateUseCase } from "../usecases/GetTransactionsByDateUseCase";
import {
  AddCategoriesUseCase,
  ConfirmImportUseCase,
  PreviewImportUseCase,
} from "../usecases/ImportUseCases";
import {
  CreatePersonUseCase,
  DeletePersonUseCase,
  GetPersonsUseCase,
  UpdatePersonUseCase,
} from "../usecases/PersonUseCases";
import {
  GetSettingsUseCase,
  UpdateSettingsUseCase,
} from "../usecases/SettingsUseCases";
import {
  CheckForUpdateUseCase,
  DownloadUpdateUseCase,
} from "../usecases/UpdateUseCases";

describe("Person use cases", () => {
  test("GetPersonsUseCase returns all persons", async () => {
    const existing = Person.create({ label: "Ana" });
    const getPersons = new GetPersonsUseCase(
      new InMemoryPersonRepository([existing]),
    );

    const result = await getPersons.execute();

    expect(result).toEqual([existing]);
  });

  test("CreatePersonUseCase delegates the label to the repository", async () => {
    const repo = new InMemoryPersonRepository();
    const createPerson = new CreatePersonUseCase(repo);

    const person = await createPerson.execute("Ana");

    expect(person.label).toBe("Ana");
    await expect(repo.getAll()).resolves.toEqual([person]);
  });

  test("UpdatePersonUseCase updates the person", async () => {
    const person = Person.create({ id: 1, label: "Ana" });
    const repo = new InMemoryPersonRepository([person]);
    const updatePerson = new UpdatePersonUseCase(repo);
    const updated = person.withLabel("Ana García");

    await updatePerson.execute(updated);

    await expect(repo.getAll()).resolves.toEqual([updated]);
  });

  test("DeletePersonUseCase removes the person", async () => {
    const person = Person.create({ id: 1, label: "Ana" });
    const repo = new InMemoryPersonRepository([person]);
    const deletePerson = new DeletePersonUseCase(repo);

    await deletePerson.execute(1);

    await expect(repo.getAll()).resolves.toEqual([]);
  });
});

describe("Category use cases", () => {
  test("GetCategoriesUseCase returns all categories", async () => {
    const existing = Category.create({ label: "Comida", type: "expense" });
    const getCategories = new GetCategoriesUseCase(
      new InMemoryCategoryRepository([existing]),
    );

    const result = await getCategories.execute();

    expect(result).toEqual([existing]);
  });

  test("CreateCategoryUseCase delegates label and type", async () => {
    const repo = new InMemoryCategoryRepository();
    const createCategory = new CreateCategoryUseCase(repo);

    const category = await createCategory.execute("Comida", "expense");

    expect(category.label).toBe("Comida");
    expect(category.type).toBe("expense");
  });

  test("UpdateCategoryUseCase updates the category", async () => {
    const category = Category.create({
      id: 1,
      label: "Comida",
      type: "expense",
    });
    const repo = new InMemoryCategoryRepository([category]);
    const updateCategory = new UpdateCategoryUseCase(repo);
    const updated = category.withLabel("Supermercado");

    await updateCategory.execute(updated);

    await expect(repo.getAll()).resolves.toEqual([updated]);
  });

  test("DeleteCategoryUseCase removes the category", async () => {
    const category = Category.create({
      id: 1,
      label: "Comida",
      type: "expense",
    });
    const repo = new InMemoryCategoryRepository([category]);
    const deleteCategory = new DeleteCategoryUseCase(repo);

    await deleteCategory.execute(1);

    await expect(repo.getAll()).resolves.toEqual([]);
  });
});

describe("Settings use cases", () => {
  test("GetSettingsUseCase returns the settings", async () => {
    const repo = new InMemorySettingsRepository();
    const getSettings = new GetSettingsUseCase(repo);

    const result = await getSettings.execute();

    expect(result).toEqual(defaultSettings());
  });

  test("setYear persists and updates the settings", async () => {
    const repo = new InMemorySettingsRepository();
    const updateSettings = new UpdateSettingsUseCase(repo);

    await updateSettings.setYear(2025);

    const settings = await repo.get();
    expect(settings.currentYear).toBe(2025);
    expect(settings.currentMonth).toBe(defaultSettings().currentMonth);
  });

  test("setMonth persists the month", async () => {
    const repo = new InMemorySettingsRepository();
    const updateSettings = new UpdateSettingsUseCase(repo);

    await updateSettings.setMonth(12);

    const settings = await repo.get();
    expect(settings.currentMonth).toBe(12);
  });

  test("setViewMode persists the view mode", async () => {
    const repo = new InMemorySettingsRepository();
    const updateSettings = new UpdateSettingsUseCase(repo);

    await updateSettings.setViewMode("annual");

    const settings = await repo.get();
    expect(settings.viewMode).toBe("annual");
  });

  test("setTheme persists the theme", async () => {
    const repo = new InMemorySettingsRepository();
    const updateSettings = new UpdateSettingsUseCase(repo);

    await updateSettings.setTheme("dark");

    const settings = await repo.get();
    expect(settings.theme).toBe("dark");
  });
});

describe("DbInfo use cases", () => {
  test("GetDbInfoUseCase returns the db info", async () => {
    const getDbInfo = new GetDbInfoUseCase(new InMemoryDbInfoRepository());

    const result = await getDbInfo.execute();

    expect(result.dbPath).toBe("/db.sqlite");
    expect(result.hasConflict).toBe(false);
  });

  test("ReloadDatabaseUseCase delegates to the repository", async () => {
    const reload = new ReloadDatabaseUseCase(new InMemoryDbInfoRepository());

    const result = await reload.execute();

    expect(result).toEqual({
      ok: true,
      dbPath: "/db.sqlite",
      usesDrive: false,
    });
  });

  test("ForceOverwriteUseCase delegates to the repository", async () => {
    const forceOverwrite = new ForceOverwriteUseCase(
      new InMemoryDbInfoRepository(),
    );

    const result = await forceOverwrite.execute();

    expect(result.ok).toBe(true);
  });
});

describe("Update use cases", () => {
  const info = {
    version: "1.2.3",
    downloadUrl: "https://example.com/app.exe",
    currentVersion: "1.0.0",
  };

  test("CheckForUpdateUseCase returns null when there is no update", async () => {
    const checkForUpdate = new CheckForUpdateUseCase(
      new FakeUpdateRepository(null),
    );

    const result = await checkForUpdate.execute();

    expect(result).toBeNull();
  });

  test("CheckForUpdateUseCase returns the update info", async () => {
    const checkForUpdate = new CheckForUpdateUseCase(
      new FakeUpdateRepository(info),
    );

    const result = await checkForUpdate.execute();

    expect(result).toEqual(info);
  });

  test("DownloadUpdateUseCase returns the download result", async () => {
    const download = new DownloadUpdateUseCase(
      new FakeUpdateRepository(null, { ok: false, error: "boom" }),
    );

    const result = await download.execute();

    expect(result).toEqual({ ok: false, error: "boom" });
  });
});

describe("Import use cases", () => {
  test("PreviewImportUseCase returns the preview", async () => {
    const preview = {
      transactions: [
        Transaction.create({
          date: "2026-08-01",
          type: "expense",
          category: "comida",
          concept: "Pago",
          amount: 10,
        }),
      ],
      errors: ["fila 2 inválida"],
      skipped: 1,
    };
    const previewImport = new PreviewImportUseCase(
      new FakeImportRepository(preview),
    );

    const result = await previewImport.execute(
      "excel",
      new File([], "datos.csv"),
    );

    expect(result).toEqual(preview);
  });

  test("ConfirmImportUseCase returns the number of inserted rows", async () => {
    const tx = Transaction.create({
      date: "2026-08-01",
      type: "expense",
      category: "comida",
      concept: "Pago",
      amount: 10,
    });
    const confirmImport = new ConfirmImportUseCase(
      new FakeImportRepository({ transactions: [], errors: [], skipped: 0 }, 3),
    );

    const result = await confirmImport.execute([tx]);

    expect(result).toBe(3);
  });

  test("AddCategoriesUseCase returns the number of added categories", async () => {
    const repository = new FakeImportRepository({
      transactions: [],
      errors: [],
      skipped: 0,
    });
    repository.addCategoriesResult = 4;
    const addCategories = new AddCategoriesUseCase(repository);

    const result = await addCategories.execute([
      { label: "Nóminas", type: "income" },
      { label: "Alimentación", type: "expense" },
    ]);

    expect(result).toBe(4);
    expect(repository.addCategoriesCalls).toEqual([
      [
        { label: "Nóminas", type: "income" },
        { label: "Alimentación", type: "expense" },
      ],
    ]);
  });
});

describe("GetTransactionsByDateUseCase", () => {
  test("returns only the transactions of the given date", async () => {
    const repo = new InMemoryTransactionRepository([
      Transaction.create({
        date: "2026-08-01",
        type: "expense",
        category: "comida",
        concept: "Mercadona",
        amount: 40,
      }),
      Transaction.create({
        date: "2026-08-02",
        type: "expense",
        category: "comida",
        concept: "Día",
        amount: 20,
      }),
    ]);
    const getByDate = new GetTransactionsByDateUseCase(repo);

    const result = await getByDate.execute("2026-08-02");

    expect(result).toHaveLength(1);
    expect(result[0].concept).toBe("Día");
  });
});
