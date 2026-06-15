import { Civ7DirectControlError } from "@civ7/direct-control";
import {
  autoplayStartStopFailed,
  autoplayVerificationFailed,
  dependencyUnavailable,
  deployFailed,
  invalidRequest,
  materializationFailed,
  operationBlocked,
  operationNotFound,
} from "@civ7/studio-server";
import { ORPCError } from "@orpc/client";
import { describe, expect, it } from "vitest";

import { toStudioRuntimeOrpcError } from "../../src/server/studio/context";

const identity = {
  serverInstanceId: "studio-server-test",
  serverStartedAt: "2026-06-13T00:00:00.000Z",
};

describe("Studio engine error spine", () => {
  it("maps sealed known runtime failures to declared oRPC errors without status fallthrough", () => {
    const cases = [
      [
        "autoplay.command",
        operationBlocked({ message: "autoplay blocked" }),
        "AUTOPLAY_BLOCKED",
        409,
      ],
      [
        "autoplay.command",
        invalidRequest({ message: "autoplay invalid" }),
        "AUTOPLAY_INVALID",
        400,
      ],
      [
        "autoplay.command",
        dependencyUnavailable({ message: "autoplay unavailable" }),
        "AUTOPLAY_UNAVAILABLE",
        503,
      ],
      [
        "autoplay.command",
        autoplayStartStopFailed({ message: "autoplay start failed", reason: "start-failed" }),
        "AUTOPLAY_FAILED",
        500,
      ],
      [
        "autoplay.command",
        autoplayVerificationFailed({ message: "autoplay verification failed" }),
        "AUTOPLAY_FAILED",
        500,
      ],
      ["runInGame.start", invalidRequest({ message: "run invalid" }), "RUN_IN_GAME_INVALID", 400],
      [
        "runInGame.status",
        operationNotFound({ message: "run missing", requestId: "run-1" }),
        "RUN_IN_GAME_STATUS_NOT_FOUND",
        404,
      ],
      ["runInGame.start", operationBlocked({ message: "run blocked" }), "RUN_IN_GAME_BLOCKED", 409],
      [
        "runInGame.start",
        materializationFailed({ message: "run failed" }),
        "RUN_IN_GAME_FAILED",
        500,
      ],
      [
        "runInGame.start",
        dependencyUnavailable({ message: "run unavailable" }),
        "RUN_IN_GAME_UNAVAILABLE",
        503,
      ],
      ["saveDeploy.start", invalidRequest({ message: "save invalid" }), "SAVE_DEPLOY_INVALID", 400],
      [
        "saveDeploy.status",
        operationNotFound({ message: "save missing", requestId: "save-1" }),
        "SAVE_DEPLOY_STATUS_NOT_FOUND",
        404,
      ],
      [
        "saveDeploy.start",
        operationBlocked({ message: "save blocked" }),
        "SAVE_DEPLOY_BLOCKED",
        409,
      ],
      ["saveDeploy.start", deployFailed({ message: "save failed" }), "SAVE_DEPLOY_FAILED", 500],
      [
        "saveDeploy.start",
        dependencyUnavailable({ message: "save unavailable" }),
        "SAVE_DEPLOY_UNAVAILABLE",
        503,
      ],
    ] as const;

    for (const [procedure, err, code, status] of cases) {
      const mapped = toStudioRuntimeOrpcError({
        err,
        procedure,
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

  it("preserves identity echo and sealed data for status misses", () => {
    const mapped = toStudioRuntimeOrpcError({
      err: operationNotFound({
        message: "save missing",
        requestId: "save-1",
        diagnostics: {
          code: "save-deploy-status-not-found",
        },
      }),
      procedure: "saveDeploy.status",
      fallbackMessage: "save failed",
      ...identity,
    });

    expect(mapped).toMatchObject({
      code: "SAVE_DEPLOY_STATUS_NOT_FOUND",
      status: 404,
      data: {
        ...identity,
        requestId: "save-1",
        diagnostics: { code: "save-deploy-status-not-found" },
      },
    });
  });

  it("maps raw Civ7 direct-control exceptions to namespace unavailable errors", () => {
    const err = new Civ7DirectControlError("response-timeout", "tuner timed out", {
      details: { command: "Game.turn" },
    });

    expect(
      toStudioRuntimeOrpcError({
        err,
        procedure: "runInGame.status",
        fallbackMessage: "run failed",
        ...identity,
      })
    ).toMatchObject({ code: "RUN_IN_GAME_UNAVAILABLE", status: 503 });
    expect(
      toStudioRuntimeOrpcError({
        err,
        procedure: "saveDeploy.status",
        fallbackMessage: "save failed",
        ...identity,
      })
    ).toMatchObject({ code: "SAVE_DEPLOY_UNAVAILABLE", status: 503 });
    expect(
      toStudioRuntimeOrpcError({
        err,
        procedure: "autoplay.command",
        fallbackMessage: "autoplay failed",
        ...identity,
      })
    ).toMatchObject({ code: "AUTOPLAY_UNAVAILABLE", status: 503 });
  });
});
