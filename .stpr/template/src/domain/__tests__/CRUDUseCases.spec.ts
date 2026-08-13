// Referencia de prueba de casos de uso CRUD (extracto de src/domain/__tests__/CRUDUseCases.spec.ts).
// Se conservan los bloques de Person y Category, el resto de bloques (Settings, DbInfo, Update,
// Import, GetTransactionsByDate) se omiten para mantener el ejemplo autocontenido.
import { describe, expect, test } from "vitest";
import {
  InMemoryCategoryRepository,
  InMemoryPersonRepository,
} from "../../tests/fakes/repositories";
import { Category } from "../entities/Category";
import { Person } from "../entities/Person";
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
  UpdateCategoryUseCase,
} from "../usecases/CategoryUseCases";
import {
  CreatePersonUseCase,
  DeletePersonUseCase,
  GetPersonsUseCase,
  UpdatePersonUseCase,
} from "../usecases/PersonUseCases";

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
