import { Value } from "typebox/value";

import type { Civ7ControlOrpcComponentId } from "#civ7-control-service/model/dto/primitives";
import type {
  Civ7ControlOrpcNarrativeChoiceCheckResult,
  Civ7ControlOrpcNarrativeChoiceSnapshot,
  Civ7ControlOrpcNarrativeChoiceValidationResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7NarrativeChoiceInput, Civ7NarrativeChoiceResult } from "../../contract";

type NarrativeBlockerState =
  | Readonly<{ kind: "matching"; id: Civ7ControlOrpcComponentId }>
  | Readonly<{ kind: "clear" }>
  | Readonly<{ kind: "unknown" }>;
type NarrativeBlockerIdentity = Extract<
  Civ7ControlOrpcNarrativeChoiceSnapshot["blocker"],
  { ok: true }
>["value"];

export type Civ7NarrativeChoicePostconditionEvidence =
  | Readonly<{ kind: "not-sent" }>
  | Readonly<{ kind: "send-result-unavailable" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "observed";
      input: Civ7NarrativeChoiceInput;
      beforeValidation: Civ7ControlOrpcNarrativeChoiceValidationResult;
      afterValidation: Civ7ControlOrpcNarrativeChoiceValidationResult;
      before: Civ7ControlOrpcNarrativeChoiceSnapshot;
      after: Civ7ControlOrpcNarrativeChoiceSnapshot;
    }>;

/**
 * Native canStart is the sole narrative admission authority.
 *
 * Narrative option rows are useful observation for callers, but membership in
 * those rows cannot overrule the official validator for nonblocking events.
 */
export function narrativeChoiceAvailable(
  check: Civ7ControlOrpcNarrativeChoiceCheckResult
): boolean {
  return check.valid;
}

