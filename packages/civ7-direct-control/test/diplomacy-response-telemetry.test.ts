import { describe, expect, test } from "vitest";
import type { Civ7ComponentId } from "../src/civ7-component-id";
import type { Civ7PlayNotificationViewResult } from "../src/play/notifications/view";
import type { Civ7DiplomacyResponsePostcondition } from "../src/play/operations/diplomacy-postconditions";
import type { Civ7DiplomacyResponseResult } from "../src/play/operations/diplomacy-request";
import type { Civ7OperationValidationResult } from "../src/play/operations/types";
import {
  type Civ7DiplomacyResponseTelemetryAdapterInput,
  createCiv7DiplomacyResponseTelemetryRecord,
} from "../src/proof/diplomacy-response-telemetry";
import { summarizeCiv7OperationProofTelemetry } from "../src/proof/operation-telemetry";

describe("diplomacy-response telemetry adapter", () => {
  test("adapts a confirmed diplomacy response into separated operation telemetry", () => {
    const record = createCiv7DiplomacyResponseTelemetryRecord(
      diplomacyTelemetryInput({
        result: diplomacyResponseResult({
          sent: true,
          verified: true,
          postcondition: diplomacyPostcondition("turn-unblocked"),
          after: notificationView({
            canEndTurn: { ok: true, value: true },
            notifications: [],
          }),
        }),
      })
    );

    expect(record.candidateAction).toMatchObject({
      id: "diplomacy-response:0:8821:-1713616684",
      risk: "mutation",
    });
    expect(record.operationFamily).toBe("player-operation");
    expect(record.validation_pre?.value).toMatchObject({
      valid: true,
      operationType: "RESPOND_DIPLOMATIC_ACTION",
    });
    expect(record.send_receipt).toMatchObject({
      status: "sent",
      requestFamily: "player-operation",
    });
    expect(record.post_read?.value).toMatchObject({
      afterCanEndTurn: { ok: true, value: true },
    });
    expect(record.validation_post?.value).toMatchObject({
      valid: true,
      operationType: "RESPOND_DIPLOMATIC_ACTION",
      postconditionClassification: "turn-unblocked",
    });
    expect(record.postcondition).toEqual({
      classification: "turn-unblocked",
      reason: "The response and UI closeout left the turn unblocked.",
      outcome: "cleared",
      noRepeatAfterUnverified: false,
      confidence: "confirmed",
    });
    expect(record.postcondition).not.toHaveProperty("verified");
    expect(record.outcome_delta?.value).toMatchObject({
      classification: "turn-unblocked",
      afterCanEndTurn: { ok: true, value: true },
    });

    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      operationFamily: "player-operation",
      actionId: "diplomacy-response:0:8821:-1713616684",
      status: "sent-confirmed",
      postconditionClassification: "turn-unblocked",
      noRepeatAfterUnverified: false,
      proofBoundary: "local-test-proof",
    });
  });

  test("does not treat a legacy verified boolean as confirmed postcondition proof", () => {
    const record = createCiv7DiplomacyResponseTelemetryRecord(
      diplomacyTelemetryInput({
        result: diplomacyResponseResult({
          sent: true,
          verified: true,
          postcondition: undefined,
        }),
      })
    );

    expect(record.postcondition).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "missing-postcondition",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps validator-blocked diplomacy responses no-repeat guarded", () => {
    const validation = validationResult({ valid: false, result: { FailureReasons: ["blocked"] } });
    const record = createCiv7DiplomacyResponseTelemetryRecord(
      diplomacyTelemetryInput({
        result: diplomacyResponseResult({
          beforeValidation: validation,
          afterValidation: validation,
          sent: false,
          verified: false,
          postcondition: diplomacyPostcondition("not-sent"),
        }),
      })
    );

    expect(record.send_receipt).toMatchObject({
      status: "not-attempted",
      requestFamily: "player-operation",
    });
    expect(record.postcondition).toMatchObject({
      classification: "not-sent",
      outcome: "not-sent",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "validation-blocked",
      postconditionClassification: "not-sent",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps no-state-change sends no-repeat guarded", () => {
    const record = createCiv7DiplomacyResponseTelemetryRecord(
      diplomacyTelemetryInput({
        result: diplomacyResponseResult({
          sent: true,
          verified: false,
          postcondition: diplomacyPostcondition("no-state-change"),
        }),
      })
    );

    expect(record.postcondition).toMatchObject({
      classification: "no-state-change",
      outcome: "no-state-change",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "no-state-change",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps validation-changed sends no-repeat guarded", () => {
    const record = createCiv7DiplomacyResponseTelemetryRecord(
      diplomacyTelemetryInput({
        result: diplomacyResponseResult({
          sent: true,
          verified: true,
          postcondition: diplomacyPostcondition("validation-changed"),
        }),
      })
    );

    expect(record.postcondition).toMatchObject({
      classification: "validation-changed",
      outcome: "still-blocked",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "validation-changed",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps pending runtime proof sends no-repeat guarded", () => {
    const record = createCiv7DiplomacyResponseTelemetryRecord(
      diplomacyTelemetryInput({
        proofBoundary: "pending-runtime-proof",
        result: diplomacyResponseResult({
          sent: true,
          verified: true,
          postcondition: diplomacyPostcondition("diplomacy-blocker-cleared"),
        }),
      })
    );

    expect(record.postcondition).toMatchObject({
      classification: "diplomacy-blocker-cleared",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "pending-runtime-proof",
      postconditionClassification: "diplomacy-blocker-cleared",
      noRepeatAfterUnverified: true,
      proofBoundary: "pending-runtime-proof",
    });
  });
});

function diplomacyTelemetryInput(
  overrides: Partial<Civ7DiplomacyResponseTelemetryAdapterInput> = {}
): Civ7DiplomacyResponseTelemetryAdapterInput {
  return {
    input: {
      playerId: 0,
      actionId: 8821,
      responseType: -1713616684,
      notificationId: notificationId(),
    },
    result: diplomacyResponseResult(),
    source: "diplomacy-response-telemetry.test.ts",
    ...overrides,
  };
}

function diplomacyResponseResult(
  overrides: Partial<Civ7DiplomacyResponseResult> = {}
): Civ7DiplomacyResponseResult {
  const beforeValidation = validationResult();
  const afterValidation = validationResult();
  return {
    before: notificationView(),
    beforeValidation,
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      command: "diplomacy response closeout test command",
      output: ["{}"],
    },
    payload: {
      localPlayerId: 0,
      playerId: 0,
      actionId: 8821,
      responseType: -1713616684,
      args: { ID: 8821, Type: -1713616684 },
      notificationId: notificationId(),
      discoveredNotification: notificationId(),
      activated: true,
      activationResult: { ok: true, value: { activated: true } },
      canStart: { ok: true, value: { Success: true } },
      sent: true,
      sendResult: { ok: true, value: true },
      uiCloseout: {
        requested: true,
        acknowledgeStarted: { ok: true, value: true },
        closeCurrentDiplomacyProject: { ok: true, value: true },
        hide: { ok: true, value: true },
      },
      diplomacyState: {
        before: { isShowing: true },
        after: { isShowing: false },
      },
      notes: [],
    },
    after: notificationView({ notifications: [] }),
    afterValidation,
    sent: true,
    verified: true,
    postcondition: diplomacyPostcondition("diplomacy-blocker-cleared"),
    ...overrides,
  } as Civ7DiplomacyResponseResult;
}

function diplomacyPostcondition(
  classification: Civ7DiplomacyResponsePostcondition["classification"]
): Civ7DiplomacyResponsePostcondition {
  const reasons: Record<Civ7DiplomacyResponsePostcondition["classification"], string> = {
    "not-sent": "The diplomatic response was not sent, so no postcondition can be verified.",
    "turn-unblocked": "The response and UI closeout left the turn unblocked.",
    "diplomacy-blocker-cleared":
      "The matching diplomatic-response notification is no longer present as a blocking decision.",
    "blocking-notification-changed":
      "The end-turn blocking notification changed after the response closeout.",
    "validation-changed":
      "The response validator changed after the send, but the notification/turn state did not clearly clear.",
    "no-state-change":
      "The response was sent, but notification, turn-blocking, and validator state did not change; use stale-blocker diagnostics instead of repeating blindly.",
  };
  return {
    classification,
    reason: reasons[classification],
  };
}

function validationResult(
  overrides: Partial<Civ7OperationValidationResult> = {}
): Civ7OperationValidationResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    family: "player-operation",
    operationType: "RESPOND_DIPLOMATIC_ACTION",
    enumValue: "RESPOND_DIPLOMATIC_ACTION",
    target: { playerId: 0 },
    args: { ID: 8821, Type: -1713616684 },
    valid: true,
    result: { Success: true },
    ...overrides,
  };
}

function notificationView(
  overrides: Partial<Civ7PlayNotificationViewResult> = {}
): Civ7PlayNotificationViewResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true, value: 2 },
    turnDate: { ok: true, value: "3975 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: 1 },
    blockingNotificationId: { ok: true, value: notificationId() },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [
      {
        id: notificationId(),
        type: 1,
        typeName: "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED",
        groupType: null,
        player: 0,
        summary: "Diplomatic response required",
        message: "Choose a response.",
        target: { id: 8821 },
        location: null,
        canUserDismiss: false,
        expired: false,
        dismissed: false,
        isEndTurnBlocking: true,
        decision: {
          category: "diplomacy-response",
          operationFamily: "player-operation",
          operationType: "RESPOND_DIPLOMATIC_ACTION",
          argsShape: "{ ID, Type }",
          requiredInputs: [],
          commonActions: [],
          confidence: "official-ui",
          notes: [],
        },
      },
    ],
    decisions: [],
    hud: {
      nextDecision: null,
      decisionQueue: [],
    },
    limits: {
      maxNotifications: 25,
      truncated: false,
    },
    ...overrides,
  };
}

function notificationId(): Civ7ComponentId {
  return { owner: 0, id: 44, type: 20 };
}
