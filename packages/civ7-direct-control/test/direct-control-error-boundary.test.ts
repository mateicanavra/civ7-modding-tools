import { describe, expect, test } from "vitest";

import { Civ7DirectControlError } from "../src/direct-control-error";
import { isCiv7DirectControlError } from "../src/direct-control-error-boundary";

describe("direct-control error boundary", () => {
  test("recognizes the owned error class through its bounded public shape", () => {
    const error = new Civ7DirectControlError("response-timeout", "private command evidence", {
      details: { rawCommand: "Game.mapInfo" },
      dispatchStatus: "indeterminate",
    });

    expect(isCiv7DirectControlError(error)).toBe(true);
    expect(error.dispatchStatus).toBe("indeterminate");
  });

  test("recognizes the same bounded error data from a different constructor entry", () => {
    const error = new Error("private command evidence");
    error.name = "Civ7DirectControlError";
    Object.assign(error, { code: "response-timeout", dispatchStatus: "not-dispatched" });

    expect(isCiv7DirectControlError(error)).toBe(true);
  });

  test("recognizes command-unrelated failures without dispatch evidence", () => {
    const error = new Civ7DirectControlError("setup-api-unavailable", "setup unavailable");

    expect(isCiv7DirectControlError(error)).toBe(true);
    expect(error.dispatchStatus).toBeUndefined();
  });

  test("rejects plain objects, other error names, unowned codes, and invalid dispatch evidence", () => {
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
    expect(
      isCiv7DirectControlError(
        Object.assign(new Error(), {
          name: "Civ7DirectControlError",
          code: "response-timeout",
          dispatchStatus: "probably-sent",
        })
      )
    ).toBe(false);
  });
});
