import type {
  Civ7ControlOrpcTurnCompletionCheckResult,
  Civ7ControlOrpcTurnCompletionSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7TurnCompletionResult } from "../../contract";

export type Civ7TurnCompletionPostconditionEvidence =
  | Readonly<{ kind: "not-sent" }>
  | Readonly<{ kind: "send-result-unavailable" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "observed";
      before: Civ7ControlOrpcTurnCompletionSnapshot;
      after: Civ7ControlOrpcTurnCompletionSnapshot;
    }>;

/** Availability requires one coherent native snapshot that is safe to dispatch against. */
export function turnCompletionAvailable(check: Civ7ControlOrpcTurnCompletionCheckResult): boolean {
  const snapshot = check.snapshot;
  return (
    validLocalPlayerId(snapshot.localPlayerId) &&
    readableTurn(snapshot.turn) !== null &&
    snapshot.hasSentTurnComplete.ok &&
    snapshot.hasSentTurnComplete.value === false &&
    snapshot.canEndTurn.ok &&
    snapshot.canEndTurn.value === true
  );
}

export function civ7TurnCompletionPostcondition(
  evidence: Civ7TurnCompletionPostconditionEvidence
): Civ7TurnCompletionResult["postcondition"] {
  if (evidence.kind === "not-sent") {
    return notSentPostcondition(
      "Fresh native turn-completion evidence did not admit the request, so no gameplay send was attempted."
    );
  }
  if (evidence.kind === "send-result-unavailable") {
    return missingPostcondition(
      "The turn-completion send result is unavailable, so gameplay dispatch is unknown and the request must not be repeated."
    );
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingPostcondition(
      "Turn completion was sent, but no readable post-send evidence was available before the polling deadline."
    );
  }

  if (!sameValidLocalPlayer(evidence.before.localPlayerId, evidence.after.localPlayerId)) {
    return missingPostcondition(
      "The turn-completion observations did not provide one coherent ambient local-player identity."
    );
  }

  const beforeTurn = readableTurn(evidence.before.turn);
  const afterTurn = readableTurn(evidence.after.turn);
  if (beforeTurn === null || afterTurn === null) {
    return missingPostcondition(
      "The turn-completion observations did not provide readable before and after turn values."
    );
  }
  if (afterTurn > beforeTurn) {
    return {
      classification: "turn-advanced",
      reason: "The observed game turn advanced after the turn-completion send.",
      outcome: "cleared",
      confidence: "confirmed",
      confirmed: true,
      noRepeatAfterUnverified: false,
    };
  }
  if (afterTurn < beforeTurn) {
    return missingPostcondition(
      "The post-send turn value moved backwards, so the observations do not form coherent completion evidence."
    );
  }

  if (!evidence.after.hasSentTurnComplete.ok) {
    return missingPostcondition(
      "The current turn did not advance and its turn-completion acknowledgement was unreadable."
    );
  }
  if (evidence.after.hasSentTurnComplete.value === true) {
    return {
      classification: "turn-complete-sent",
      reason:
        "The runtime acknowledges that turn completion was sent for the current turn; do not repeat while awaiting turn advance.",
      outcome: "state-changed",
      confidence: "confirmed",
      confirmed: true,
      noRepeatAfterUnverified: true,
    };
  }
  return {
    classification: "no-state-change",
    reason:
      "The request was dispatched, but the current turn neither advanced nor acknowledged turn completion.",
    outcome: "no-state-change",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function readableTurn(turn: Civ7ControlOrpcTurnCompletionSnapshot["turn"]): number | null {
  return turn.ok && Number.isFinite(turn.value) ? turn.value : null;
}

function validLocalPlayerId(playerId: number): boolean {
  return Number.isInteger(playerId) && playerId >= 0;
}

function sameValidLocalPlayer(before: number, after: number): boolean {
  return validLocalPlayerId(before) && before === after;
}

function notSentPostcondition(
  reason: string
): Extract<Civ7TurnCompletionResult["postcondition"], { classification: "not-sent" }> {
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
): Extract<Civ7TurnCompletionResult["postcondition"], { classification: "missing-postcondition" }> {
  return {
    classification: "missing-postcondition",
    reason,
    outcome: "unknown",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}
