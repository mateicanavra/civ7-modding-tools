import { describe, expect, test } from "vitest";

import {
  createCiv7NarrativeChoiceTelemetryRecord,
  type Civ7NarrativeChoiceTelemetryAdapterInput,
} from "../src/proof/narrative-choice-telemetry";
import { summarizeCiv7OperationProofTelemetry } from "../src/proof/operation-telemetry";

import type { Civ7ComponentId } from "../src/civ7-component-id";
import type { Civ7NarrativeChoiceResult } from "../src/play/operations/narrative-request";
import type {
  Civ7NarrativeChoicePostcondition,
  Civ7NarrativeChoicePostconditionClassification,
} from "../src/play/operations/narrative-postconditions";
import type { Civ7OperationValidationResult } from "../src/play/operations/types";
import type { Civ7PlayNotificationViewResult } from "../src/play/notifications/view";

describe("narrative-choice telemetry adapter", () => {
  test("adapts a confirmed narrative choice into separated operation telemetry", () => {
    const record = createCiv7NarrativeChoiceTelemetryRecord(narrativeTelemetryInput({
      result: narrativeChoiceResult({
        sent: true,
        verified: true,
        postcondition: narrativePostcondition("turn-unblocked"),
        after: notificationView({
          canEndTurn: { ok: true, value: true },
          notifications: [],
        }),
      }),
    }));

    expect(record.candidateAction).toMatchObject({
      id: "narrative-choice:0:0:421:24:CLOSE:1",
      risk: "mutation",
    });
    expect(record.operationFamily).toBe("player-operation");
    expect(record.approval.status).toBe("approved");
    expect(record.validation_pre?.value).toMatchObject({
      valid: true,
      operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
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
      operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
      postconditionClassification: "turn-unblocked",
    });
    expect(record.postcondition).toEqual({
      classification: "turn-unblocked",
      reason: "The narrative choice and UI handling left the turn unblocked.",
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
      actionId: "narrative-choice:0:0:421:24:CLOSE:1",
      status: "sent-confirmed",
      postconditionClassification: "turn-unblocked",
      noRepeatAfterUnverified: false,
      proofBoundary: "local-test-proof",
    });
  });

  test("summarizes source-owned narrative panel closeouts as state-changed", () => {
    const record = createCiv7NarrativeChoiceTelemetryRecord(narrativeTelemetryInput({
      result: narrativeChoiceResult({
        sent: true,
        verified: true,
        postcondition: narrativePostcondition("narrative-panel-cleared"),
        after: notificationView({
          blockingNotificationId: { ok: true, value: changedNotificationId() },
          notifications: [narrativeNotification(changedNotificationId())],
        }),
      }),
    }));

    expect(record.postcondition).toMatchObject({
      classification: "narrative-panel-cleared",
      outcome: "state-changed",
      noRepeatAfterUnverified: false,
      confidence: "confirmed",
    });
    expect(record.blocker_delta?.value).toMatchObject({
      classification: "narrative-panel-cleared",
      afterBlockingNotificationId: { ok: true, value: changedNotificationId() },
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-confirmed",
      postconditionClassification: "narrative-panel-cleared",
      noRepeatAfterUnverified: false,
    });
  });

  test("does not treat a legacy verified boolean as confirmed postcondition proof", () => {
    const record = createCiv7NarrativeChoiceTelemetryRecord(narrativeTelemetryInput({
      result: narrativeChoiceResult({
        sent: true,
        verified: true,
        postcondition: undefined,
      }),
    }));

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

  test("keeps validator-blocked narrative choices no-repeat guarded", () => {
    const validation = validationResult({ valid: false, result: { FailureReasons: ["blocked"] } });
    const record = createCiv7NarrativeChoiceTelemetryRecord(narrativeTelemetryInput({
      result: narrativeChoiceResult({
        beforeValidation: validation,
        afterValidation: validation,
        sent: false,
        verified: false,
        postcondition: narrativePostcondition("not-sent"),
      }),
    }));

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
    const record = createCiv7NarrativeChoiceTelemetryRecord(narrativeTelemetryInput({
      result: narrativeChoiceResult({
        sent: true,
        verified: false,
        postcondition: narrativePostcondition("no-state-change"),
      }),
    }));

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
    const record = createCiv7NarrativeChoiceTelemetryRecord(narrativeTelemetryInput({
      result: narrativeChoiceResult({
        sent: true,
        verified: true,
        postcondition: narrativePostcondition("validation-changed"),
      }),
    }));

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
    const record = createCiv7NarrativeChoiceTelemetryRecord(narrativeTelemetryInput({
      proofBoundary: "pending-runtime-proof",
      result: narrativeChoiceResult({
        sent: true,
        verified: true,
        postcondition: narrativePostcondition("narrative-blocker-cleared"),
      }),
    }));

    expect(record.postcondition).toMatchObject({
      classification: "narrative-blocker-cleared",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "pending-runtime-proof",
      postconditionClassification: "narrative-blocker-cleared",
      noRepeatAfterUnverified: true,
      proofBoundary: "pending-runtime-proof",
    });
  });
});

function narrativeTelemetryInput(
  overrides: Partial<Civ7NarrativeChoiceTelemetryAdapterInput> = {}
): Civ7NarrativeChoiceTelemetryAdapterInput {
  return {
    input: {
      playerId: 0,
      targetType: "CLOSE",
      target: storyTargetId(),
      action: 1,
    },
    result: narrativeChoiceResult(),
    approval: {
      required: true,
      status: "approved",
      reason: "test narrative telemetry adapter",
      source: "narrative-choice-telemetry.test.ts",
    },
    source: "narrative-choice-telemetry.test.ts",
    ...overrides,
  };
}

function narrativeChoiceResult(
  overrides: Partial<Civ7NarrativeChoiceResult> = {}
): Civ7NarrativeChoiceResult {
  const beforeValidation = validationResult();
  const afterValidation = validationResult();
  return {
    before: notificationView(),
    beforeValidation,
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      command: "narrative choice closeout test command",
      output: ["{}"],
    },
    payload: {
      localPlayerId: 0,
      playerId: 0,
      args: { TargetType: "CLOSE", Target: storyTargetId(), Action: 1 },
      canStart: { ok: true, value: { Success: true } },
      sent: true,
      sendResult: { ok: true, value: true },
      ui: {
        before: {
          panelCount: 1,
          matchingPanelCount: 1,
          matchingPanels: [{ targetStoryId: storyTargetId(), choiceKeys: ["CLOSE"] }],
          popupShowing: { ok: true, value: true },
        },
        after: {
          panelCount: 0,
          matchingPanelCount: 0,
          matchingPanels: [],
          popupShowing: { ok: true, value: false },
        },
        panelClose: { ok: true, value: { attempted: 1, results: [{ closed: true }] } },
        popupClose: { ok: true, value: { available: true } },
      },
      notes: [],
    },
    after: notificationView({ notifications: [] }),
    afterValidation,
    sent: true,
    verified: true,
    postcondition: narrativePostcondition("narrative-blocker-cleared"),
    ...overrides,
  };
}

function narrativePostcondition(
  classification: Civ7NarrativeChoicePostconditionClassification,
): Civ7NarrativeChoicePostcondition {
  const reasons: Record<Civ7NarrativeChoicePostconditionClassification, string> = {
    "not-sent": "The narrative choice was not sent, either because validation failed before send or the App UI closeout reported no send.",
    "turn-unblocked": "The narrative choice and UI handling left the turn unblocked.",
    "narrative-blocker-cleared": "The narrative/discovery choice notification is no longer present as a blocking decision.",
    "narrative-panel-cleared": "The visible narrative panel for the selected story target was closed after the choice.",
    "validation-changed": "The narrative choice validator changed after the send, but notification/turn state did not clearly clear.",
    "no-state-change": "The narrative choice was sent, but the same narrative blocker remained live without a turn-unblock or blocker transition.",
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
    operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    enumValue: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    target: { playerId: 0 },
    args: { TargetType: "CLOSE", Target: storyTargetId(), Action: 1 },
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
    turn: { ok: true, value: 17 },
    turnDate: { ok: true, value: "3750 BCE" },
    hasSentTurnComplete: { ok: true, value: false },
    canEndTurn: { ok: true, value: false },
    blocker: { ok: true, value: 1 },
    blockingNotificationId: { ok: true, value: notificationId() },
    selectedUnitId: { ok: true, value: null },
    selectedCityId: { ok: true, value: null },
    firstReadyUnitId: { ok: true, value: null },
    notifications: [narrativeNotification()],
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

function narrativeNotification(
  id: Civ7ComponentId = notificationId()
): Civ7PlayNotificationViewResult["notifications"][number] {
  return {
    id,
    type: 2345,
    typeName: "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION",
    groupType: null,
    player: 0,
    summary: "Choose narrative direction",
    message: "Select a story branch.",
    target: storyTargetId(),
    location: null,
    canUserDismiss: false,
    expired: false,
    dismissed: false,
    isEndTurnBlocking: true,
    decision: {
      category: "narrative-choice-options",
      operationFamily: "player-operation",
      operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
      argsShape: "{ TargetType, Target, Action }",
      requiredInputs: [],
      commonActions: [],
      confidence: "official-ui",
      notes: [],
    },
  };
}

function storyTargetId(): Civ7ComponentId {
  return { owner: 0, id: 421, type: 24 };
}

function notificationId(): Civ7ComponentId {
  return { owner: 0, id: 901, type: 20 };
}

function changedNotificationId(): Civ7ComponentId {
  return { owner: 0, id: 902, type: 20 };
}
