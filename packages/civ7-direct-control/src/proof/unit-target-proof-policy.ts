import type { Civ7UnitTargetActionResult } from "../play/operations/unit-target-action";
import type {
  Civ7OperationProofBoundary,
  Civ7OperationTelemetryPostcondition,
  Civ7OperationTelemetryPostconditionOutcome,
} from "./operation-telemetry";

export type Civ7UnitTargetActionVerification =
  NonNullable<Civ7UnitTargetActionResult["verification"]>;

export function unitTargetProofPostcondition(
  result: Civ7UnitTargetActionResult,
  proofBoundary: Civ7OperationProofBoundary | undefined,
): Civ7OperationTelemetryPostcondition | undefined {
  if (!result.sent) return undefined;
  if (proofBoundary === "pending-runtime-proof") {
    return {
      classification: result.verification?.classification ?? "pending-runtime-proof",
      reason: result.verification?.reason ?? "Runtime postcondition proof is pending.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    };
  }
  if (!result.verification) {
    return {
      classification: "missing-postcondition",
      reason: "The sent unit target action did not include explicit postcondition evidence.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  if (result.verification.status !== "verified") {
    return {
      classification: result.verification.classification,
      reason: result.verification.reason,
      outcome: unitTargetProofOutcome(result.verification.classification),
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  return {
    classification: result.verification.classification,
    reason: result.verification.reason,
    outcome: unitTargetProofOutcome(result.verification.classification),
    noRepeatAfterUnverified: unitTargetProofNoRepeatAfterConfirmed(result.verification),
    confidence: "confirmed",
  };
}

export function unitTargetProofOutcome(
  classification: Civ7UnitTargetActionVerification["classification"],
): Civ7OperationTelemetryPostconditionOutcome {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "no-state-change":
      return "no-state-change";
    case "target-reached":
      return "cleared";
    case "path-shortfall":
    case "unit-state-changed":
    case "target-state-changed":
      return "state-changed";
  }
}

function unitTargetProofNoRepeatAfterConfirmed(
  verification: Civ7UnitTargetActionVerification,
): boolean {
  return verification.classification === "path-shortfall";
}
