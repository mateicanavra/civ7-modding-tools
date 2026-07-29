import { Value } from "typebox/value";

import type {
  Civ7ControlOrpcFirstMeetResponseSnapshot,
  Civ7ControlOrpcFirstMeetResponseValidationResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7FirstMeetResponseInput, Civ7FirstMeetResponseResult } from "../../contract";
import { firstMeetBlockerState, firstMeetSnapshotMatchesInput } from "./first-meet-admission";

export type Civ7FirstMeetResponsePostconditionEvidence =
  | Readonly<{ kind: "not-admitted" }>
  | Readonly<{ kind: "validation-rejected" }>
  | Readonly<{ kind: "not-dispatched" }>
  | Readonly<{ kind: "send-result-unavailable" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "observed";
      input: Civ7FirstMeetResponseInput;
      beforeValidation: Civ7ControlOrpcFirstMeetResponseValidationResult;
      afterValidation: Civ7ControlOrpcFirstMeetResponseValidationResult;
      before: Civ7ControlOrpcFirstMeetResponseSnapshot;
      after: Civ7ControlOrpcFirstMeetResponseSnapshot;
    }>;

export type Civ7FirstMeetResponseDispatchState = "not-sent" | "sent" | "unknown";

export function civ7FirstMeetResponsePostcondition(
  evidence: Civ7FirstMeetResponsePostconditionEvidence
): Civ7FirstMeetResponseResult["postcondition"] {
  if (evidence.kind === "not-admitted") {
    return notSentPostcondition(
      "Fresh native validation and exact first-meet blocker evidence did not admit the response."
    );
  }
  if (evidence.kind === "validation-rejected") {
    return notSentPostcondition(
      "The guarded first-meet response did not pass fresh native validation, so it was not sent."
    );
  }
  if (evidence.kind === "not-dispatched") {
    return notSentPostcondition(
      "The guarded send failed before the native first-meet response was invoked."
    );
  }
  if (evidence.kind === "send-result-unavailable") {
    return missingPostcondition(
      "The first-meet send result is unavailable, so gameplay dispatch is unknown and the request must not be repeated."
    );
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingPostcondition(
      "The first-meet response was sent, but no readable post-send evidence was available before the polling deadline."
    );
  }

  if (!coherentSnapshots(evidence.input, evidence.before, evidence.after)) {
    return missingPostcondition(
      "The first-meet observations did not provide one coherent response and ambient local-player identity."
    );
  }

  const beforeBlocker = firstMeetBlockerState(evidence.before, evidence.input.metPlayerId);
  if (beforeBlocker.kind !== "matching") {
    return missingPostcondition(
      "The pre-send observation did not identify the exact first-meet blocker required for completion proof."
    );
  }

  const afterBlocker = firstMeetBlockerState(
    evidence.after,
    evidence.input.metPlayerId,
    beforeBlocker.id
  );
  if (afterBlocker.kind === "clear") {
    return {
      classification: "first-meet-cleared",
      reason:
        "The exact first-meet blocker observed before dispatch no longer occupies the local player's blocking notification slot.",
      outcome: "cleared",
      confidence: "confirmed",
      confirmed: true,
      noRepeatAfterUnverified: false,
    };
  }
  if (afterBlocker.kind === "matching") {
    return {
      classification: "first-meet-still-active",
      reason:
        "The exact first-meet blocker observed before dispatch remains in the local player's blocking notification slot.",
      outcome: "still-blocked",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }
  if (focusedRuntimeChanged(evidence)) {
    return {
      classification: "first-meet-runtime-state-changed",
      reason:
        "Focused first-meet runtime evidence changed after dispatch, but exact blocker clearance was not observable.",
      outcome: "state-changed",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }
  return missingPostcondition(
    "Post-send blocker evidence did not prove whether the exact first-meet blocker cleared."
  );
}

export function firstMeetResponseResult(
  input: Civ7FirstMeetResponseInput,
  dispatchState: Civ7FirstMeetResponseDispatchState,
  evidence: Civ7FirstMeetResponsePostconditionEvidence
): Civ7FirstMeetResponseResult {
  const postcondition = civ7FirstMeetResponsePostcondition(evidence);
  const target = {
    metPlayerId: input.metPlayerId,
    response: input.response,
  };

  if (dispatchState === "not-sent") {
    if (postcondition.classification !== "not-sent") {
      throw new Error("A first-meet response that was not sent must report not-sent.");
    }
    return {
      ...target,
      status: "not-sent",
      postcondition,
      nextSteps: [
        {
          kind: "inspect-first-meet-response",
          source: "diplomacy.firstMeet.response.request",
          label:
            "Inspect exact first-meet response availability before attempting another request.",
        },
      ],
    };
  }

  if (postcondition.classification === "not-sent") {
    throw new Error("A dispatched first-meet response cannot report not-sent.");
  }

  if (dispatchState === "unknown") {
    if (postcondition.confidence === "confirmed") {
      return {
        ...target,
        status: "dispatch-unknown",
        postcondition,
        nextSteps: [
          {
            kind: "refresh-attention",
            source: "diplomacy.firstMeet.response.request",
            label: "Refresh current attention before choosing the next player action.",
          },
        ],
      };
    }
    return {
      ...target,
      status: "dispatch-unknown",
      postcondition,
      nextSteps: firstMeetNoRepeatNextSteps(input),
    };
  }

  if (postcondition.confidence === "confirmed") {
    return {
      ...target,
      status: "sent-confirmed",
      postcondition,
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "diplomacy.firstMeet.response.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    };
  }
  return {
    ...target,
    status: "sent-unverified",
    postcondition,
    nextSteps: firstMeetNoRepeatNextSteps(input),
  };
}

function coherentSnapshots(
  input: Civ7FirstMeetResponseInput,
  before: Civ7ControlOrpcFirstMeetResponseSnapshot,
  after: Civ7ControlOrpcFirstMeetResponseSnapshot
): boolean {
  return (
    firstMeetSnapshotMatchesInput(input, before) &&
    firstMeetSnapshotMatchesInput(input, after) &&
    before.localPlayerId === after.localPlayerId &&
    before.responseType === after.responseType &&
    Object.is(before.noneBlockerType, after.noneBlockerType)
  );
}

function focusedRuntimeChanged(
  evidence: Extract<Civ7FirstMeetResponsePostconditionEvidence, { kind: "observed" }>
): boolean {
  return (
    (evidence.before.canEndTurn.ok &&
      evidence.after.canEndTurn.ok &&
      evidence.before.canEndTurn.value !== evidence.after.canEndTurn.value) ||
    evidence.beforeValidation.valid !== evidence.afterValidation.valid ||
    !Value.Equal(evidence.beforeValidation.result, evidence.afterValidation.result)
  );
}

function firstMeetNoRepeatNextSteps(
  input: Civ7FirstMeetResponseInput
): Extract<Civ7FirstMeetResponseResult, { status: "sent-unverified" }>["nextSteps"] {
  return [
    {
      kind: "do-not-repeat",
      source: "diplomacy.firstMeet.response.request",
      label: `Do not repeat the ${input.response} first-meet response to player ${input.metPlayerId} until fresh exact blocker evidence is read.`,
    },
  ];
}

function notSentPostcondition(
  reason: string
): Extract<Civ7FirstMeetResponseResult["postcondition"], { classification: "not-sent" }> {
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
  Civ7FirstMeetResponseResult["postcondition"],
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
