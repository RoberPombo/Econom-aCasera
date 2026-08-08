import { describe, expect, test } from "vitest";
import { isValidKey, normalizeKey } from "../entities/Key";

describe("normalizeKey", () => {
  test("trims and lowercases the input", () => {
    const result = normalizeKey("  Casa  ");

    expect(result).toBe("casa");
  });

  test("strips accents and ñ", () => {
    const result = normalizeKey("Jóse_María");

    expect(result).toBe("jose_maria");
  });

  test("replaces spaces, dots and slashes with underscores", () => {
    const result = normalizeKey("A.B /C D");

    expect(result).toBe("a_b_c_d");
  });

  test("collapses consecutive underscores and trims them", () => {
    const result = normalizeKey("__a___b__");

    expect(result).toBe("a_b");
  });

  test("returns empty string when nothing usable remains", () => {
    const result = normalizeKey("  .  ");

    expect(result).toBe("");
  });
});

describe("isValidKey", () => {
  test("accepts non-empty normalized keys", () => {
    const result = isValidKey("casa");

    expect(result).toBe(true);
  });

  test("rejects empty strings", () => {
    const result = isValidKey("");

    expect(result).toBe(false);
  });
});
