import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7PlayNotificationViewProcedureDescriptor,
  Civ7PlayNotificationViewProcedureSchemaArtifacts,
  callCiv7PlayNotificationViewProcedure,
  getCiv7PlayNotificationView,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type PlayNotificationViewDependencies,
} from "../src/index";

describe("Civ7 play-notification view procedure descriptor", () => {
  test("records the notification read atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(
      Civ7PlayNotificationViewProcedureDescriptor
    );
    expect(summary).toMatchObject({
      procedureKey: "notifications.view",
      family: "notifications",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/notifications/view.ts",
      atomFunction: "getCiv7PlayNotificationView",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7PlayNotificationView.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7PlayNotificationViewProcedureDescriptor,
      Civ7PlayNotificationViewProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7PlayNotificationViewProcedureDescriptor.inputFields)
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7PlayNotificationViewProcedureDescriptor.outputFields)
    );
    expect(Value.Check(resolved.inputSchema, { maxNotifications: 12 })).toBe(true);
    expect(Value.Check(resolved.inputSchema, { maxNotifications: 101 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "readPlayNotifications()" })).toBe(
      false
    );
    expect(Value.Check(resolved.outputSchema, playNotificationViewResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...playNotificationViewResult(),
        rawCommand: "readPlayNotifications()",
      })
    ).toBe(false);
  });

  test("calls the notification view atom through the procedure core without touching the live tuner", async () => {
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const dependencies: PlayNotificationViewDependencies = {
      executeAppUiCommand: async (options) => {
        executeCalls.push({
          host: options.host,
          port: options.port,
          command: options.command,
        });
        return {
          host: options.host ?? "127.0.0.1",
          port: options.port ?? 4318,
          state: { id: "65535", name: "App UI" },
          output: ["{}"],
        };
      },
      parsePlayNotificationView: () => playNotificationViewResult(12),
    };

    const result = await callCiv7PlayNotificationViewProcedure(
      {
        maxNotifications: 12,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "notifications-view-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(playNotificationViewResult(12));
    expect(result.diagnostics).toMatchObject({
      procedureKey: "notifications.view",
      correlationId: "notifications-view-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readPlayNotifications");
    expect(executeCalls[0]?.command).toContain('"maxNotifications":12');
  });

  test("rejects invalid procedure input before notification atom dependencies run", async () => {
    let executed = false;
    const dependencies: PlayNotificationViewDependencies = {
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parsePlayNotificationView: () => playNotificationViewResult(),
    };

    await expect(
      callCiv7PlayNotificationViewProcedure(
        { maxNotifications: 101 },
        {
          procedure: { correlationId: "notifications-view-invalid-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "notifications.view",
        role: "input",
      },
    });
    await expect(
      callCiv7PlayNotificationViewProcedure(
        {
          host: "127.0.0.1",
        } as never,
        {
          procedure: { correlationId: "notifications-view-context-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "notifications.view",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function playNotificationViewResult(maxNotifications = 25) {
  const notificationId = { owner: 0, id: 42, type: 20 };
  const cityId = { owner: 0, id: 131073, type: 1 };
  const requiredInputs = [
    { name: "City", source: "notification target or selected city", required: true },
    { name: "Type", source: "live town focus option", required: true },
    { name: "ProjectType", source: "live town focus option", required: true },
  ];
  const commonActions = [
    {
      label: "Set town focus",
      operationFamily: "city-command",
      operationType: "CHANGE_GROWTH_MODE",
      argsShape: "{ Type, ProjectType, City }",
      when: "after choosing a live town focus option",
    },
  ];
  const notes = [
    "Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface.",
  ];
  const decision = {
    category: "town-focus",
    operationFamily: "city-command",
    operationType: "CHANGE_GROWTH_MODE",
    requiredInputs,
    commonActions,
    confidence: "live-proof" as const,
    notes,
  };
  const notification = {
    id: notificationId,
    type: -123,
    typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
    groupType: null,
    player: 0,
    summary: "Choose Town Project",
    message: "Choose a town focus project",
    target: cityId,
    location: null,
    canUserDismiss: false,
    expired: false,
    dismissed: false,
    isEndTurnBlocking: true,
    decision,
  };

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 80 },
    turnDate: { ok: true, value: "2025 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: -2026570723 },
    blockingNotificationId: { ok: true, value: notificationId },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: cityId },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [notification],
    decisions: [decision],
    hud: {
      nextDecision: {
        notificationId,
        isEndTurnBlocking: true,
        typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
        summary: "Choose Town Project",
        message: "Choose a town focus project",
        target: cityId,
        location: null,
        player: 0,
        category: "town-focus",
        operationFamily: "city-command",
        operationType: "CHANGE_GROWTH_MODE",
        requiredInputs,
        commonActions,
        notes,
      },
      decisionQueue: [],
    },
    limits: {
      maxNotifications,
      truncated: false,
    },
  };
}
