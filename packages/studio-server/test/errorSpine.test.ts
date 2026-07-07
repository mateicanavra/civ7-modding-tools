import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  autoplayStartStopFailed,
  autoplayVerificationFailed,
  daemonIdentityMismatch,
  dependencyUnavailable,
  deployFailed,
  expectedFailureErrorDataSchema,
  failedErrorDataSchema,
  invalidRequest,
  isStudioRuntimeFailure,
  mapStudioFailureToDefinedError,
  mapUnknownToStudioDefinedError,
  materializationFailed,
  operationBlocked,
  operationExpired,
  operationNotFound,
  proofFailed,
  runtimeDisposed,
  type StudioRuntimeFailure,
  statusNotFoundErrorDataSchema,
  unavailableFailureErrorDataSchema,
  unsupportedOperationType,
} from "../src/index";

const identity = {
  serverInstanceId: "studio-server-test",
  serverStartedAt: "2026-06-15T00:00:00.000Z",
};

describe("studio-server error spine", () => {
  test("accepts only constructor-created runtime failures as expected failures", () => {
    const spoofed = {
      _tag: "StudioRuntimeFailure",
      tag: "InvalidRequest",
      reason: "invalid-request",
      message: "spoofed",
      recoveryActions: ["copy-diagnostics"],
    };

    expect(isStudioRuntimeFailure(spoofed)).toBe(false);
    expect(isStudioRuntimeFailure(invalidRequest({ message: "invalid" }))).toBe(true);
    expect(
      mapUnknownToStudioDefinedError({
        err: spoofed,
        procedure: "runInGame.start",
        fallbackMessage: "fallback",
      })
    ).toMatchObject({
      code: "RUN_IN_GAME_FAILED",
      status: 500,
      data: {
        namespace: "runInGame",
        safeFailureCategory: "internal-defect",
      },
    });
  });

  test("keeps every public constructor in parity with the runtime failure guard", () => {
    const failures: StudioRuntimeFailure[] = [
      operationBlocked({ message: "blocked", activeRequestId: "save-0" }),
      invalidRequest({ message: "invalid" }),
      invalidRequest({ message: "path rejected", reason: "path-jail-rejection" }),
      operationNotFound({ message: "missing", requestId: "run-1" }),
      operationExpired({ message: "expired", requestId: "run-1" }),
      daemonIdentityMismatch({ message: "wrong daemon", requestId: "run-1" }),
      runtimeDisposed({ message: "disposed" }),
      unsupportedOperationType({ message: "unsupported", operationType: "legacy" }),
      dependencyUnavailable({ message: "direct control unavailable" }),
      dependencyUnavailable({ message: "restart failed", reason: "restart-failed" }),
      dependencyUnavailable({ message: "restart unsupported", reason: "restart-unsupported" }),
      materializationFailed({ message: "materialization proof missing" }),
      deployFailed({ message: "deploy failed" }),
      deployFailed({ message: "save failed", reason: "save-failed" }),
      deployFailed({ message: "rollback failed", reason: "rollback-failed" }),
      proofFailed({ message: "setup row missing", reason: "setup-row-unavailable" }),
      proofFailed({ message: "game start failed", reason: "start-game-failed" }),
      proofFailed({ message: "log proof missing", reason: "log-proof-missing" }),
      proofFailed({ message: "authorship mismatch", reason: "exact-authorship-mismatch" }),
      proofFailed({ message: "timeout uncertain", reason: "timeout-uncertain" }),
      autoplayStartStopFailed({ message: "start failed", reason: "start-failed" }),
      autoplayStartStopFailed({ message: "stop failed", reason: "stop-failed" }),
      autoplayVerificationFailed({ message: "verification failed" }),
    ];

    for (const failure of failures) {
      expect(isStudioRuntimeFailure(failure), `${failure.tag}:${failure.reason}`).toBe(true);
      expect(
        mapUnknownToStudioDefinedError({
          err: failure,
          procedure:
            failure.tag === "OperationNotFound" ||
            failure.tag === "OperationExpired" ||
            failure.tag === "DaemonIdentityMismatch"
              ? "runInGame.status"
              : "runInGame.start",
          fallbackMessage: "fallback",
          identity,
        }).data
      ).not.toMatchObject({ tag: "UnexpectedDefect" });
    }
  });

  test("maps lifecycle misses by procedure surface instead of namespace only", () => {
    const expired = operationExpired({ message: "expired", requestId: "run-1" });
    const mismatch = daemonIdentityMismatch({ message: "wrong daemon", requestId: "save-1" });

    expect(
      mapStudioFailureToDefinedError({
        failure: expired,
        procedure: "runInGame.status",
        identity,
      })
    ).toMatchObject({
      code: "RUN_IN_GAME_STATUS_NOT_FOUND",
      status: 404,
      data: {
        requestId: "run-1",
        serverInstanceId: identity.serverInstanceId,
        serverStartedAt: identity.serverStartedAt,
      },
    });
    expect(
      mapStudioFailureToDefinedError({
        failure: expired,
        procedure: "runInGame.start",
        identity,
      })
    ).toMatchObject({ code: "RUN_IN_GAME_INVALID", status: 400 });
    expect(
      mapStudioFailureToDefinedError({
        failure: mismatch,
        procedure: "saveDeploy.status",
        identity,
      })
    ).toMatchObject({
      code: "SAVE_DEPLOY_STATUS_NOT_FOUND",
      status: 404,
      data: {
        requestId: "save-1",
        serverInstanceId: identity.serverInstanceId,
        serverStartedAt: identity.serverStartedAt,
      },
    });
    expect(
      mapStudioFailureToDefinedError({
        failure: mismatch,
        procedure: "saveDeploy.start",
        identity,
      })
    ).toMatchObject({ code: "SAVE_DEPLOY_INVALID", status: 400 });
  });

  test("requires daemon identity and request id for status-not-found projections", () => {
    const missing = operationNotFound({ message: "missing", requestId: "run-1" });

    expect(() =>
      mapStudioFailureToDefinedError({
        failure: missing,
        procedure: "runInGame.status",
      })
    ).toThrow(/requires daemon identity/);
    expect(() =>
      mapStudioFailureToDefinedError({
        failure: operationExpired({ message: "expired" }),
        procedure: "runInGame.status",
        identity,
      })
    ).toThrow(/requires a request id/);
  });

  test("rejects status-only not-found failures on start and immediate procedures", () => {
    const missing = operationNotFound({ message: "missing", requestId: "run-1" });

    expect(() =>
      mapStudioFailureToDefinedError({
        failure: missing,
        procedure: "runInGame.start",
        identity,
      })
    ).toThrow(/OperationNotFound can only be mapped by status procedures/);
    expect(() =>
      mapStudioFailureToDefinedError({
        failure: missing,
        procedure: "saveDeploy.start",
        identity,
      })
    ).toThrow(/OperationNotFound can only be mapped by status procedures/);
    expect(() =>
      mapStudioFailureToDefinedError({
        failure: missing,
        procedure: "autoplay.command",
        identity,
      })
    ).toThrow(/OperationNotFound can only be mapped by status procedures/);
  });

  test("keeps declared error data schemas family-specific", () => {
    const invalidPayload = mapStudioFailureToDefinedError({
      failure: invalidRequest({ message: "bad input" }),
      procedure: "saveDeploy.start",
      identity,
    }).data;
    const unavailablePayload = mapStudioFailureToDefinedError({
      failure: dependencyUnavailable({
        message: "tuner unavailable",
        dependency: "direct-control",
        directControlCode: "response-timeout",
      }),
      procedure: "saveDeploy.start",
      identity,
    }).data;
    const statusPayload = mapStudioFailureToDefinedError({
      failure: operationNotFound({ message: "missing", requestId: "save-1" }),
      procedure: "saveDeploy.status",
      identity,
    }).data;
    const defectPayload = mapUnknownToStudioDefinedError({
      err: new Error("boom"),
      procedure: "saveDeploy.start",
      fallbackMessage: "fallback",
    }).data;

    expect(Value.Check(expectedFailureErrorDataSchema, invalidPayload)).toBe(true);
    expect(Value.Check(unavailableFailureErrorDataSchema, unavailablePayload)).toBe(true);
    expect(Value.Check(statusNotFoundErrorDataSchema, statusPayload)).toBe(true);
    expect(Value.Check(failedErrorDataSchema, defectPayload)).toBe(true);

    expect(Value.Check(expectedFailureErrorDataSchema, unavailablePayload)).toBe(false);
    expect(Value.Check(expectedFailureErrorDataSchema, statusPayload)).toBe(false);
    expect(Value.Check(expectedFailureErrorDataSchema, defectPayload)).toBe(false);
    expect(Value.Check(unavailableFailureErrorDataSchema, invalidPayload)).toBe(false);
    expect(Value.Check(unavailableFailureErrorDataSchema, statusPayload)).toBe(false);
    expect(Value.Check(statusNotFoundErrorDataSchema, invalidPayload)).toBe(false);
    expect(Value.Check(statusNotFoundErrorDataSchema, unavailablePayload)).toBe(false);
    expect(Value.Check(statusNotFoundErrorDataSchema, defectPayload)).toBe(false);

    expect(
      Value.Check(expectedFailureErrorDataSchema, {
        ...invalidPayload,
        reason: "active-operation-conflict",
      })
    ).toBe(false);
    expect(
      Value.Check(failedErrorDataSchema, {
        tag: "DeployFailed",
        reason: "timeout-uncertain",
        namespace: "saveDeploy",
        message: "timeout",
        recoveryActions: ["copy-diagnostics"],
      })
    ).toBe(false);
    expect(
      Value.Check(failedErrorDataSchema, {
        tag: "AutoplayStartStopFailed",
        reason: "start-game-failed",
        namespace: "autoplay",
        message: "wrong family",
        recoveryActions: ["copy-diagnostics"],
      })
    ).toBe(false);
    expect(
      Value.Check(unavailableFailureErrorDataSchema, {
        ...unavailablePayload,
        tag: "RuntimeDisposed",
        reason: "direct-control-unavailable",
      })
    ).toBe(false);
    expect(
      Value.Check(statusNotFoundErrorDataSchema, {
        ...statusPayload,
        tag: "OperationNotFound",
        reason: "expired-operation",
      })
    ).toBe(false);
    expect(
      Value.Check(expectedFailureErrorDataSchema, {
        tag: "OperationNotFound",
        reason: "status-not-found",
        namespace: "runInGame",
        message: "missing",
        recoveryActions: ["retry-status", "copy-diagnostics"],
        requestId: "run-1",
      })
    ).toBe(false);
    expect(
      Value.Check(statusNotFoundErrorDataSchema, {
        tag: "OperationNotFound",
        reason: "status-not-found",
        namespace: "runInGame",
        message: "missing",
        recoveryActions: ["retry-status", "copy-diagnostics"],
        requestId: "run-1",
        serverInstanceId: identity.serverInstanceId,
        serverStartedAt: identity.serverStartedAt,
      })
    ).toBe(true);
  });
});
