import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7NotificationDismissRequestInputSchema,
  Civ7NotificationDismissRequestProcedureDescriptor,
  Civ7NotificationDismissRequestProcedureSchemaArtifacts,
  Civ7NotificationDismissalResultSchema,
  callCiv7NotificationDismissRequestProcedure,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type Civ7ActionApproval,
  type Civ7NotificationDismissInput,
  type Civ7NotificationDismissalResult,
  type Civ7NotificationDismissalSummary,
} from "../src/index";

describe("Civ7 notification dismissal request procedure descriptor", () => {
  test("records approved notification dismissal mutation gates and resolves schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7NotificationDismissRequestProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "notifications.dismiss.request",
      family: "notifications",
      risk: "mutation",
      atomOwner: "packages/civ7-direct-control/src/play/notifications/dismissal-request.ts",
      atomFunction: "requestCiv7NotificationDismissal",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "proof-diagnostic-projection",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "effect-orpc-middleware-hook",
      mutationGates: {
        approvalGate: true,
        validatorFirst: true,
        postconditionRequired: true,
        noRepeatAfterUnverified: true,
      },
    });

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7NotificationDismissRequestProcedureDescriptor,
      Civ7NotificationDismissRequestProcedureSchemaArtifacts,
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7NotificationDismissRequestProcedureDescriptor.inputFields),
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7NotificationDismissRequestProcedureDescriptor.outputFields),
    );
    expect(Civ7NotificationDismissRequestProcedureDescriptor.outputFields).not.toContain("command");
    expect(Value.Check(resolved.inputSchema, {
      notificationId: { owner: 0, id: 113, type: 20 },
      approvalReason: "test approved notification dismissal",
    })).toBe(true);
    expect(Value.Check(resolved.inputSchema, {
      notificationId: { owner: 0, type: 20 },
      approvalReason: "x",
    })).toBe(false);
    expect(Value.Check(resolved.inputSchema, {
      notificationId: { owner: 0, id: 113, type: 20 },
    })).toBe(false);
    expect(Value.Check(resolved.inputSchema, {
      notificationId: { owner: 0, id: 113, type: 20 },
      approvalReason: "x",
      rawCommand: "Game.Notifications.dismiss(...)",
    })).toBe(false);
    expect(Value.Check(resolved.inputSchema, {
      notificationId: { owner: 0, id: 113, type: 20 },
      approvalReason: "x",
      state: { role: "app-ui" },
    })).toBe(false);
    expect(Value.Check(resolved.outputSchema, notificationDismissalResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, guardedNotificationDismissalResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, {
      ...notificationDismissalResult(),
      command: {
        host: "127.0.0.1",
        port: 4318,
        state: { id: "65535", name: "App UI" },
        output: ["{}"],
      },
    })).toBe(false);
    expect(Value.Check(Civ7NotificationDismissalResultSchema, {
      ...notificationDismissalResult(),
      rawCommand: "Game.Notifications.dismiss(...)",
    })).toBe(false);
  });

  test("calls the approved notification dismissal atom through the procedure core", async () => {
    const calls: Array<{
      input: Civ7NotificationDismissInput;
      host?: string;
      port?: number;
      approval: Civ7ActionApproval;
    }> = [];

    const result = await callCiv7NotificationDismissRequestProcedure({
      notificationId: { owner: 0, id: 113, type: 20 },
      approvalReason: "test approved notification dismissal",
      disposableSession: true,
    }, {
      directControl: {
        host: "127.0.0.1",
        port: 4318,
      },
      procedure: {
        correlationId: "notification-dismissal-procedure-test",
      },
      request: async (input, options, approval) => {
        calls.push({
          input,
          host: options.host,
          port: options.port,
          approval,
        });
        return notificationDismissalResult();
      },
    });

    expect(result.output).toEqual(notificationDismissalResult());
    expect(result.output).not.toHaveProperty("command");
    expect(result.diagnostics).toMatchObject({
      procedureKey: "notifications.dismiss.request",
      correlationId: "notification-dismissal-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "agent-slot-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: true,
    });
    expect(calls).toEqual([{
      input: {
        notificationId: { owner: 0, id: 113, type: 20 },
      },
      host: "127.0.0.1",
      port: 4318,
      approval: {
        approved: true,
        reason: "test approved notification dismissal",
        disposableSession: true,
      },
    }]);
  });

  test("rejects invalid procedure input before request dependencies run", async () => {
    let requested = false;

    for (const input of [
      { notificationId: { owner: 0, type: 20 }, approvalReason: "x" },
      { notificationId: { owner: 0, id: 113, type: 20 } },
      {
        notificationId: { owner: 0, id: 113, type: 20 },
        approvalReason: "x",
        command: "Game.Notifications.dismiss(...)",
      },
    ]) {
      await expect(callCiv7NotificationDismissRequestProcedure(input as never, {
        procedure: { correlationId: "notification-dismissal-invalid-input" },
        request: async () => {
          requested = true;
          throw new Error("request should not run after procedure input rejection");
        },
      })).rejects.toMatchObject({
        code: "procedure-descriptor-invalid",
        details: {
          reason: "input-schema-invalid",
          procedureKey: "notifications.dismiss.request",
          role: "input",
        },
      });
    }
    expect(requested).toBe(false);
  });

  test("requires caller-provided correlation before mutation handler execution", async () => {
    let requested = false;
    await expect(callCiv7NotificationDismissRequestProcedure({
      notificationId: { owner: 0, id: 113, type: 20 },
      approvalReason: "test approved notification dismissal",
    }, {
      request: async () => {
        requested = true;
        return notificationDismissalResult();
      },
    })).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "correlation-id-missing",
        procedureKey: "notifications.dismiss.request",
      },
    });
    expect(requested).toBe(false);
  });
});

