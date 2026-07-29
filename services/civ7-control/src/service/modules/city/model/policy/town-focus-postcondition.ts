import { Value } from "typebox/value";

import type {
  Civ7ControlOrpcTownFocusChangeCheckResult,
  Civ7ControlOrpcTownFocusSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7CityTownFocusChangeInput, Civ7CityTownFocusReviewInput } from "../../contract";

export type Civ7TownFocusPostcondition =
  | Readonly<{
      classification: "not-sent";
      reason: string;
      outcome: "not-sent";
      confidence: "unverified";
      confirmed: false;
      noRepeatAfterUnverified: true;
    }>
  | Readonly<{
      classification: "town-focus-selected";
      reason: string;
      outcome: "selected";
      confidence: "confirmed";
      confirmed: true;
      noRepeatAfterUnverified: false;
    }>
  | Readonly<{
      classification: "town-focus-review-cleared";
      reason: string;
      outcome: "review-cleared";
      confidence: "confirmed";
      confirmed: true;
      noRepeatAfterUnverified: false;
    }>
  | Readonly<{
      classification: "no-state-change";
      reason: string;
      outcome: "no-state-change";
      confidence: "unverified";
      confirmed: false;
      noRepeatAfterUnverified: true;
    }>
  | Readonly<{
      classification: "missing-postcondition";
      reason: string;
      outcome: "unknown";
      confidence: "unverified";
      confirmed: false;
      noRepeatAfterUnverified: true;
    }>;

