import type {
  Civ7ControlOrpcCelebrationChoiceCheckResult,
  Civ7ControlOrpcCelebrationChoiceSnapshot,
  Civ7ControlOrpcGovernmentChoiceCheckResult,
  Civ7ControlOrpcGovernmentChoiceSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7GovernmentCelebrationChoiceInput,
  Civ7GovernmentCelebrationChoiceResult,
  Civ7GovernmentChoiceInput,
  Civ7GovernmentChoiceResult,
} from "../../contract";

type ChoiceBlockerState = "matching" | "clear" | "unknown";

export type Civ7GovernmentChoicePostconditionEvidence =
  | Readonly<{ kind: "not-sent" }>
  | Readonly<{ kind: "send-result-unavailable" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "observed";
      input: Civ7GovernmentChoiceInput;
      before: Civ7ControlOrpcGovernmentChoiceSnapshot;
      after: Civ7ControlOrpcGovernmentChoiceSnapshot;
    }>;

export type Civ7CelebrationChoicePostconditionEvidence =
  | Readonly<{ kind: "not-sent" }>
  | Readonly<{ kind: "send-result-unavailable" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "observed";
      input: Civ7GovernmentCelebrationChoiceInput;
      before: Civ7ControlOrpcCelebrationChoiceSnapshot;
      after: Civ7ControlOrpcCelebrationChoiceSnapshot;
    }>;

export function governmentChoiceAvailable(
  input: Civ7GovernmentChoiceInput,
  check: Civ7ControlOrpcGovernmentChoiceCheckResult
): boolean {
  const snapshot = check.snapshot;
  return (
    check.valid &&
    validLocalPlayerId(snapshot.localPlayerId) &&
    Number.isInteger(snapshot.activateAction) &&
    snapshot.currentGovernmentType !== input.governmentType &&
    choiceBlockerState(
      snapshot.localPlayerId,
      snapshot.blocker,
      snapshot.blockingNotification,
      "NOTIFICATION_CHOOSE_GOVERNMENT"
    ) === "matching"
  );
}

export function celebrationChoiceAvailable(
  input: Civ7GovernmentCelebrationChoiceInput,
  check: Civ7ControlOrpcCelebrationChoiceCheckResult
): boolean {
  const snapshot = check.snapshot;
  return (
    check.valid &&
    validLocalPlayerId(snapshot.localPlayerId) &&
    snapshot.currentGoldenAgeType !== input.goldenAgeType &&
    choiceBlockerState(
      snapshot.localPlayerId,
      snapshot.blocker,
      snapshot.blockingNotification,
      "NOTIFICATION_CHOOSE_GOLDEN_AGE"
    ) === "matching"
  );
}

