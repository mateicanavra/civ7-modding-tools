import { Civ7DirectControlError } from "@civ7/direct-control";
import { ORPCError } from "@orpc/client";
import { describe, expect, it } from "vitest";

import {
  STUDIO_ENGINE_ERROR_MAPPINGS,
  toStudioEngineOrpcError,
} from "../../src/server/studio/context";
import { StudioEngineError } from "../../src/server/studio/engineErrors";

const identity = {
  serverInstanceId: "studio-server-test",
  serverStartedAt: "2026-06-13T00:00:00.000Z",
};

describe("Studio engine error spine", () => {
  it("maps sealed known engine failures to declared oRPC errors without status fallthrough", () => {
    const cases = [
      ["autoplay", new StudioEngineError(409, "autoplay blocked"), "AUTOPLAY_BLOCKED", 409],
      ["autoplay", new StudioEngineError(400, "autoplay invalid"), "AUTOPLAY_INVALID", 400],
      ["autoplay", new StudioEngineError(503, "autoplay unavailable"), "AUTOPLAY_UNAVAILABLE", 503],
      ["autoplay", new StudioEngineError(500, "autoplay failed"), "AUTOPLAY_FAILED", 500],
      ["runInGame", new StudioEngineError(400, "run invalid"), "RUN_IN_GAME_INVALID", 400],
      ["runInGame", new StudioEngineError(404, "run missing"), "RUN_IN_GAME_STATUS_NOT_FOUND", 404],
      ["runInGame", new StudioEngineError(409, "run blocked"), "RUN_IN_GAME_BLOCKED", 409],
      ["runInGame", new StudioEngineError(500, "run failed"), "RUN_IN_GAME_FAILED", 500],
      ["runInGame", new StudioEngineError(503, "run unavailable"), "RUN_IN_GAME_UNAVAILABLE", 503],
      ["saveDeploy", new StudioEngineError(400, "save invalid"), "SAVE_DEPLOY_INVALID", 400],
      [
        "saveDeploy",
        new StudioEngineError(404, "save missing"),
        "SAVE_DEPLOY_STATUS_NOT_FOUND",
        404,
      ],
      ["saveDeploy", new StudioEngineError(409, "save blocked"), "SAVE_DEPLOY_BLOCKED", 409],
      ["saveDeploy", new StudioEngineError(500, "save failed"), "SAVE_DEPLOY_FAILED", 500],
      [
        "saveDeploy",
        new StudioEngineError(503, "save unavailable"),
        "SAVE_DEPLOY_UNAVAILABLE",
        503,
      ],
    ] as const;

    for (const [namespace, err, code, status] of cases) {
      const mapped = toStudioEngineOrpcError({
        err,
        namespace,
        fallbackMessage: "unexpected",
        ...identity,
      });
      expect(mapped).toBeInstanceOf(ORPCError);
      expect(mapped.code).toBe(code);
      expect(mapped.status).toBe(status);
      if (status === 404) {
        expect(mapped.data).toMatchObject(identity);
      }
    }
  });

  it("keeps every namespace mapping total over the sealed failure kinds", () => {
    for (const mapping of Object.values(STUDIO_ENGINE_ERROR_MAPPINGS)) {
      expect(Object.keys(mapping).sort()).toEqual([
        "blocked",
        "failed",
        "invalid",
        "not-found",
        "unavailable",
      ]);
    }
  });

  it("preserves identity echo and structured details for status misses", () => {
    const mapped = toStudioEngineOrpcError({
      err: new StudioEngineError(404, "save missing", {
        code: "save-deploy-status-not-found",
        requestId: "save-1",
      }),
      namespace: "saveDeploy",
      fallbackMessage: "save failed",
      ...identity,
    });

    expect(mapped).toMatchObject({
      code: "SAVE_DEPLOY_STATUS_NOT_FOUND",
      status: 404,
      data: {
        ...identity,
        details: {
          code: "save-deploy-status-not-found",
          requestId: "save-1",
        },
      },
    });
  });

  it("maps raw Civ7 direct-control exceptions to namespace unavailable errors", () => {
    const err = new Civ7DirectControlError("response-timeout", "tuner timed out", {
      details: { command: "Game.turn" },
    });

    expect(
      toStudioEngineOrpcError({
        err,
        namespace: "runInGame",
        fallbackMessage: "run failed",
        ...identity,
      })
    ).toMatchObject({ code: "RUN_IN_GAME_UNAVAILABLE", status: 503 });
    expect(
      toStudioEngineOrpcError({
        err,
        namespace: "saveDeploy",
        fallbackMessage: "save failed",
        ...identity,
      })
    ).toMatchObject({ code: "SAVE_DEPLOY_UNAVAILABLE", status: 503 });
    expect(
      toStudioEngineOrpcError({
        err,
        namespace: "autoplay",
        fallbackMessage: "autoplay failed",
        ...identity,
      })
    ).toMatchObject({ code: "AUTOPLAY_UNAVAILABLE", status: 503 });
  });
});
