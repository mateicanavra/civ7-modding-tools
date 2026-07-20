import { describe, expect, test } from "vitest";

import { requestCiv7FirstMeetResponse } from "../src/index";
import type { Civ7PlayNotificationViewResult } from "../src/play/notifications/view";
import type { Civ7OperationRequestResult } from "../src/play/operations/validate-request";

describe("first-meet response requests", () => {
  test("records source-owned first-meet blocker clearance proof", async () => {
    const reads = [
      firstMeetNotificationView("first-meet"),
      firstMeetNotificationView("ready-unit"),
    ];
    const operation = operationResult({ sent: true });

    const result = await requestCiv7FirstMeetResponse(
      { playerId: 0, metPlayerId: 2, responseType: 673_478_009 },
      { timeoutMs: 1_000 },
      {
        validatePlayerId: (playerId) => {
          if (!Number.isInteger(playerId)) throw new Error("invalid player");
        },
        getPlayNotificationView: async () =>
          reads.shift() ?? firstMeetNotificationView("ready-unit"),
        requestPlayerOperation: async (input) => {
          expect(input).toEqual({
            playerId: 0,
            operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
            args: { Player1: 0, Player2: 2, Type: 673_478_009 },
          });
          return operation;
        },
        invalidResponseTypeError: () => {
          throw new Error("invalid response");
        },
      }
    );

    expect(result.sent).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.beforeValidation.valid).toBe(true);
    expect(result.afterValidation.valid).toBe(true);
    expect(result.postcondition).toMatchObject({
      classification: "first-meet-cleared",
      reason: "The matching first-meet notification is no longer end-turn-blocking.",
    });
  });

  test("keeps sticky first-meet blockers unverified after a send", async () => {
    const result = await requestCiv7FirstMeetResponse(
      { playerId: 0, metPlayerId: 2, responseType: 673_478_009 },
      { timeoutMs: 1_000 },
      {
        validatePlayerId: () => {},
        getPlayNotificationView: async () => firstMeetNotificationView("first-meet"),
        requestPlayerOperation: async () => operationResult({ sent: true }),
        invalidResponseTypeError: () => {
          throw new Error("invalid response");
        },
      }
    );

    expect(result.sent).toBe(true);
    expect(result.verified).toBe(false);
    expect(result.postcondition).toMatchObject({
      classification: "first-meet-sticky-blocker",
      reason:
        "The first-meet operation returned, but the same first-meet notification still blocks turn flow.",
    });
  });

  test("projects validator-blocked first-meet requests as not-sent", async () => {
    const result = await requestCiv7FirstMeetResponse(
      { playerId: 0, metPlayerId: 2, responseType: 673_478_009 },
      { timeoutMs: 1_000 },
      {
        validatePlayerId: () => {},
        getPlayNotificationView: async () => firstMeetNotificationView("first-meet"),
        requestPlayerOperation: async () => operationResult({ sent: false, valid: false }),
        invalidResponseTypeError: () => {
          throw new Error("invalid response");
        },
      }
    );

    expect(result.sent).toBe(false);
    expect(result.verified).toBe(false);
    expect(result.after).toBe(result.before);
    expect(result.postcondition).toMatchObject({
      classification: "not-sent",
      reason: "The first-meet response was not sent, so no postcondition can be verified.",
    });
  });
});

function operationResult(
  options: Readonly<{ sent: boolean; valid?: boolean }>
): Civ7OperationRequestResult {
  const valid = options.valid ?? true;
  return {
    before: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      family: "player-operation",
      operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
      enumValue: "RESPOND_DIPLOMATIC_FIRST_MEET",
      target: { playerId: 0 },
      args: { Player1: 0, Player2: 2, Type: 673_478_009 },
      valid,
      result: { Success: valid },
    },
    after: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner" },
      family: "player-operation",
      operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
      enumValue: "RESPOND_DIPLOMATIC_FIRST_MEET",
      target: { playerId: 0 },
      args: { Player1: 0, Player2: 2, Type: 673_478_009 },
      valid,
      result: { Success: valid },
    },
    sent: options.sent,
    verified: options.sent && valid,
  };
}

function firstMeetNotificationView(
  mode: "first-meet" | "ready-unit"
): Civ7PlayNotificationViewResult {
  const decision = {
    category: "first-meet-diplomacy",
    operationFamily: "player-operation",
    operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
    argsShape: "{ Player1, Player2, Type }",
    requiredInputs: [],
    commonActions: [],
    confidence: "official-ui",
    notes: [],
  } satisfies Civ7PlayNotificationViewResult["decisions"][number];
  const notification = {
    id: { owner: 0, id: 44, type: 20 },
    type: 44,
    typeName: "NOTIFICATION_PLAYER_MET",
    groupType: null,
    summary: "You have met Ashoka, World Renouncer of Mauryan Empire.",
    message: "You have met a new Civilization",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: 4, y: 2 },
    player: 2,
    canUserDismiss: false,
    expired: false,
    dismissed: false,
    isEndTurnBlocking: true,
    decision,
    details: { player2: 2 },
  } satisfies Civ7PlayNotificationViewResult["notifications"][number];
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 27 },
    turnDate: { ok: true, value: "3350 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: mode === "first-meet" ? 523_279_636 : 0 },
    blockingNotificationId: {
      ok: true,
      value: mode === "first-meet" ? notification.id : null,
    },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: mode === "first-meet" ? [notification] : [],
    decisions: mode === "first-meet" ? [decision] : [],
    hud: { nextDecision: null, decisionQueue: [] },
    limits: { maxNotifications: 25, truncated: false },
  };
}
