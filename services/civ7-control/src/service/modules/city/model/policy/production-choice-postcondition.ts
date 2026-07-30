import { Value } from "typebox/value";

import type {
  Civ7ControlOrpcProductionChoiceSnapshot,
  Civ7ControlOrpcProductionChoiceValidationResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7CityProductionChoiceInput } from "../../contract";

export type Civ7ProductionChoicePostconditionClassification =
  | "not-sent"
  | "production-choice-cleared"
  | "production-state-changed"
  | "production-state-changed-blocker-still-live"
  | "validation-changed"
  | "no-state-change"
  | "missing-postcondition";

export type Civ7ProductionChoicePostconditionEvidence =
  | Readonly<{
      kind: "not-sent";
    }>
  | Readonly<{
      kind: "send-result-unavailable";
    }>
  | Readonly<{
      kind: "postcheck-unavailable";
    }>
  | Readonly<{
      kind: "observed";
      cityId: Civ7CityProductionChoiceInput["cityId"];
      beforeValidation: Civ7ControlOrpcProductionChoiceValidationResult;
      afterValidation: Civ7ControlOrpcProductionChoiceValidationResult;
      before: Civ7ControlOrpcProductionChoiceSnapshot;
      after: Civ7ControlOrpcProductionChoiceSnapshot;
    }>;

type ConfirmedProductionChoicePostcondition<
  Classification extends Civ7ProductionChoicePostconditionClassification,
  Outcome extends string,
> = Readonly<{
  classification: Classification;
  reason: string;
  outcome: Outcome;
  confidence: "confirmed";
  confirmed: true;
  noRepeatAfterUnverified: false;
}>;

type UnverifiedProductionChoicePostcondition<
  Classification extends Civ7ProductionChoicePostconditionClassification,
  Outcome extends string,
> = Readonly<{
  classification: Classification;
  reason: string;
  outcome: Outcome;
  confidence: "unverified";
  confirmed: false;
  noRepeatAfterUnverified: true;
}>;

export type Civ7ProductionChoicePostcondition =
  | UnverifiedProductionChoicePostcondition<"not-sent", "not-sent">
  | ConfirmedProductionChoicePostcondition<"production-choice-cleared", "cleared">
  | ConfirmedProductionChoicePostcondition<"production-state-changed", "state-changed">
  | UnverifiedProductionChoicePostcondition<
      "production-state-changed-blocker-still-live",
      "still-blocked"
    >
  | UnverifiedProductionChoicePostcondition<"validation-changed", "validation-changed">
  | UnverifiedProductionChoicePostcondition<"no-state-change", "no-state-change">
  | UnverifiedProductionChoicePostcondition<"missing-postcondition", "unknown">;

export function civ7ProductionChoicePostcondition(
  evidence: Civ7ProductionChoicePostconditionEvidence
): Civ7ProductionChoicePostcondition {
  switch (evidence.kind) {
    case "not-sent":
      return productionChoicePostcondition(
        "not-sent",
        productionChoicePostconditionReason("not-sent")
      );
    case "send-result-unavailable":
      return productionChoicePostcondition(
        "missing-postcondition",
        "The production choice send result is unavailable, so gameplay dispatch is unknown and must not be repeated until fresh production and blocker evidence is read."
      );
    case "postcheck-unavailable":
      return productionChoicePostcondition(
        "missing-postcondition",
        "The production choice was sent, but a required post-send production read failed; do not repeat it until fresh production and blocker evidence is available."
      );
    case "observed": {
      const classification = classifyObservedProductionChoicePostcondition(evidence);
      return productionChoicePostcondition(
        classification,
        productionChoicePostconditionReason(classification)
      );
    }
  }
}

function classifyObservedProductionChoicePostcondition(
  evidence: Extract<Civ7ProductionChoicePostconditionEvidence, { kind: "observed" }>
): Exclude<Civ7ProductionChoicePostconditionClassification, "not-sent"> {
  const beforeBlocker = matchingProductionBlockerState(evidence.before);
  const afterBlocker = matchingProductionBlockerState(evidence.after);
  if (
    snapshotHasRequiredProbeFailure(evidence.cityId, evidence.before) ||
    snapshotHasRequiredProbeFailure(evidence.cityId, evidence.after) ||
    beforeBlocker === "unknown" ||
    afterBlocker === "unknown"
  ) {
    return "missing-postcondition";
  }

  const productionStateChanged = probeValueChanged(
    evidence.before.buildQueue,
    evidence.after.buildQueue
  );
  if (beforeBlocker === "matching" && afterBlocker === "clear") {
    return "production-choice-cleared";
  }
  if (productionStateChanged && afterBlocker === "matching") {
    return "production-state-changed-blocker-still-live";
  }
  if (productionStateChanged) {
    return "production-state-changed";
  }
  if (
    evidence.beforeValidation.valid !== evidence.afterValidation.valid ||
    !Value.Equal(evidence.beforeValidation.result, evidence.afterValidation.result)
  ) {
    return "validation-changed";
  }
  return "no-state-change";
}

