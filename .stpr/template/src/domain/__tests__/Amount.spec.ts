import { describe, expect, test } from "vitest";
import { Amount, InvalidAmountError } from "../entities/Amount";

describe("Amount.create", () => {
  test("keeps a positive number", () => {
    const amount = Amount.create(12.5);

    expect(amount.value).toBe(12.5);
  });

  test("rounds to two decimals", () => {
    const amount = Amount.create(0.1 + 0.2);

    expect(amount.value).toBe(0.3);
  });

  test("throws when the value is NaN", () => {
    expect(() => Amount.create(Number.NaN)).toThrow(InvalidAmountError);
    expect(() => Amount.create(Number.NaN)).toThrow(
      "El importe debe ser un número",
    );
  });

  test("throws when the value is zero", () => {
    expect(() => Amount.create(0)).toThrow(InvalidAmountError);
  });

  test("throws when the value is negative", () => {
    expect(() => Amount.create(-5)).toThrow(InvalidAmountError);
    expect(() => Amount.create(-5)).toThrow(
      "El importe debe ser mayor que cero",
    );
  });
});