export type Civ7TownFocusChangePostconditionEvidence =
  | Readonly<{ kind: "not-sent" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{ kind: "selected" }>
  | Readonly<{
      kind: "observed";
      input: Civ7CityTownFocusChangeInput;
      before: Civ7ControlOrpcTownFocusSnapshot;
      after: Civ7ControlOrpcTownFocusSnapshot;
    }>;

export type Civ7TownFocusReviewPostconditionEvidence =
  | Readonly<{ kind: "not-sent" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{ kind: "complete" }>
  | Readonly<{
      kind: "observed";
      input: Civ7CityTownFocusReviewInput;
      before: Civ7ControlOrpcTownFocusSnapshot;
      after: Civ7ControlOrpcTownFocusSnapshot;
    }>;

export function townFocusChangeCheckStatus(
  input: Civ7CityTownFocusChangeInput,
  check: Civ7ControlOrpcTownFocusChangeCheckResult
): "available" | "selected" | "unavailable" {
  const state = townFocusSelectionState(input, check.snapshot);
  if (state === "selected") return "selected";
  return state === "other" && check.valid ? "available" : "unavailable";
}

export function townFocusReviewCheckStatus(
  input: Civ7CityTownFocusReviewInput,
  snapshot: Civ7ControlOrpcTownFocusSnapshot
): "available" | "complete" | "unavailable" {
  if (townState(snapshot, input.cityId) !== "town") return "unavailable";
  const review = townFocusReviewState(snapshot, input.cityId);
  if (review === "matching") return "available";
  return review === "clear" ? "complete" : "unavailable";
}

export function civ7TownFocusChangePostcondition(
  evidence: Extract<Civ7TownFocusChangePostconditionEvidence, { kind: "not-sent" }>
): Extract<Civ7TownFocusPostcondition, { classification: "not-sent" }>;
export function civ7TownFocusChangePostcondition(
  evidence: Extract<Civ7TownFocusChangePostconditionEvidence, { kind: "postcheck-unavailable" }>
): Extract<Civ7TownFocusPostcondition, { classification: "missing-postcondition" }>;
export function civ7TownFocusChangePostcondition(
  evidence: Extract<Civ7TownFocusChangePostconditionEvidence, { kind: "selected" }>
): Extract<Civ7TownFocusPostcondition, { classification: "town-focus-selected" }>;
export function civ7TownFocusChangePostcondition(
  evidence: Extract<Civ7TownFocusChangePostconditionEvidence, { kind: "observed" }>
): Extract<
  Civ7TownFocusPostcondition,
  { classification: "town-focus-selected" | "no-state-change" | "missing-postcondition" }
>;
export function civ7TownFocusChangePostcondition(
  evidence: Extract<
    Civ7TownFocusChangePostconditionEvidence,
    { kind: "observed" | "postcheck-unavailable" }
  >
): Extract<
  Civ7TownFocusPostcondition,
  { classification: "town-focus-selected" | "no-state-change" | "missing-postcondition" }
>;
export function civ7TownFocusChangePostcondition(
  evidence: Civ7TownFocusChangePostconditionEvidence
): Civ7TownFocusPostcondition;
export function civ7TownFocusChangePostcondition(
  evidence: Civ7TownFocusChangePostconditionEvidence
): Civ7TownFocusPostcondition {
  if (evidence.kind === "not-sent") {
    return notSentPostcondition("The town focus change was not sent.");
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingPostcondition(
      "The town focus change may have been sent, but complete post-send town state is unavailable."
    );
  }
  if (evidence.kind === "selected") {
    return selectedPostcondition("The requested focus is already selected.");
  }
  const after = townFocusSelectionState(evidence.input, evidence.after);
  if (after === "selected") {
    return selectedPostcondition(
      "The observed town growth and project types match the requested focus."
    );
  }
  if (
    after === "unknown" ||
    townFocusSelectionState(evidence.input, evidence.before) === "unknown"
  ) {
    return missingPostcondition(
      "The town focus change was sent, but the required town state evidence is incomplete."
    );
  }
  return unchangedPostcondition(
    "The town focus change was sent, but the requested focus is not yet observable."
  );
}

export function civ7TownFocusReviewPostcondition(
  evidence: Extract<Civ7TownFocusReviewPostconditionEvidence, { kind: "not-sent" }>
): Extract<Civ7TownFocusPostcondition, { classification: "not-sent" }>;
export function civ7TownFocusReviewPostcondition(
  evidence: Extract<Civ7TownFocusReviewPostconditionEvidence, { kind: "postcheck-unavailable" }>
): Extract<Civ7TownFocusPostcondition, { classification: "missing-postcondition" }>;
export function civ7TownFocusReviewPostcondition(
  evidence: Extract<Civ7TownFocusReviewPostconditionEvidence, { kind: "complete" }>
): Extract<Civ7TownFocusPostcondition, { classification: "town-focus-review-cleared" }>;
export function civ7TownFocusReviewPostcondition(
  evidence: Extract<Civ7TownFocusReviewPostconditionEvidence, { kind: "observed" }>
): Extract<
  Civ7TownFocusPostcondition,
  { classification: "town-focus-review-cleared" | "no-state-change" | "missing-postcondition" }
>;
export function civ7TownFocusReviewPostcondition(
  evidence: Extract<
    Civ7TownFocusReviewPostconditionEvidence,
    { kind: "observed" | "postcheck-unavailable" }
  >
): Extract<
  Civ7TownFocusPostcondition,
  { classification: "town-focus-review-cleared" | "no-state-change" | "missing-postcondition" }
>;
export function civ7TownFocusReviewPostcondition(
  evidence: Civ7TownFocusReviewPostconditionEvidence
): Civ7TownFocusPostcondition;
export function civ7TownFocusReviewPostcondition(
  evidence: Civ7TownFocusReviewPostconditionEvidence
): Civ7TownFocusPostcondition {
  if (evidence.kind === "not-sent") {
    return notSentPostcondition("The town project review was not sent.");
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingPostcondition(
      "The town project review may have been sent, but complete post-send blocker evidence is unavailable."
    );
  }
  if (evidence.kind === "complete") {
    return reviewClearedPostcondition("No matching town project review blocker remains.");
  }
  if (
    townState(evidence.before, evidence.input.cityId) !== "town" ||
    townState(evidence.after, evidence.input.cityId) !== "town"
  ) {
    return missingPostcondition(
      "The town project review evidence does not identify the requested town."
    );
  }
  const before = townFocusReviewState(evidence.before, evidence.input.cityId);
  const after = townFocusReviewState(evidence.after, evidence.input.cityId);
  if (after === "clear") {
    return reviewClearedPostcondition(
      before === "matching"
        ? "The matching town project review blocker cleared."
        : "No matching town project review blocker remains."
    );
  }
  if (before === "unknown" || after === "unknown") {
    return missingPostcondition(
      "The town project review was sent, but the required blocker evidence is incomplete."
    );
  }
  return unchangedPostcondition(
    "The town project review was sent, but its matching blocker remains live."
  );
}

function townFocusSelectionState(
  input: Civ7CityTownFocusChangeInput,
  snapshot: Civ7ControlOrpcTownFocusSnapshot
): "selected" | "other" | "unknown" {
  if (townState(snapshot, input.cityId) !== "town") return "unknown";
  const city = snapshot.city;
  if (!city.ok || city.value == null) return "unknown";
  if (!Number.isInteger(city.value.growthType) || !Number.isInteger(city.value.projectType)) {
    return "unknown";
  }
  return city.value.growthType === input.growthType && city.value.projectType === input.projectType
    ? "selected"
    : "other";
}

function townState(
  snapshot: Civ7ControlOrpcTownFocusSnapshot,
  cityId: Civ7CityTownFocusReviewInput["cityId"]
): "town" | "not-town" | "unknown" {
  if (!Value.Equal(snapshot.cityId, cityId)) return "unknown";
  const city = snapshot.city;
  if (!city.ok || city.value == null || !Value.Equal(city.value.observedCityId, cityId)) {
    return "unknown";
  }
  if (city.value.owner !== cityId.owner || typeof city.value.isTown !== "boolean") {
    return "unknown";
  }
  return city.value.isTown ? "town" : "not-town";
}

function townFocusReviewState(
  snapshot: Civ7ControlOrpcTownFocusSnapshot,
  cityId: Civ7CityTownFocusReviewInput["cityId"]
): "matching" | "clear" | "unknown" {
  if (!snapshot.blocker.ok || !isRecognizedBlocker(snapshot.blocker.value)) return "unknown";
  const notification = snapshot.blockingTownFocusNotification;
  if (!notification.ok) return "unknown";
  if (notification.value == null) return "clear";
  if (notification.value.typeName == null) return "unknown";
  if (notification.value.typeName !== "NOTIFICATION_CHOOSE_TOWN_PROJECT") return "clear";
  if (notification.value.target == null) return "unknown";
  return componentIdMatchState(notification.value.target, cityId);
}

function isRecognizedBlocker(value: number | string | null): boolean {
  return Number.isInteger(value) || (typeof value === "string" && value.trim().length > 0);
}

function componentIdMatchState(
  left: Civ7CityTownFocusReviewInput["cityId"],
  right: Civ7CityTownFocusReviewInput["cityId"]
): "matching" | "clear" | "unknown" {
  if (left.owner !== right.owner || left.id !== right.id) return "clear";
  if (left.type === undefined && right.type === undefined) return "matching";
  if (left.type === undefined || right.type === undefined) return "unknown";
  return left.type === right.type ? "matching" : "clear";
}

function selectedPostcondition(
  reason: string
): Extract<Civ7TownFocusPostcondition, { classification: "town-focus-selected" }> {
  return {
    classification: "town-focus-selected",
    reason,
    outcome: "selected",
    confidence: "confirmed",
    confirmed: true,
    noRepeatAfterUnverified: false,
  };
}

function reviewClearedPostcondition(
  reason: string
): Extract<Civ7TownFocusPostcondition, { classification: "town-focus-review-cleared" }> {
  return {
    classification: "town-focus-review-cleared",
    reason,
    outcome: "review-cleared",
    confidence: "confirmed",
    confirmed: true,
    noRepeatAfterUnverified: false,
  };
}

function notSentPostcondition(
  reason: string
): Extract<Civ7TownFocusPostcondition, { classification: "not-sent" }> {
  return {
    classification: "not-sent",
    reason,
    outcome: "not-sent",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function unchangedPostcondition(
  reason: string
): Extract<Civ7TownFocusPostcondition, { classification: "no-state-change" }> {
  return {
    classification: "no-state-change",
    reason,
    outcome: "no-state-change",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function missingPostcondition(
  reason: string
): Extract<Civ7TownFocusPostcondition, { classification: "missing-postcondition" }> {
  return {
    classification: "missing-postcondition",
    reason,
    outcome: "unknown",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}