export function civ7GovernmentChoicePostcondition(
  evidence: Civ7GovernmentChoicePostconditionEvidence
): Civ7GovernmentChoiceResult["postcondition"] {
  if (evidence.kind === "not-sent") {
    return notSentPostcondition(
      "Fresh government choice evidence did not admit the exact target, so no gameplay send was attempted."
    );
  }
  if (evidence.kind === "send-result-unavailable") {
    return missingGovernmentPostcondition(
      "The government send result is unavailable, so gameplay dispatch is unknown and the request must not be repeated."
    );
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingGovernmentPostcondition(
      "The government choice was sent, but no readable post-send target evidence was available before the polling deadline."
    );
  }

  const beforeBlocker = governmentBlockerState(evidence.before);
  const afterBlocker = governmentBlockerState(evidence.after);
  if (
    !sameValidLocalPlayer(evidence.before.localPlayerId, evidence.after.localPlayerId) ||
    beforeBlocker === "unknown" ||
    afterBlocker === "unknown"
  ) {
    return missingGovernmentPostcondition(
      "The government choice observations did not provide coherent local-player and blocker evidence."
    );
  }

  const beforeSelected = evidence.before.currentGovernmentType === evidence.input.governmentType;
  const afterSelected = evidence.after.currentGovernmentType === evidence.input.governmentType;
  if (!beforeSelected && beforeBlocker === "matching" && afterSelected) {
    if (afterBlocker === "clear") {
      return {
        classification: "government-selected",
        reason:
          "The local player's current government transitioned to the requested government and the matching government-choice blocker cleared.",
        outcome: "selected",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      };
    }
    return {
      classification: "government-selected-blocker-still-live",
      reason:
        "The requested government is observable, but the matching government-choice blocker remains live.",
      outcome: "still-blocked",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }
  return {
    classification: "no-target-state-change",
    reason:
      "The observations do not prove a transition from another government to the requested government with matching blocker clearance.",
    outcome: "no-target-state-change",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

export function civ7CelebrationChoicePostcondition(
  evidence: Civ7CelebrationChoicePostconditionEvidence
): Civ7GovernmentCelebrationChoiceResult["postcondition"] {
  if (evidence.kind === "not-sent") {
    return notSentPostcondition(
      "Fresh celebration choice evidence did not admit the exact target, so no gameplay send was attempted."
    );
  }
  if (evidence.kind === "send-result-unavailable") {
    return missingCelebrationPostcondition(
      "The celebration send result is unavailable, so gameplay dispatch is unknown and the request must not be repeated."
    );
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingCelebrationPostcondition(
      "The celebration choice was sent, but no readable post-send target evidence was available before the polling deadline."
    );
  }

  const beforeBlocker = celebrationBlockerState(evidence.before);
  const afterBlocker = celebrationBlockerState(evidence.after);
  if (
    !sameValidLocalPlayer(evidence.before.localPlayerId, evidence.after.localPlayerId) ||
    beforeBlocker === "unknown" ||
    afterBlocker === "unknown"
  ) {
    return missingCelebrationPostcondition(
      "The celebration choice observations did not provide coherent local-player and blocker evidence."
    );
  }

  const beforeSelected =
    evidence.before.isInGoldenAge &&
    evidence.before.currentGoldenAgeType === evidence.input.goldenAgeType;
  const afterSelected =
    evidence.after.isInGoldenAge &&
    evidence.after.currentGoldenAgeType === evidence.input.goldenAgeType;
  if (!beforeSelected && beforeBlocker === "matching" && afterSelected) {
    if (afterBlocker === "clear") {
      return {
        classification: "celebration-selected",
        reason:
          "The local player entered the requested golden age and the matching celebration-choice blocker cleared.",
        outcome: "selected",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      };
    }
    return {
      classification: "celebration-selected-blocker-still-live",
      reason:
        "The requested golden age is observable, but the matching celebration-choice blocker remains live.",
      outcome: "still-blocked",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }
  return {
    classification: "no-target-state-change",
    reason:
      "The observations do not prove entry into the requested golden age with matching blocker clearance.",
    outcome: "no-target-state-change",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function governmentBlockerState(
  snapshot: Civ7ControlOrpcGovernmentChoiceSnapshot
): ChoiceBlockerState {
  return choiceBlockerState(
    snapshot.localPlayerId,
    snapshot.blocker,
    snapshot.blockingNotification,
    "NOTIFICATION_CHOOSE_GOVERNMENT"
  );
}

function celebrationBlockerState(
  snapshot: Civ7ControlOrpcCelebrationChoiceSnapshot
): ChoiceBlockerState {
  return choiceBlockerState(
    snapshot.localPlayerId,
    snapshot.blocker,
    snapshot.blockingNotification,
    "NOTIFICATION_CHOOSE_GOLDEN_AGE"
  );
}

function choiceBlockerState(
  localPlayerId: number,
  blocker: Civ7ControlOrpcGovernmentChoiceSnapshot["blocker"],
  notification: Civ7ControlOrpcGovernmentChoiceSnapshot["blockingNotification"],
  typeName: "NOTIFICATION_CHOOSE_GOVERNMENT" | "NOTIFICATION_CHOOSE_GOLDEN_AGE"
): ChoiceBlockerState {
  if (!blocker.ok || !notification.ok) return "unknown";
  const blockerState = blockerReadingState(blocker.value);
  if (blockerState === "unknown") return "unknown";
  if (notification.value === null) {
    return blockerState === "clear" ? "clear" : "unknown";
  }
  if (
    notification.value.typeName === null ||
    !validLocalPlayerId(localPlayerId) ||
    notification.value.id.owner !== localPlayerId ||
    blockerState !== "live"
  ) {
    return "unknown";
  }
  if (notification.value.typeName !== typeName) return "clear";
  return "matching";
}

function blockerReadingState(blocker: number | string | null): "clear" | "live" | "unknown" {
  if (blocker === null || blocker === 0 || blocker === "0") return "clear";
  if (Number.isInteger(blocker) || (typeof blocker === "string" && blocker.length > 0)) {
    return "live";
  }
  return "unknown";
}

function validLocalPlayerId(playerId: number): boolean {
  return Number.isInteger(playerId) && playerId >= 0;
}

function sameValidLocalPlayer(before: number, after: number): boolean {
  return validLocalPlayerId(before) && before === after;
}

function notSentPostcondition(
  reason: string
):
  | Extract<Civ7GovernmentChoiceResult["postcondition"], { classification: "not-sent" }>
  | Extract<
      Civ7GovernmentCelebrationChoiceResult["postcondition"],
      { classification: "not-sent" }
    > {
  return {
    classification: "not-sent",
    reason,
    outcome: "not-sent",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function missingGovernmentPostcondition(
  reason: string
): Extract<
  Civ7GovernmentChoiceResult["postcondition"],
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

function missingCelebrationPostcondition(
  reason: string
): Extract<
  Civ7GovernmentCelebrationChoiceResult["postcondition"],
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
