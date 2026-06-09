import type {
  Civ7TurnCompletionActionResult,
} from "../play/turn-completion";
import type { Civ7RuntimeProbe } from "../runtime/probe";
import type {
  Civ7OperationProofBoundary,
  Civ7OperationTelemetryPostcondition,
  Civ7OperationTelemetryPostconditionOutcome,
} from "./operation-telemetry";

export type Civ7TurnCompletionPostconditionClassification =
  | "turn-advanced"
  | "turn-complete-sent"
  | "already-complete"
  | "no-state-change"
  | "missing-postcondition"
  | "pending-runtime-proof";

export function turnCompletionProofPostcondition(
  result: Civ7TurnCompletionActionResult,
  proofBoundary: Civ7OperationProofBoundary | undefined,
): Civ7OperationTelemetryPostcondition {
  const classification = turnCompletionPostconditionClassification(result);

  if (proofBoundary === "pending-runtime-proof") {
    return {
      classification,
      reason: "Runtime postcondition proof is pending for the turn completion send.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    };
  }

  const outcome = turnCompletionProofOutcome(classification);
  const confirmed = turnCompletionPostconditionConfirmed(classification);

  return {
    classification,
    reason: turnCompletionPostconditionReason(classification),
    outcome,
    noRepeatAfterUnverified: turnCompletionNoRepeatAfterUnverified(
      classification,
    ),
    confidence: confirmed ? "confirmed" : "unverified",
  };
}

export function turnCompletionProofOutcome(
  classification: Civ7TurnCompletionPostconditionClassification,
): Civ7OperationTelemetryPostconditionOutcome {
  switch (classification) {
    case "turn-advanced":
      return "cleared";
    case "turn-complete-sent":
    case "already-complete":
      return "state-changed";
    case "no-state-change":
      return "no-state-change";
    case "missing-postcondition":
    case "pending-runtime-proof":
      return "unknown";
  }
}

export function turnCompletionPostconditionConfirmed(
  classification: Civ7TurnCompletionPostconditionClassification,
): boolean {
  switch (classification) {
    case "turn-advanced":
    case "turn-complete-sent":
    case "already-complete":
      return true;
    case "no-state-change":
    case "missing-postcondition":
    case "pending-runtime-proof":
      return false;
  }
}

function turnCompletionPostconditionClassification(
  result: Civ7TurnCompletionActionResult,
): Civ7TurnCompletionPostconditionClassification {
  const beforeTurn = probeValue(result.before.turn);
  const afterTurn = probeValue(result.after.turn);
  const beforeSent = probeValue(result.before.hasSentTurnComplete);
  const afterSent = probeValue(result.after.hasSentTurnComplete);

  if (beforeTurn == null || afterTurn == null || afterSent == null) {
    return "missing-postcondition";
  }

  if (afterTurn !== beforeTurn) return "turn-advanced";
  if (beforeSent === true && afterSent === true) return "already-complete";
  if (afterSent === true) return "turn-complete-sent";
  return "no-state-change";
}

function turnCompletionPostconditionReason(
  classification: Civ7TurnCompletionPostconditionClassification,
): string {
  switch (classification) {
    case "turn-advanced":
      return "The turn advanced after the turn completion send.";
    case "turn-complete-sent":
      return "GameContext reports that turn completion was sent; wait for fresh turn evidence before another mutation.";
    case "already-complete":
      return "GameContext reported turn completion before and after the send; do not repeat without fresh turn evidence.";
    case "no-state-change":
      return "The turn completion send did not advance the turn or mark turn completion sent.";
    case "missing-postcondition":
      return "The turn completion result did not include readable before/after turn completion probes.";
    case "pending-runtime-proof":
      return "Runtime postcondition proof is pending for the turn completion send.";
  }
}

function turnCompletionNoRepeatAfterUnverified(
  classification: Civ7TurnCompletionPostconditionClassification,
): boolean {
  switch (classification) {
    case "turn-advanced":
      return false;
    case "turn-complete-sent":
    case "already-complete":
    case "no-state-change":
    case "missing-postcondition":
    case "pending-runtime-proof":
      return true;
  }
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}
