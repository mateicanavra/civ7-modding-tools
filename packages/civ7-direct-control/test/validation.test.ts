import { describe, expect, test } from "vitest";

import { boundedInteger, validateIdentifier, validatePlayerId } from "../src/validation";

describe("direct-control validation primitives", () => {
  test("bounds integers with existing command-failed classification", () => {
    expect(boundedInteger(3, 1, 5, "limit")).toBe(3);
    for (const value of [0, 6, 1.5, Number.NaN]) {
      expect(() => boundedInteger(value, 1, 5, "limit")).toThrow(
        "limit must be an integer between 1 and 5",
      );
    }
    try {
      boundedInteger(0, 1, 5, "limit");
    } catch (err) {
      expect(err).toMatchObject({ code: "command-failed" });
    }
  });

  test("validates simple identifiers without broadening accepted input", () => {
    expect(validateIdentifier("Resources_2025", "GameInfo table")).toBe("Resources_2025");
    for (const value of ["Resources;DROP", "1Resources", "Resources.Name", ""]) {
      expect(() => validateIdentifier(value, "GameInfo table")).toThrow(
        "GameInfo table must be a simple identifier",
      );
    }
  });

  test("validates player ids through the existing bounded range", () => {
    expect(validatePlayerId(0)).toBe(0);
    expect(validatePlayerId(1024)).toBe(1024);
    expect(() => validatePlayerId(-1)).toThrow("playerId must be an integer between 0 and 1024");
    expect(() => validatePlayerId(1025)).toThrow("playerId must be an integer between 0 and 1024");
  });
});