function productionChoicePostcondition(
  classification: Civ7ProductionChoicePostconditionClassification,
  reason: string
): Civ7ProductionChoicePostcondition {
  switch (classification) {
    case "not-sent":
      return unverifiedProductionChoicePostcondition(classification, "not-sent", reason);
    case "production-choice-cleared":
      return confirmedProductionChoicePostcondition(classification, "cleared", reason);
    case "production-state-changed":
      return confirmedProductionChoicePostcondition(classification, "state-changed", reason);
    case "production-state-changed-blocker-still-live":
      return unverifiedProductionChoicePostcondition(classification, "still-blocked", reason);
    case "validation-changed":
      return unverifiedProductionChoicePostcondition(classification, "validation-changed", reason);
    case "no-state-change":
      return unverifiedProductionChoicePostcondition(classification, "no-state-change", reason);
    case "missing-postcondition":
      return unverifiedProductionChoicePostcondition(classification, "unknown", reason);
  }
}

function confirmedProductionChoicePostcondition<
  Classification extends Civ7ProductionChoicePostconditionClassification,
  Outcome extends string,
>(
  classification: Classification,
  outcome: Outcome,
  reason: string
): ConfirmedProductionChoicePostcondition<Classification, Outcome> {
  return {
    classification,
    reason,
    outcome,
    confidence: "confirmed",
    confirmed: true,
    noRepeatAfterUnverified: false,
  };
}

function unverifiedProductionChoicePostcondition<
  Classification extends Civ7ProductionChoicePostconditionClassification,
  Outcome extends string,
>(
  classification: Classification,
  outcome: Outcome,
  reason: string
): UnverifiedProductionChoicePostcondition<Classification, Outcome> {
  return {
    classification,
    reason,
    outcome,
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function productionChoicePostconditionReason(
  classification: Civ7ProductionChoicePostconditionClassification
): string {
  switch (classification) {
    case "not-sent":
      return "The production choice was not sent, so no production postcondition can be verified.";
    case "production-choice-cleared":
      return "A matching production-choice blocker existed before the request and the readable post-send blocker state proves it absent or nonmatching.";
    case "production-state-changed":
      return "The sent production choice changed the immutable production queue evidence.";
    case "production-state-changed-blocker-still-live":
      return "The sent production choice changed observed production state, but the matching production-choice blocker remains live.";
    case "validation-changed":
      return "The sent production choice changed the subsequent production validation result.";
    case "no-state-change":
      return "The production choice was sent, but no observed city production, blocker, or validation state changed.";
    case "missing-postcondition":
      return "The production choice was sent, but one or more required production or blocker probes failed or were unreadable; do not repeat it until complete postcondition evidence is available.";
  }
}

type MatchingProductionBlockerState = "matching" | "clear" | "unknown";

function matchingProductionBlockerState(
  snapshot: Civ7ControlOrpcProductionChoiceSnapshot
): MatchingProductionBlockerState {
  if (!recognizedTopLevelBlocker(snapshot.blocker)) return "unknown";

  const notification = snapshot.blockingProductionNotification;
  if (!notification.ok) return "unknown";
  if (notification.value == null) return "clear";
  if (!isRecord(notification.value)) return "unknown";

  const blockerType = productionBlockerTypeState(notification.value);
  if (blockerType !== "production") return blockerType;

  const target = notification.value.target;
  if (!isComponentId(target)) return "unknown";
  return componentIdMatchState(target, snapshot.cityId);
}

function recognizedTopLevelBlocker(
  blocker: Civ7ControlOrpcProductionChoiceSnapshot["blocker"]
): boolean {
  if (!blocker.ok) return false;
  const value = blocker.value;
  return Number.isInteger(value) || (typeof value === "string" && value.length > 0);
}

function componentIdMatchState(
  left: Civ7CityProductionChoiceInput["cityId"],
  right: Civ7CityProductionChoiceInput["cityId"]
): MatchingProductionBlockerState {
  if (left.owner !== right.owner || left.id !== right.id) return "clear";

  const leftType = left.type;
  const rightType = right.type;
  if (leftType === undefined && rightType === undefined) return "matching";
  if (leftType === undefined || rightType === undefined) return "unknown";
  return leftType === rightType ? "matching" : "clear";
}

function productionBlockerTypeState(
  value: Readonly<Record<string, unknown>>
): "production" | "clear" | "unknown" {
  const typeName = value.typeName;
  if (typeof typeName !== "string" || typeName.length === 0) return "unknown";
  return typeName === "NOTIFICATION_CHOOSE_CITY_PRODUCTION" ? "production" : "clear";
}

function snapshotHasRequiredProbeFailure(
  cityId: Civ7CityProductionChoiceInput["cityId"],
  snapshot: Civ7ControlOrpcProductionChoiceSnapshot
): boolean {
  const city = snapshot.city;
  const buildQueue = snapshot.buildQueue;
  return (
    !Value.Equal(cityId, snapshot.cityId) ||
    !city.ok ||
    city.value == null ||
    !Value.Equal(cityId, city.value.id) ||
    city.value.observedCityId == null ||
    !Value.Equal(cityId, city.value.observedCityId) ||
    !buildQueue.ok ||
    buildQueue.value == null ||
    matchingProductionBlockerState(snapshot) === "unknown"
  );
}

function probeValueChanged<T>(
  left: Readonly<{ ok: true; value: T } | { ok: false; error: string }>,
  right: Readonly<{ ok: true; value: T } | { ok: false; error: string }>
): boolean {
  return left.ok && right.ok && !Value.Equal(left.value, right.value);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isComponentId(value: unknown): value is Civ7CityProductionChoiceInput["cityId"] {
  return (
    isRecord(value) &&
    Number.isInteger(value.owner) &&
    Number.isInteger(value.id) &&
    (value.type === undefined || Number.isInteger(value.type))
  );
}
