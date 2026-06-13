import { describe, expect, test } from "vitest";

import {
  narrativeChoicePostconditionConfirmed,
  narrativeChoiceProofOutcome,
  narrativeChoiceProofPostcondition,
} from "../src/proof/narrative-choice-proof-policy";

import type { Civ7NarrativeChoiceResult } from "../src/play/operations/narrative-request";
import type { Civ7NarrativeChoicePostconditionClassification } from "../src/play/operations/narrative-postconditions";
import type { Civ7OperationTelemetryPostconditionOutcome } from "../src/proof/operation-telemetry";

type NarrativeChoiceProofCase = Readonly<{
  classification: Civ7NarrativeChoicePostconditionClassification;
  outcome: Civ7OperationTelemetryPostconditionOutcome;
}>;

const narrativeChoiceProofCases: readonly NarrativeChoiceProofCase[] = [
  { classification: "not-sent", outcome: "not-sent" },
  { classification: "turn-unblocked", outcome: "cleared" },
  { classification: "narrative-blocker-cleared", outcome: "cleared" },
  { classification: "narrative-panel-cleared", outcome: "state-changed" },
  { classification: "validation-changed", outcome: "still-blocked" },
  { classification: "no-state-change", outcome: "no-state-change" },
];

describe("narrative choice proof policy", () => {
  for (const { classification, outcome } of narrativeChoiceProofCases) {
    test(`maps ${classification} into proof confidence and outcome`, () => {
      const postcondition = narrativeChoiceProofPostcondition(
        narrativeChoiceResult({
          sent: true,
          postcondition: narrativePostcondition(classification),
        }),
        undefined
      );
      const confirmed = narrativeChoicePostconditionConfirmed(classification);

      expect(narrativeChoiceProofOutcome(classification)).toBe(outcome);
      expect(postcondition).toMatchObject({
        classification,
        outcome,
        confidence: confirmed ? "confirmed" : "unverified",
        noRepeatAfterUnverified: !confirmed,
      });
    });
  }

  test("omits postconditions for read-only narrative choices without postcondition evidence", () => {
    expect(
      narrativeChoiceProofPostcondition(
        narrativeChoiceResult({
          sent: false,
          postcondition: undefined,
        }),
        undefined
      )
    ).toBeUndefined();
  });

  test("keeps sent narrative choices without postcondition evidence no-repeat guarded", () => {
    expect(
      narrativeChoiceProofPostcondition(
        narrativeChoiceResult({
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
      narrativeChoiceProofPostcondition(
        narrativeChoiceResult({
          sent: true,
          postcondition: narrativePostcondition("narrative-blocker-cleared"),
        }),
        "pending-runtime-proof"
      )
    ).toMatchObject({
      classification: "narrative-blocker-cleared",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });
});

function narrativeChoiceResult(
  overrides: Partial<Civ7NarrativeChoiceResult>
): Civ7NarrativeChoiceResult {
  return {
    sent: true,
    ...overrides,
  } as Civ7NarrativeChoiceResult;
}

function narrativePostcondition(
  classification: Civ7NarrativeChoicePostconditionClassification
): NonNullable<Civ7NarrativeChoiceResult["postcondition"]> {
  return {
    classification,
    reason: `test ${classification}`,
  };
}
