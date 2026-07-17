import { describe, expect, test } from "vitest";

import { Civ7DirectControlError } from "../src/direct-control-error";
import { isCiv7DirectControlError } from "../src/direct-control-error-boundary";

describe("direct-control error boundary", () => {
  test("recognizes the owned error class through its bounded public shape", () => {
    const error = new Civ7DirectControlError("response-timeout", "private command evidence", {
      details: { rawCommand: "Game.mapInfo" },
    });

    expect(isCiv7DirectControlError(error)).toBe(true);
  });

  test("recognizes the same bounded error data from a different constructor entry", () => {
    const error = new Error("private command evidence");
    error.name = "Civ7DirectControlError";
    Object.assign(error, { code: "response-timeout" });

    expect(isCiv7DirectControlError(error)).toBe(true);
  });

  test("rejects plain objects, other error names, and unowned codes", () => {
    expect(
      isCiv7DirectControlError({ name: "Civ7DirectControlError", code: "response-timeout" })
    ).toBe(false);
    expect(isCiv7DirectControlError(Object.assign(new Error(), { code: "response-timeout" }))).toBe(
      false
    );
    expect(
      isCiv7DirectControlError(
        Object.assign(new Error(), {
          name: "Civ7DirectControlError",
          code: "raw-command-output",
        })
      )
    ).toBe(false);
  });
});