function notificationDismissalResult(): Civ7NotificationDismissalResult {
  const before = notificationSummary("before");
  const after = notificationSummary("after-cleared");
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    notificationId: { owner: 0, id: 113, type: 20 },
    before,
    after,
    canDismiss: true,
    sent: true,
    result: {
      notificationTrainManager: {
        ok: true,
        attempted: true,
        available: true,
        path: "NotificationModel.manager.dismiss",
        value: true,
      },
    },
    closeoutPath: "NotificationModel.manager.dismiss",
    verificationAttempts: [before, after],
    verified: true,
    postcondition: {
      classification: "notification-disappeared",
      reason: "The target notification no longer exists after dismissal.",
    },
    notes: [
      "Verification is identity-based.",
    ],
  };
}

function guardedNotificationDismissalResult(): Civ7NotificationDismissalResult {
  const before = notificationSummary("before");
  const after = notificationSummary("after-still-front");
  return {
    ...notificationDismissalResult(),
    after,
    verificationAttempts: [before, after],
    verified: false,
    postcondition: {
      classification: "engine-front-still-live",
      reason: "The target notification still fronts the engine queue, so weaker dismissed/train evidence is treated as stale.",
    },
  };
}

function notificationSummary(
  phase: "before" | "after-cleared" | "after-still-front",
): Civ7NotificationDismissalSummary {
  const notificationId = phase === "after-cleared" ? null : { owner: 0, id: 113, type: 20 };
  const exists = phase !== "after-cleared";
  const stillFront = phase === "before" || phase === "after-still-front";
  return {
    id: notificationId,
    exists,
    type: 88,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    summary: "Wonder completed",
    message: "Review notification",
    target: { owner: 0, id: 65536, type: 1 },
    location: { x: 22, y: 31 },
    canUserDismiss: true,
    expired: false,
    dismissed: phase === "after-still-front",
    blocksTurnAdvancement: { ok: true, value: stillFront },
    endTurnBlockingType: { ok: true, value: stillFront ? 14 : 0 },
    isEndTurnBlocking: { ok: true, value: stillFront },
    engineQueueCount: { ok: true, value: stillFront ? 1 : 0 },
    engineQueueContains: { ok: true, value: stillFront },
    engineQueueFirstId: { ok: true, value: notificationId },
    isEngineQueueFront: { ok: true, value: stillFront },
    notificationTrainCount: { ok: true, value: stillFront ? 1 : 0 },
    notificationTrainContains: { ok: true, value: stillFront },
    notificationTrainFirstId: { ok: true, value: notificationId },
    isNotificationTrainFront: { ok: true, value: stillFront },
  };
}
