import { describe, expect, test } from "vitest";

import {
  populationPlacementPostconditionConfirmed,
  populationPlacementPostconditionOutcome,
  populationPlacementRequestVerified,
  type Civ7PopulationPlacementPostconditionOutcome,
} from "../src/play/operations/population-placement-proof.js";
import {
  populationPlacementProofOutcome,
  populationPlacementProofPostcondition,
} from "../src/proof/population-placement-proof-policy.js";

import type {
  Civ7PopulationPlacementPostcondition,
  Civ7PopulationPlacementPostconditionClassification,
} from "../src/play/operations/population-postconditions.js";
import type { Civ7OperationRequestResult } from "../src/play/operations/validate-request.js";

type PopulationPlacementProofCase = Readonly<{
  classification: Civ7PopulationPlacementPostconditionClassification;
  requestVerified: boolean;
  proofConfirmed: boolean;
  noRepeatAfterUnverified: boolean;
  outcome: Civ7PopulationPlacementPostconditionOutcome;
}>;

const populationPlacementProofCases: readonly PopulationPlacementProofCase[] = [
  {
    classification: "not-sent",
    requestVerified: false,
    proofConfirmed: false,
    noRepeatAfterUnverified: true,
    outcome: "not-sent",
  },
  {
    classification: "population-ready-cleared",
    requestVerified: true,
    proofConfirmed: true,
    noRepeatAfterUnverified: false,
    outcome: "cleared",
  },
  {
    classification: "placement-state-changed",
    requestVerified: true,
    proofConfirmed: true,
    noRepeatAfterUnverified: true,
    outcome: "state-changed",
  },
  {
    classification: "validation-changed",
    requestVerified: true,
    proofConfirmed: false,
    noRepeatAfterUnverified: true,
    outcome: "still-blocked",
  },
  {
    classification: "no-state-change",
    requestVerified: false,
    proofConfirmed: false,
    noRepeatAfterUnverified: true,
    outcome: "no-state-change",
  },
];

describe("population placement proof policy", () => {
  for (const {
    classification,
    requestVerified,
    proofConfirmed,
    noRepeatAfterUnverified,
    outcome,
  } of populationPlacementProofCases) {
    test(`maps ${classification} without collapsing legacy request status into proof confidence`, () => {
      const postcondition = populationPlacementProofPostcondition(
        operationRequestResult({
          sent: classification !== "not-sent",
          populationPostcondition: populationPostcondition(classification),
        }),
        undefined,
      );

      expect(populationPlacementRequestVerified(classification)).toBe(requestVerified);
      expect(populationPlacementPostconditionConfirmed(classification)).toBe(proofConfirmed);
      expect(populationPlacementPostconditionOutcome(classification)).toBe(outcome);
      expect(populationPlacementProofOutcome(classification)).toBe(outcome);
      expect(postcondition).toMatchObject({
        classification,
        outcome,
        confidence: proofConfirmed ? "confirmed" : "unverified",
        noRepeatAfterUnverified,
      });
    });
  }

  test("preserves the legacy request verified result when postcondition evidence is absent", () => {
    expect(populationPlacementRequestVerified(undefined)).toBe(true);
  });

  test("omits postconditions for no-send population requests without postcondition evidence", () => {
    expect(populationPlacementProofPostcondition(operationRequestResult({
      sent: false,
      populationPostcondition: undefined,
    }), undefined)).toBeUndefined();
  });

  test("keeps sent population placement without postcondition evidence no-repeat guarded", () => {
    expect(populationPlacementProofPostcondition(operationRequestResult({
      sent: true,
      populationPostcondition: undefined,
    }), undefined)).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps pending runtime proof no-repeat guarded even for cleared population readiness", () => {
    expect(populationPlacementProofPostcondition(operationRequestResult({
      sent: true,
      populationPostcondition: populationPostcondition("population-ready-cleared"),
    }), "pending-runtime-proof")).toMatchObject({
      classification: "population-ready-cleared",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });
});

function operationRequestResult(
  overrides: Partial<Civ7OperationRequestResult>,
): Civ7OperationRequestResult {
  return {
    sent: true,
    verified: true,
    before: operationValidationResult(),
    after: operationValidationResult(),
    ...overrides,
  } as Civ7OperationRequestResult;
}

function populationPostcondition(
  classification: Civ7PopulationPlacementPostconditionClassification,
): Civ7PopulationPlacementPostcondition {
  return {
    family: "player-operation",
    operationType: "ASSIGN_WORKER",
    classification,
    readyCleared: classification === "population-ready-cleared",
    placementStateChanged: classification === "placement-state-changed",
    reason: `test ${classification}`,
  };
}

function operationValidationResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    family: "player-operation",
    operationType: "ASSIGN_WORKER",
    enumValue: "ASSIGN_WORKER",
    target: { playerId: 0 },
    args: { Location: 2543, Amount: 1 },
    valid: true,
    result: { Success: true },
  };
}
