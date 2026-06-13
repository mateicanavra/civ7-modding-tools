import { describe, expect, test } from "vitest";

import {
  notificationDismissalProofOutcome,
  notificationDismissalProofPostcondition,
} from "../src/proof/notification-dismissal-proof-policy";
import { notificationDismissalPostconditionConfirmed } from "../src/play/notifications/postconditions";

import type { Civ7NotificationDismissalResult } from "../src/play/notifications/dismissal-request";
import type { Civ7NotificationDismissalPostconditionClassification } from "../src/play/notifications/postconditions";
import type { Civ7OperationTelemetryPostconditionOutcome } from "../src/proof/operation-telemetry";

type NotificationDismissalProofCase = Readonly<{
  classification: Civ7NotificationDismissalPostconditionClassification;
  outcome: Civ7OperationTelemetryPostconditionOutcome;
}>;

const notificationDismissalProofCases: readonly NotificationDismissalProofCase[] = [
  { classification: "not-sent", outcome: "not-sent" },
  { classification: "missing-after", outcome: "unknown" },
  { classification: "notification-disappeared", outcome: "cleared" },
  { classification: "engine-front-still-live", outcome: "stale" },
  { classification: "notification-dismissed", outcome: "state-changed" },
  { classification: "engine-queue-cleared", outcome: "cleared" },
  { classification: "notification-train-cleared", outcome: "cleared" },
  { classification: "engine-front-moved", outcome: "state-changed" },
  { classification: "notification-train-front-moved", outcome: "state-changed" },
  { classification: "no-state-change", outcome: "no-state-change" },
];

describe("notification dismissal proof policy", () => {
  for (const { classification, outcome } of notificationDismissalProofCases) {
    test(`maps ${classification} into proof confidence and outcome`, () => {
      const postcondition = notificationDismissalProofPostcondition(
        notificationDismissalResult(classification),
        undefined
      );
      const confirmed = notificationDismissalPostconditionConfirmed(classification);

      expect(notificationDismissalProofOutcome(classification)).toBe(outcome);
      expect(postcondition).toMatchObject({
        classification,
        outcome,
        confidence: confirmed ? "confirmed" : "unverified",
        noRepeatAfterUnverified: !confirmed,
      });
    });
  }

  test("keeps sent dismissals without postcondition evidence no-repeat guarded", () => {
    expect(
      notificationDismissalProofPostcondition(
        {
          sent: true,
        } as Civ7NotificationDismissalResult,
        undefined
      )
    ).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps pending runtime proof no-repeat guarded even for confirmed classifications", () => {
    expect(
      notificationDismissalProofPostcondition(
        notificationDismissalResult("notification-disappeared"),
        "pending-runtime-proof"
      )
    ).toMatchObject({
      classification: "notification-disappeared",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });
});

function notificationDismissalResult(
  classification: Civ7NotificationDismissalPostconditionClassification
): Civ7NotificationDismissalResult {
  return {
    sent: classification !== "not-sent",
    postcondition: {
      classification,
      reason: `test ${classification}`,
    },
  } as Civ7NotificationDismissalResult;
}
