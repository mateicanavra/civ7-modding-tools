import { describe, expect, test } from "vitest";
import type { Civ7DiplomacyResponsePostconditionClassification } from "../src/play/operations/diplomacy-postconditions.js";

import type { Civ7DiplomacyResponseResult } from "../src/play/operations/diplomacy-request.js";
import {
  diplomacyResponsePostconditionConfirmed,
  diplomacyResponseProofOutcome,
  diplomacyResponseProofPostcondition,
} from "../src/proof/diplomacy-response-proof-policy.js";
import type { Civ7OperationTelemetryPostconditionOutcome } from "../src/proof/operation-telemetry.js";

type DiplomacyResponseProofCase = Readonly<{
  classification: Civ7DiplomacyResponsePostconditionClassification;
  outcome: Civ7OperationTelemetryPostconditionOutcome;
}>;

const diplomacyResponseProofCases: readonly DiplomacyResponseProofCase[] = [
  { classification: "not-sent", outcome: "not-sent" },
  { classification: "turn-unblocked", outcome: "cleared" },
  { classification: "diplomacy-blocker-cleared", outcome: "cleared" },
  { classification: "blocking-notification-changed", outcome: "state-changed" },
  { classification: "validation-changed", outcome: "still-blocked" },
  { classification: "no-state-change", outcome: "no-state-change" },
];

describe("diplomacy response proof policy", () => {
  for (const { classification, outcome } of diplomacyResponseProofCases) {
    test(`maps ${classification} into proof confidence and outcome`, () => {
      const postcondition = diplomacyResponseProofPostcondition(
        diplomacyResponseResult({
          sent: true,
          postcondition: diplomacyPostcondition(classification),
        }),
        undefined
      );
      const confirmed = diplomacyResponsePostconditionConfirmed(classification);

      expect(diplomacyResponseProofOutcome(classification)).toBe(outcome);
      expect(postcondition).toMatchObject({
        classification,
        outcome,
        confidence: confirmed ? "confirmed" : "unverified",
        noRepeatAfterUnverified: !confirmed,
      });
    });
  }

  test("omits postconditions for read-only diplomacy responses without postcondition evidence", () => {
    expect(
      diplomacyResponseProofPostcondition(
        diplomacyResponseResult({
          sent: false,
          postcondition: undefined,
        }),
        undefined
      )
    ).toBeUndefined();
  });

  test("keeps sent diplomacy responses without postcondition evidence no-repeat guarded", () => {
    expect(
      diplomacyResponseProofPostcondition(
        diplomacyResponseResult({
          sent: true,
          postcondition: undefined,
        }),
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
      diplomacyResponseProofPostcondition(
        diplomacyResponseResult({
          sent: true,
          postcondition: diplomacyPostcondition("diplomacy-blocker-cleared"),
        }),
        "pending-runtime-proof"
      )
    ).toMatchObject({
      classification: "diplomacy-blocker-cleared",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });
});

function diplomacyResponseResult(
  overrides: Partial<Civ7DiplomacyResponseResult>
): Civ7DiplomacyResponseResult {
  return {
    sent: true,
    ...overrides,
  } as Civ7DiplomacyResponseResult;
}

function diplomacyPostcondition(
  classification: Civ7DiplomacyResponsePostconditionClassification
): NonNullable<Civ7DiplomacyResponseResult["postcondition"]> {
  return {
    classification,
    reason: `test ${classification}`,
  };
}
