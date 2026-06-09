import { describe, expect, test } from "vitest";

import {
  productionChoicePostconditionConfirmed,
  productionChoicePostconditionOutcome,
  productionChoiceRequestVerified,
  type Civ7ProductionChoicePostconditionOutcome,
} from "../src/play/operations/production-choice-proof.js";

import type { Civ7ProductionPostconditionClassification } from "../src/play/operations/production-postconditions.js";

type ProductionChoiceProofCase = Readonly<{
  classification: Civ7ProductionPostconditionClassification;
  requestVerified: boolean;
  proofConfirmed: boolean;
  outcome: Civ7ProductionChoicePostconditionOutcome;
}>;

const productionChoiceProofCases: readonly ProductionChoiceProofCase[] = [
  {
    classification: "not-sent",
    requestVerified: false,
    proofConfirmed: false,
    outcome: "not-sent",
  },
  {
    classification: "production-choice-cleared",
    requestVerified: true,
    proofConfirmed: true,
    outcome: "cleared",
  },
  {
    classification: "production-state-changed",
    requestVerified: true,
    proofConfirmed: true,
    outcome: "state-changed",
  },
  {
    classification: "production-state-changed-blocker-still-live",
    requestVerified: false,
    proofConfirmed: false,
    outcome: "still-blocked",
  },
  {
    classification: "validation-changed",
    requestVerified: true,
    proofConfirmed: false,
    outcome: "still-blocked",
  },
  {
    classification: "no-state-change",
    requestVerified: false,
    proofConfirmed: false,
    outcome: "no-state-change",
  },
];

describe("production choice proof policy", () => {
  for (const { classification, requestVerified, proofConfirmed, outcome } of productionChoiceProofCases) {
    test(`classifies ${classification} without collapsing legacy request status into proof confidence`, () => {
      expect(productionChoiceRequestVerified(classification)).toBe(requestVerified);
      expect(productionChoicePostconditionConfirmed(classification)).toBe(proofConfirmed);
      expect(productionChoicePostconditionOutcome(classification)).toBe(outcome);
    });
  }

  test("preserves the legacy request verified result when postcondition evidence is absent", () => {
    expect(productionChoiceRequestVerified(undefined)).toBe(true);
  });
});
