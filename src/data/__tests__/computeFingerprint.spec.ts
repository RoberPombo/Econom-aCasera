import { describe, expect, test } from "vitest";
import { computeFingerprint } from "../computeFingerprint";

describe("computeFingerprint", () => {
  const base = {
    date: "2026-08-06",
    type: "expense",
    amount: 34.5,
    concept: "Pago en MERCADONA A CORUA ES",
    category: "comida",
    person: "",
  };

  test("normalizes the category key", () => {
    const withLabel = computeFingerprint({ ...base, category: "Comida" });
    const withKey = computeFingerprint({ ...base, category: "comida" });
    expect(withLabel).toBe(withKey);
  });

  test("collapses consecutive whitespace in the concept", () => {
    const collapsed = computeFingerprint({ ...base, concept: "Pago   en   MERCADONA" });
    const single = computeFingerprint({ ...base, concept: "Pago en MERCADONA" });
    expect(collapsed).toBe(single);
  });

  test("keeps amount from the same transaction identical", () => {
    const first = computeFingerprint(base);
    const second = computeFingerprint({ ...base, amount: 34.5 });
    expect(first).toBe(second);
  });
});