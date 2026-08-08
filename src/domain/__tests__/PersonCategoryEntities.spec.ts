import { describe, expect, test } from "vitest";
import { Category } from "../entities/Category";
import { Entity } from "../entities/Entity";
import { Person } from "../entities/Person";

describe("Entity", () => {
  class FakeEntity extends Entity {}

  test("equals returns true when ids match", () => {
    const a = new FakeEntity(1);
    const b = new FakeEntity(1);

    expect(a.equals(b)).toBe(true);
  });

  test("equals returns false when ids differ", () => {
    const a = new FakeEntity(1);
    const b = new FakeEntity(2);

    expect(a.equals(b)).toBe(false);
  });
});

describe("Person.create", () => {
  test("trims the label and generates the key from it", () => {
    const person = Person.create({ label: "  María " });

    expect(person.label).toBe("María");
    expect(person.key).toBe("maria");
  });

  test("uses the provided key when given", () => {
    const person = Person.create({ label: "Ana", key: "ana_casa" });

    expect(person.key).toBe("ana_casa");
  });

  test("defaults to active", () => {
    const person = Person.create({ label: "Ana" });

    expect(person.active).toBe(true);
  });

  test("uses the provided id and active value", () => {
    const person = Person.create({ id: 7, label: "Ana", active: false });

    expect(person.id).toBe(7);
    expect(person.active).toBe(false);
  });

  test("throws when the label is empty", () => {
    expect(() => Person.create({ label: "  " })).toThrow(
      "El nombre no puede estar vacío",
    );
  });

  test("throws when the key is not valid", () => {
    expect(() => Person.create({ label: "Ana", key: "..." })).toThrow(
      "La clave no es válida",
    );
  });
});

describe("Person mutations", () => {
  const person = Person.create({ id: 3, label: "Ana" });

  test("withLabel updates the label and keeps id, key and active", () => {
    const updated = person.withLabel("  Ana García ");

    expect(updated.label).toBe("Ana García");
    expect(updated.key).toBe(person.key);
    expect(updated.id).toBe(3);
    expect(updated.active).toBe(true);
    expect(person.label).toBe("Ana");
  });

  test("toggleActive flips the flag", () => {
    const flipped = person.toggleActive().toggleActive();

    expect(flipped.active).toBe(true);

    const single = person.toggleActive();

    expect(single.active).toBe(false);
  });
});

describe("Category.create", () => {
  test("trims the label and generates the key", () => {
    const category = Category.create({
      label: "  Comida ",
      type: "expense",
    });

    expect(category.label).toBe("Comida");
    expect(category.key).toBe("comida");
  });

  test("keeps the type and defaults to active", () => {
    const category = Category.create({ label: "Nómina", type: "income" });

    expect(category.type).toBe("income");
    expect(category.active).toBe(true);
  });

  test("throws when the label is empty", () => {
    expect(() => Category.create({ label: "", type: "expense" })).toThrow(
      "El nombre de la categoría no puede estar vacío",
    );
  });

  test("throws when the key is not valid", () => {
    expect(() =>
      Category.create({ label: "Comida", key: "???", type: "expense" }),
    ).toThrow("La clave de la categoría no es válida");
  });
});

describe("Category mutations", () => {
  const category = Category.create({
    id: 5,
    label: "Comida",
    type: "expense",
  });

  test("withLabel updates the label and keeps the rest", () => {
    const updated = category.withLabel("Supermercado");

    expect(updated.label).toBe("Supermercado");
    expect(updated.key).toBe("comida");
    expect(updated.type).toBe("expense");
    expect(updated.id).toBe(5);
  });

  test("toggleActive flips the flag", () => {
    const flipped = category.toggleActive();

    expect(flipped.active).toBe(false);
  });
});