export function civ7NarrativeChoicePostcondition(
  evidence: Civ7NarrativeChoicePostconditionEvidence
): Civ7NarrativeChoiceResult["postcondition"] {
  if (evidence.kind === "not-sent") {
    return notSentPostcondition(
      "Fresh native narrative validation did not admit the exact target and direction, so no gameplay send was attempted."
    );
  }
  if (evidence.kind === "send-result-unavailable") {
    return missingPostcondition(
      "The narrative send result is unavailable, so gameplay dispatch is unknown and the request must not be repeated."
    );
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingPostcondition(
      "The narrative choice was sent, but no readable post-send evidence was available before the polling deadline."
    );
  }

  if (!sameValidLocalPlayer(evidence.before.localPlayerId, evidence.after.localPlayerId)) {
    return missingPostcondition(
      "The narrative observations did not provide one coherent ambient local-player identity."
    );
  }

  const beforeBlocker = narrativeBlockerState(evidence.before);
  if (beforeBlocker.kind === "unknown") {
    return missingPostcondition(
      "The pre-send narrative blocker and notification observations were unresolved."
    );
  }
  const afterBlocker = narrativeBlockerState(
    evidence.after,
    beforeBlocker.kind === "matching" ? beforeBlocker.id : undefined
  );
  if (afterBlocker.kind === "unknown") {
    return missingPostcondition(
      "The post-send narrative blocker and notification observations were unresolved."
    );
  }

  if (beforeBlocker.kind === "matching") {
    if (afterBlocker.kind === "clear") {
      return {
        classification: "narrative-blocker-cleared",
        reason:
          "The exact narrative blocker observed before dispatch no longer occupies the local player's blocking notification slot.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      };
    }
    return {
      classification: "narrative-blocker-still-live",
      reason:
        "The exact narrative blocker observed before dispatch remains in the local player's blocking notification slot.",
      outcome: "still-blocked",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }

  if (
    afterBlocker.kind === "matching" ||
    canEndTurnChanged(evidence.before, evidence.after) ||
    validationChanged(evidence.beforeValidation, evidence.afterValidation)
  ) {
    return {
      classification: "narrative-runtime-state-changed",
      reason:
        "Focused narrative runtime evidence changed after dispatch, but no exact pre-send narrative blocker existed to prove target-specific completion.",
      outcome: "state-changed",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }

  return {
    classification: "no-target-state-change",
    reason:
      "The request was dispatched, but readable blocker, turn, and native validation evidence did not prove target-specific completion.",
    outcome: "no-target-state-change",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function narrativeBlockerState(
  snapshot: Civ7ControlOrpcNarrativeChoiceSnapshot,
  expectedId?: Civ7ControlOrpcComponentId
): NarrativeBlockerState {
  if (!snapshot.blocker.ok || !snapshot.blockingNotification.ok) {
    return { kind: "unknown" };
  }
  const blockerState = blockerReadingState(snapshot.blocker.value);
  if (blockerState === "unknown") return { kind: "unknown" };

  const notification = snapshot.blockingNotification.value;
  if (blockerState === "clear") {
    return notification === null ? { kind: "clear" } : { kind: "unknown" };
  }
  if (notification === null || notification.typeName === null) {
    return { kind: "unknown" };
  }
  if (
    !validLocalPlayerId(snapshot.localPlayerId) ||
    notification.id.owner !== snapshot.localPlayerId
  ) {
    return { kind: "unknown" };
  }
  if (!isNarrativeBlockerType(notification.typeName)) {
    return { kind: "clear" };
  }
  if (expectedId === undefined) return { kind: "matching", id: notification.id };

  const identity = componentIdMatchState(notification.id, expectedId);
  if (identity === "matching") return { kind: "matching", id: notification.id };
  return identity === "clear" ? { kind: "clear" } : { kind: "unknown" };
}

function isNarrativeBlockerType(typeName: string): boolean {
  return (
    typeName === "NOTIFICATION_CHOOSE_NARRATIVE_STORY_DIRECTION" ||
    typeName === "NOTIFICATION_CHOOSE_DISCOVERY_STORY_DIRECTION" ||
    typeName === "NOTIFICATION_CHOOSE_AUTO_NARRATIVE_STORY_DIRECTION"
  );
}

function blockerReadingState(value: NarrativeBlockerIdentity): "clear" | "live" | "unknown" {
  if (value === 0) return "clear";
  if (
    Number.isInteger(value) ||
    (typeof value === "string" && value.trim().length > 0 && value.trim() !== "0")
  ) {
    return "live";
  }
  return "unknown";
}

function componentIdMatchState(
  left: Readonly<{ owner: number; id: number; type?: number }>,
  right: Readonly<{ owner: number; id: number; type?: number }>
): "matching" | "clear" | "unknown" {
  if (left.owner !== right.owner || left.id !== right.id) return "clear";
  if (left.type === undefined && right.type === undefined) return "matching";
  if (left.type === undefined || right.type === undefined) return "unknown";
  return left.type === right.type ? "matching" : "clear";
}

function canEndTurnChanged(
  before: Civ7ControlOrpcNarrativeChoiceSnapshot,
  after: Civ7ControlOrpcNarrativeChoiceSnapshot
): boolean {
  return (
    before.canEndTurn.ok &&
    after.canEndTurn.ok &&
    before.canEndTurn.value !== after.canEndTurn.value
  );
}

function validationChanged(
  before: Civ7ControlOrpcNarrativeChoiceValidationResult,
  after: Civ7ControlOrpcNarrativeChoiceValidationResult
): boolean {
  return before.valid !== after.valid || !Value.Equal(before.result, after.result);
}

function validLocalPlayerId(playerId: number): boolean {
  return Number.isInteger(playerId) && playerId >= 0;
}

function sameValidLocalPlayer(before: number, after: number): boolean {
  return validLocalPlayerId(before) && before === after;
}

function notSentPostcondition(
  reason: string
): Extract<Civ7NarrativeChoiceResult["postcondition"], { classification: "not-sent" }> {
  return {
    classification: "not-sent",
    reason,
    outcome: "not-sent",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function missingPostcondition(
  reason: string
): Extract<
  Civ7NarrativeChoiceResult["postcondition"],
  { classification: "missing-postcondition" }
> {
  return {
    classification: "missing-postcondition",
    reason,
    outcome: "unknown",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}
