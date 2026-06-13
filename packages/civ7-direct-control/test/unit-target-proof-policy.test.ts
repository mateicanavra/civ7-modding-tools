import { describe, expect, test } from "vitest";

import {
  unitTargetProofOutcome,
  unitTargetProofPostcondition,
  type Civ7UnitTargetActionVerification,
} from "../src/proof/unit-target-proof-policy";

import type { Civ7UnitTargetActionResult } from "../src/play/operations/unit-target-action";
import type { Civ7OperationTelemetryPostconditionOutcome } from "../src/proof/operation-telemetry";

type UnitTargetProofCase = Readonly<{
  verification: Civ7UnitTargetActionVerification;
  outcome: Civ7OperationTelemetryPostconditionOutcome;
  confidence: "confirmed" | "unverified";
  noRepeatAfterUnverified: boolean;
}>;

const unitTargetProofCases: readonly UnitTargetProofCase[] = [
  {
    verification: unitTargetVerification("not-sent", "not-sent"),
    outcome: "not-sent",
    confidence: "unverified",
    noRepeatAfterUnverified: true,
  },
  {
    verification: unitTargetVerification("no-state-change", "no-state-change"),
    outcome: "no-state-change",
    confidence: "unverified",
    noRepeatAfterUnverified: true,
  },
  {
    verification: unitTargetVerification("verified", "target-reached"),
    outcome: "cleared",
    confidence: "confirmed",
    noRepeatAfterUnverified: false,
  },
  {
    verification: unitTargetVerification("verified", "path-shortfall"),
    outcome: "state-changed",
    confidence: "confirmed",
    noRepeatAfterUnverified: true,
  },
  {
    verification: unitTargetVerification("verified", "unit-state-changed"),
    outcome: "state-changed",
    confidence: "confirmed",
    noRepeatAfterUnverified: false,
  },
  {
    verification: unitTargetVerification("verified", "target-state-changed"),
    outcome: "state-changed",
    confidence: "confirmed",
    noRepeatAfterUnverified: false,
  },
];

describe("unit target proof policy", () => {
  for (const {
    verification,
    outcome,
    confidence,
    noRepeatAfterUnverified,
  } of unitTargetProofCases) {
    test(`maps ${verification.status}/${verification.classification} into proof confidence and outcome`, () => {
      const postcondition = unitTargetProofPostcondition(
        unitTargetResult({ sent: true, verification }),
        undefined
      );

      expect(unitTargetProofOutcome(verification.classification)).toBe(outcome);
      expect(postcondition).toMatchObject({
        classification: verification.classification,
        outcome,
        confidence,
        noRepeatAfterUnverified,
      });
    });
  }

  test("omits postconditions for read-only unit target plans", () => {
    expect(
      unitTargetProofPostcondition(
        unitTargetResult({
          sent: false,
          verification: unitTargetVerification("not-sent", "not-sent"),
        }),
        undefined
      )
    ).toBeUndefined();
  });

  test("keeps sent unit target actions without postcondition evidence no-repeat guarded", () => {
    expect(
      unitTargetProofPostcondition(
        unitTargetResult({
          sent: true,
          verification: undefined,
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

  test("keeps pending runtime proof no-repeat guarded even for otherwise confirmed target reaches", () => {
    expect(
      unitTargetProofPostcondition(
        unitTargetResult({
          sent: true,
          verification: unitTargetVerification("verified", "target-reached"),
        }),
        "pending-runtime-proof"
      )
    ).toMatchObject({
      classification: "target-reached",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });
});

function unitTargetResult(
  overrides: Partial<Civ7UnitTargetActionResult>
): Civ7UnitTargetActionResult {
  return {
    sent: true,
    ...overrides,
  } as Civ7UnitTargetActionResult;
}

function unitTargetVerification(
  status: Civ7UnitTargetActionVerification["status"],
  classification: Civ7UnitTargetActionVerification["classification"]
): Civ7UnitTargetActionVerification {
  return {
    status,
    classification,
    unitChanged: classification !== "not-sent" && classification !== "no-state-change",
    targetUnitsChanged: classification === "target-state-changed",
    destinationReached: classification === "target-reached",
    requestedLocation: { x: 23, y: 33 },
    landedLocation:
      classification === "target-reached"
        ? { x: 23, y: 33 }
        : classification === "path-shortfall"
          ? { x: 22, y: 33 }
          : null,
    reason: `test ${classification}`,
  };
}
