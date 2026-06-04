import { describe, expect, test } from "vitest";

import {
  createCiv7NotificationDismissalTelemetryRecord,
  type Civ7NotificationDismissalTelemetryAdapterInput,
} from "../src/proof/notification-dismissal-telemetry";
import { summarizeCiv7OperationProofTelemetry } from "../src/proof/operation-telemetry";

import type { Civ7ComponentId } from "../src/civ7-component-id";
import type {
  Civ7NotificationDismissalResult,
  Civ7NotificationDismissalSummary,
} from "../src/play/notifications/dismissal-request";
import type {
  Civ7NotificationDismissalPostcondition,
  Civ7NotificationDismissalPostconditionClassification,
} from "../src/play/notifications/postconditions";

describe("notification-dismissal telemetry adapter", () => {
  test("adapts confirmed notification disappearance into separated telemetry", () => {
    const record = createCiv7NotificationDismissalTelemetryRecord(notificationTelemetryInput({
      result: notificationDismissalResult({
        sent: true,
        verified: true,
        after: notificationSummary({ exists: false }),
        postcondition: notificationPostcondition("notification-disappeared"),
      }),
    }));

    expect(record.candidateAction).toMatchObject({
      id: "notification-dismissal:0:113:20",
      risk: "mutation",
    });
    expect(record.operationFamily).toBe("app-ui-action");
    expect(record.approval.status).toBe("approved");
    expect(record.validation_pre?.value).toMatchObject({
      valid: true,
      canDismiss: true,
      beforeExists: true,
    });
    expect(record.send_receipt).toMatchObject({
      status: "sent",
      requestFamily: "app-ui-action",
    });
    expect(record.post_read?.value).toMatchObject({
      after: {
        exists: false,
      },
    });
    expect(record.validation_post?.value).toMatchObject({
      verified: true,
      postconditionClassification: "notification-disappeared",
    });
    expect(record.postcondition).toEqual({
      classification: "notification-disappeared",
      reason: "The target notification no longer exists after dismissal.",
      outcome: "cleared",
      noRepeatAfterUnverified: false,
      confidence: "confirmed",
    });
    expect(record.postcondition).not.toHaveProperty("verified");
    expect(record.outcome_delta?.value).toMatchObject({
      classification: "notification-disappeared",
      after: {
        exists: false,
      },
    });

    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      operationFamily: "app-ui-action",
      actionId: "notification-dismissal:0:113:20",
      status: "sent-confirmed",
      postconditionClassification: "notification-disappeared",
      noRepeatAfterUnverified: false,
      proofBoundary: "local-test-proof",
    });
  });

  test("does not treat a legacy verified boolean as confirmed postcondition proof", () => {
    const record = createCiv7NotificationDismissalTelemetryRecord(notificationTelemetryInput({
      result: notificationDismissalResult({
        sent: true,
        verified: true,
        postcondition: undefined,
      } as Partial<Civ7NotificationDismissalResult>),
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

  test("keeps validator-blocked notification dismissals no-repeat guarded", () => {
    const record = createCiv7NotificationDismissalTelemetryRecord(notificationTelemetryInput({
      result: notificationDismissalResult({
        canDismiss: false,
        sent: false,
        verified: false,
        after: notificationSummary(),
        postcondition: notificationPostcondition("not-sent"),
      }),
    }));

    expect(record.validation_pre?.value).toMatchObject({
      valid: false,
      canDismiss: false,
    });
    expect(record.send_receipt).toMatchObject({
      status: "not-attempted",
      requestFamily: "app-ui-action",
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

  test("keeps stale engine-front evidence no-repeat guarded even when verified is true", () => {
    const record = createCiv7NotificationDismissalTelemetryRecord(notificationTelemetryInput({
      result: notificationDismissalResult({
        sent: true,
        verified: true,
        after: notificationSummary({
          dismissed: true,
          isEngineQueueFront: { ok: true, value: true },
          notificationTrainContains: { ok: true, value: false },
          isNotificationTrainFront: { ok: true, value: false },
        }),
        postcondition: notificationPostcondition("engine-front-still-live"),
      }),
    }));

    expect(record.postcondition).toMatchObject({
      classification: "engine-front-still-live",
      outcome: "stale",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "engine-front-still-live",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps missing-after and no-state-change sends no-repeat guarded", () => {
    const missingAfter = createCiv7NotificationDismissalTelemetryRecord(notificationTelemetryInput({
      result: notificationDismissalResult({
        sent: true,
        verified: false,
        after: null,
        postcondition: notificationPostcondition("missing-after"),
      }),
    }));
    const noStateChange = createCiv7NotificationDismissalTelemetryRecord(notificationTelemetryInput({
      result: notificationDismissalResult({
        sent: true,
        verified: false,
        after: notificationSummary(),
        postcondition: notificationPostcondition("no-state-change"),
      }),
    }));

    expect(missingAfter.postcondition).toMatchObject({
      classification: "missing-after",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(noStateChange.postcondition).toMatchObject({
      classification: "no-state-change",
      outcome: "no-state-change",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(missingAfter)).toMatchObject({
      status: "sent-unverified",
      noRepeatAfterUnverified: true,
    });
    expect(summarizeCiv7OperationProofTelemetry(noStateChange)).toMatchObject({
      status: "sent-unverified",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps pending runtime proof sends no-repeat guarded", () => {
    const record = createCiv7NotificationDismissalTelemetryRecord(notificationTelemetryInput({
      proofBoundary: "pending-runtime-proof",
      result: notificationDismissalResult({
        sent: true,
        verified: true,
        after: notificationSummary({ exists: false }),
        postcondition: notificationPostcondition("notification-disappeared"),
      }),
    }));

    expect(record.postcondition).toMatchObject({
      classification: "notification-disappeared",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "pending-runtime-proof",
      postconditionClassification: "notification-disappeared",
      noRepeatAfterUnverified: true,
      proofBoundary: "pending-runtime-proof",
    });
  });
});

function notificationTelemetryInput(
  overrides: Partial<Civ7NotificationDismissalTelemetryAdapterInput> = {}
): Civ7NotificationDismissalTelemetryAdapterInput {
  return {
    input: {
      notificationId: notificationId(),
    },
    result: notificationDismissalResult(),
    approval: {
      required: true,
      status: "approved",
      reason: "test notification dismissal telemetry adapter",
      source: "notification-dismissal-telemetry.test.ts",
    },
    source: "notification-dismissal-telemetry.test.ts",
    ...overrides,
  };
}

function notificationDismissalResult(
  overrides: Partial<Civ7NotificationDismissalResult> = {}
): Civ7NotificationDismissalResult {
  const before = notificationSummary();
  const after = notificationSummary({ exists: false });
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    notificationId: notificationId(),
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
      },
    },
    closeoutPath: "NotificationModel.manager.dismiss",
    verificationAttempts: [before, after],
    verified: true,
    postcondition: notificationPostcondition("notification-disappeared"),
    ...overrides,
  } as Civ7NotificationDismissalResult;
}

function notificationPostcondition(
  classification: Civ7NotificationDismissalPostconditionClassification,
): Civ7NotificationDismissalPostcondition {
  const reasons: Record<Civ7NotificationDismissalPostconditionClassification, string> = {
    "not-sent": "The notification dismissal was not sent, so no postcondition can be verified.",
    "missing-after": "The notification dismissal was sent without an after-read summary, so the outcome is unverified.",
    "notification-disappeared": "The target notification no longer exists after dismissal.",
    "engine-front-still-live": "The target notification still fronts the engine queue, so weaker dismissed/train evidence is treated as stale.",
    "notification-dismissed": "The target notification reports dismissed after dismissal and is not still the engine queue front.",
    "engine-queue-cleared": "The target notification was removed from the engine notification queue.",
    "notification-train-cleared": "The target notification was removed from the notification train.",
    "engine-front-moved": "The target notification moved off the engine queue front it occupied before dismissal.",
    "notification-train-front-moved": "The target notification moved off the notification train front it occupied before dismissal.",
    "no-state-change": "The dismissal was sent, but notification identity evidence did not confirm disappearance, queue removal, or front movement.",
  };
  return {
    classification,
    reason: reasons[classification],
  };
}

function notificationSummary(
  overrides: Partial<Civ7NotificationDismissalSummary> = {},
): Civ7NotificationDismissalSummary {
  return {
    id: notificationId(),
    exists: true,
    type: 2091697919,
    typeName: "NOTIFICATION_WONDER_COMPLETED",
    summary: "Wonder Completed",
    message: "Wonder Completed",
    target: { owner: -1, id: -1, type: 0 },
    location: { x: -9999, y: -9999 },
    canUserDismiss: true,
    expired: false,
    dismissed: false,
    blocksTurnAdvancement: { ok: true, value: true },
    endTurnBlockingType: { ok: true, value: 2091697919 },
    isEndTurnBlocking: { ok: true, value: true },
    engineQueueCount: { ok: true, value: 1 },
    engineQueueContains: { ok: true, value: true },
    engineQueueFirstId: { ok: true, value: notificationId() },
    isEngineQueueFront: { ok: true, value: true },
    notificationTrainCount: { ok: true, value: 1 },
    notificationTrainContains: { ok: true, value: true },
    notificationTrainFirstId: { ok: true, value: notificationId() },
    isNotificationTrainFront: { ok: true, value: true },
    ...overrides,
  };
}

function notificationId(): Civ7ComponentId {
  return { owner: 0, id: 113, type: 20 };
}
