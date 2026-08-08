import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useAppContext } from "../context/useAppContext";

describe("useAppContext", () => {
  test("throws when used outside the AppProvider", () => {
    expect(() => renderHook(() => useAppContext())).toThrow(
      "AppContext not initialized",
    );
  });
});
