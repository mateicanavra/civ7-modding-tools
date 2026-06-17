import { describe, expect, it } from "vitest";

import {
  projectStudioBrowserDefinedError,
  projectStudioBrowserError,
} from "../../src/features/studioErrors/definedErrorProjection";

describe("Studio browser defined error projection", () => {
  it("preserves declared code, status, diagnostics, recovery actions, and identity fields", () => {
    const projection = projectStudioBrowserDefinedError({
      code: "RUN_IN_GAME_FAILED",
      statusCode: 500,
      message: "Run in Game failed",
      fallbackMessage: "fallback",
      data: {
        tag: "ProofFailed",
        reason: "setup-row-unavailable",
        requestId: "studio-run-1",
        recoveryActions: ["exit-to-shell-and-continue", "retry-run", "copy-diagnostics"],
        diagnostics: {
          code: "run-in-game-setup-row-unavailable",
          failedAtPhase: "preparing-setup",
          cause: "Civ7 setup cannot see {swooper-maps}/maps/studio-current.js",
        },
      },
    });

    expect(projection).toMatchObject({
      error: "Run in Game failed",
      code: "RUN_IN_GAME_FAILED",
      statusCode: 500,
      details: {
        code: "run-in-game-setup-row-unavailable",
        definedErrorCode: "RUN_IN_GAME_FAILED",
        failureTag: "ProofFailed",
        reason: "setup-row-unavailable",
        requestId: "studio-run-1",
        failedAtPhase: "preparing-setup",
        statusCode: 500,
        cause: "Civ7 setup cannot see {swooper-maps}/maps/studio-current.js",
      },
    });
    expect(projection.details?.recoveryActions).toEqual([
      "exit-to-shell-and-continue",
      "retry-run",
      "copy-diagnostics",
    ]);
  });

  it("promotes observedAt from setup-config declared errors", () => {
    const projection = projectStudioBrowserDefinedError({
      code: "SETUP_CONFIG_UNAVAILABLE",
      statusCode: 503,
      message: "Civ7 setup config unavailable",
      fallbackMessage: "fallback",
      data: { observedAt: "2026-06-17T04:00:00.000Z" },
    });

    expect(projection).toMatchObject({
      code: "SETUP_CONFIG_UNAVAILABLE",
      statusCode: 503,
      observedAt: "2026-06-17T04:00:00.000Z",
      details: {
        code: "SETUP_CONFIG_UNAVAILABLE",
        definedErrorCode: "SETUP_CONFIG_UNAVAILABLE",
        observedAt: "2026-06-17T04:00:00.000Z",
      },
    });
  });

  it("keeps plain transport failures as message-only fallback errors", () => {
    expect(projectStudioBrowserError(new Error("network down"), "fallback")).toEqual({
      error: "network down",
    });
    expect(projectStudioBrowserError("boom", "fallback")).toEqual({ error: "fallback" });
  });
});
