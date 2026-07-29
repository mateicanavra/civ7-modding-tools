import { Value } from "typebox/value";
import type {
  Civ7ControlOrpcRuntimeProbe,
  Civ7ControlOrpcUnitCommandCheckResult,
  Civ7ControlOrpcUnitCommandSnapshot,
} from "#civ7-control-service/model/ports/direct-control";

type Civ7UnitCommandPostconditionClassification =
  | "not-sent"
  | "queue-advanced"
  | "selected-unit-changed"
  | "activity-changed"
  | "unit-state-changed"
  | "blocker-changed"
  | "validation-changed"
  | "no-state-change"
  | "missing-postcondition";

export type Civ7UnitCommandPostconditionEvidence =
  | Readonly<{
      kind: "not-sent";
    }>
  | Readonly<{
      kind: "observed";
      beforeValidation: Civ7ControlOrpcUnitCommandCheckResult;
      afterValidation: Civ7ControlOrpcUnitCommandCheckResult;
      before: Civ7ControlOrpcUnitCommandSnapshot;
      after: Civ7ControlOrpcUnitCommandSnapshot;
    }>
  | Readonly<{
      kind: "send-result-unavailable";
    }>
  | Readonly<{
      kind: "postcheck-unavailable";
    }>;

export type Civ7UnitCommandPostcondition = Readonly<{
  classification: Civ7UnitCommandPostconditionClassification;
  reason: string;
}>;

export function civ7UnitCommandPostcondition(
  evidence: Civ7UnitCommandPostconditionEvidence
): Civ7UnitCommandPostcondition {
  switch (evidence.kind) {
    case "not-sent":
      return {
        classification: "not-sent",
        reason: unitCommandPostconditionReason("not-sent"),
      };
    case "send-result-unavailable":
      return {
        classification: "missing-postcondition",
        reason:
          "The unit command send result is unavailable, so gameplay dispatch is unknown and must not be repeated until fresh unit readiness and postcondition evidence is read.",
      };
    case "postcheck-unavailable":
      return {
        classification: "missing-postcondition",
        reason:
          "The unit command was sent, but its post-send validation read failed; do not repeat it until fresh unit readiness and postcondition evidence is read.",
      };
    case "observed": {
      const classification = classifyObservedUnitCommandPostcondition(evidence);
      return {
        classification,
        reason: unitCommandPostconditionReason(classification),
      };
    }
  }
}

function classifyObservedUnitCommandPostcondition(
  evidence: Extract<Civ7UnitCommandPostconditionEvidence, { kind: "observed" }>
): Exclude<Civ7UnitCommandPostconditionClassification, "not-sent"> {
  if (snapshotHasProbeFailure(evidence.before) || snapshotHasProbeFailure(evidence.after)) {
    return "missing-postcondition";
  }
  if (probeValueChanged(evidence.before.firstReadyUnitId, evidence.after.firstReadyUnitId)) {
    return "queue-advanced";
  }
  if (probeValueChanged(evidence.before.selectedUnitId, evidence.after.selectedUnitId)) {
    return "selected-unit-changed";
  }
  if (probeFieldChanged(evidence.before.unit, evidence.after.unit, "activity")) {
    return "activity-changed";
  }
  if (probeValueChanged(evidence.before.unit, evidence.after.unit)) {
    return "unit-state-changed";
  }
  if (probeValueChanged(evidence.before.blocker, evidence.after.blocker)) {
    return "blocker-changed";
  }
  if (
    evidence.beforeValidation.valid !== evidence.afterValidation.valid ||
    !Value.Equal(evidence.beforeValidation.result, evidence.afterValidation.result)
  ) {
    return "validation-changed";
  }
  return "no-state-change";
}

function unitCommandPostconditionReason(
  classification: Civ7UnitCommandPostconditionClassification
): string {
  switch (classification) {
    case "not-sent":
      return "The unit command was not sent, so no unit-side postcondition can be verified.";
    case "queue-advanced":
      return "The first ready unit changed after the request, which shows the unit queue advanced.";
    case "selected-unit-changed":
      return "The selected unit changed after the request, which shows the game consumed the unit action.";
    case "activity-changed":
      return "The unit activity changed after the request.";
    case "unit-state-changed":
      return "The unit summary changed after the request.";
    case "blocker-changed":
      return "The end-turn blocker changed after the request.";
    case "validation-changed":
      return "The unit command validation result changed after the request.";
    case "no-state-change":
      return "The request was sent, but no observed unit, queue, blocker, or validation state changed.";
    case "missing-postcondition":
      return "The request was sent, but one or more required unit-state probes failed; do not repeat it until complete readiness and postcondition evidence is available.";
  }
}

function probeValueChanged(
  left: Civ7ControlOrpcRuntimeProbe<unknown>,
  right: Civ7ControlOrpcRuntimeProbe<unknown>
): boolean {
  return left.ok && right.ok && !Value.Equal(left.value, right.value);
}

function probeFieldChanged(
  left: Civ7ControlOrpcRuntimeProbe<unknown>,
  right: Civ7ControlOrpcRuntimeProbe<unknown>,
  field: string
): boolean {
  if (!left.ok || !right.ok) return false;
  if (!isRecord(left.value) || !isRecord(right.value)) return false;
  return !Value.Equal(left.value[field], right.value[field]);
}

function snapshotHasProbeFailure(snapshot: Civ7ControlOrpcUnitCommandSnapshot): boolean {
  return (
    !snapshot.unit.ok ||
    !snapshot.selectedUnitId.ok ||
    !snapshot.firstReadyUnitId.ok ||
    !snapshot.blocker.ok
  );
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
