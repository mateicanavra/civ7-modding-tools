import { Value } from "typebox/value";

import type {
  Civ7ControlOrpcDiplomacyResponseSnapshot,
  Civ7ControlOrpcDiplomacyResponseValidationResult,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7DiplomacyResponseInput, Civ7DiplomacyResponseResult } from "../../contract";
import {
  diplomacyResponseBlockerState,
  diplomacyResponseSnapshotIdentityMatchesInput,
  diplomacyResponseSnapshotMatchesInput,
} from "./diplomacy-response-admission";

export type Civ7DiplomacyResponsePostconditionEvidence =
  | Readonly<{ kind: "not-admitted" }>
  | Readonly<{ kind: "dedicated-war-workflow-required" }>
  | Readonly<{ kind: "validation-rejected" }>
  | Readonly<{ kind: "not-dispatched" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "observed";
      input: Civ7DiplomacyResponseInput;
      beforeValidation: Civ7ControlOrpcDiplomacyResponseValidationResult;
      afterValidation: Civ7ControlOrpcDiplomacyResponseValidationResult;
      before: Civ7ControlOrpcDiplomacyResponseSnapshot;
      after: Civ7ControlOrpcDiplomacyResponseSnapshot;
    }>;

export type Civ7DiplomacyResponseDispatchState = "not-sent" | "sent" | "unknown";

export function civ7DiplomacyResponsePostcondition(
  evidence: Civ7DiplomacyResponsePostconditionEvidence
): Civ7DiplomacyResponseResult["postcondition"] {
  if (evidence.kind === "not-admitted") {
    return notSentPostcondition(
      "Fresh native validation, offered-response membership, and exact blocker evidence did not admit the response."
    );
  }
  if (evidence.kind === "dedicated-war-workflow-required") {
    return {
      classification: "war-confirmation-required",
      reason:
        "Rejecting a military-presence denunciation requires Civ7's dedicated war-confirmation workflow.",
      outcome: "requires-war-confirmation",
      confidence: "confirmed",
      confirmed: false,
      noRepeatAfterUnverified: false,
    };
  }
  if (evidence.kind === "validation-rejected") {
    return notSentPostcondition(
      "The guarded diplomacy response did not pass fresh native validation, so it was not sent."
    );
  }
  if (evidence.kind === "not-dispatched") {
    return notSentPostcondition(
      "The guarded send failed before the native diplomacy response was invoked."
    );
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingPostcondition(
      "The diplomacy response was dispatched, but no readable post-send evidence was available before the polling deadline."
    );
  }

  if (!coherentSnapshots(evidence.input, evidence.before, evidence.after)) {
    return missingPostcondition(
      "The diplomacy observations did not provide one coherent action, response, and ambient local-player identity."
    );
  }

  const beforeBlocker = diplomacyResponseBlockerState(evidence.before, evidence.input.actionId);
  if (beforeBlocker.kind !== "matching") {
    return missingPostcondition(
      "The pre-send observation did not identify the exact diplomacy-response blocker required for completion proof."
    );
  }

  const afterBlocker = diplomacyResponseBlockerState(
    evidence.after,
    evidence.input.actionId,
    beforeBlocker.id
  );
  if (afterBlocker.kind === "clear") {
    return {
      classification: "diplomacy-response-cleared",
      reason:
        "The exact diplomacy-response blocker observed before dispatch no longer occupies the local player's blocking notification slot.",
      outcome: "cleared",
      confidence: "confirmed",
      confirmed: true,
      noRepeatAfterUnverified: false,
    };
  }
  if (afterBlocker.kind === "matching") {
    return {
      classification: "diplomacy-response-still-active",
      reason:
        "The exact diplomacy-response blocker observed before dispatch remains in the local player's blocking notification slot.",
      outcome: "still-blocked",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }
  if (focusedRuntimeChanged(evidence)) {
    return {
      classification: "diplomacy-response-runtime-state-changed",
      reason:
        "Focused diplomacy runtime evidence changed after dispatch, but exact blocker clearance was not observable.",
      outcome: "state-changed",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }
  return missingPostcondition(
    "Post-send blocker evidence did not prove whether the exact diplomacy-response blocker cleared."
  );
}

export function diplomacyResponseResult(
  input: Civ7DiplomacyResponseInput,
  dispatchState: Civ7DiplomacyResponseDispatchState,
  evidence: Civ7DiplomacyResponsePostconditionEvidence
): Civ7DiplomacyResponseResult {
  const postcondition = civ7DiplomacyResponsePostcondition(evidence);
  const target = {
    actionId: input.actionId,
    responseType: input.responseType,
  };

  if (dispatchState === "not-sent") {
    if (postcondition.classification === "war-confirmation-required") {
      return {
        ...target,
        status: "not-sent",
        postcondition,
        nextSteps: [
          {
            kind: "use-war-confirmation",
            source: "diplomacy.response.request",
            label:
              "Use Civ7's dedicated war-confirmation workflow for this military-presence rejection.",
          },
        ],
      };
    }
    if (postcondition.classification !== "not-sent") {
      throw new Error("A diplomacy response that was not sent must report not-sent.");
    }
    return {
      ...target,
      status: "not-sent",
      postcondition,
      nextSteps: [
        {
          kind: "inspect-diplomacy-response",
          source: "diplomacy.response.request",
          label: "Inspect exact diplomacy-response availability before attempting another request.",
        },
      ],
    };
  }

  if (
    postcondition.classification === "not-sent" ||
    postcondition.classification === "war-confirmation-required"
  ) {
    throw new Error("A dispatched diplomacy response cannot report a pre-dispatch outcome.");
  }

  if (dispatchState === "unknown") {
    return postcondition.confidence === "confirmed"
      ? {
          ...target,
          status: "dispatch-unknown",
          postcondition,
          nextSteps: refreshNextSteps(),
        }
      : {
          ...target,
          status: "dispatch-unknown",
          postcondition,
          nextSteps: noRepeatNextSteps(input),
        };
  }

  return postcondition.confidence === "confirmed"
    ? {
        ...target,
        status: "sent-confirmed",
        postcondition,
        nextSteps: refreshNextSteps(),
      }
    : {
        ...target,
        status: "sent-unverified",
        postcondition,
        nextSteps: noRepeatNextSteps(input),
      };
}

function coherentSnapshots(
  input: Civ7DiplomacyResponseInput,
  before: Civ7ControlOrpcDiplomacyResponseSnapshot,
  after: Civ7ControlOrpcDiplomacyResponseSnapshot
): boolean {
  return (
    diplomacyResponseSnapshotMatchesInput(input, before) &&
    diplomacyResponseSnapshotIdentityMatchesInput(input, after) &&
    before.localPlayerId === after.localPlayerId &&
    before.denounceMilitaryPresenceActionType === after.denounceMilitaryPresenceActionType &&
    before.rejectionResponseType === after.rejectionResponseType &&
    Object.is(before.noneBlockerType, after.noneBlockerType)
  );
}

function focusedRuntimeChanged(
  evidence: Extract<Civ7DiplomacyResponsePostconditionEvidence, { kind: "observed" }>
): boolean {
  return (
    (evidence.before.canEndTurn.ok &&
      evidence.after.canEndTurn.ok &&
      evidence.before.canEndTurn.value !== evidence.after.canEndTurn.value) ||
    evidence.beforeValidation.valid !== evidence.afterValidation.valid ||
    !Value.Equal(evidence.beforeValidation.result, evidence.afterValidation.result) ||
    !Value.Equal(evidence.before.responseData, evidence.after.responseData) ||
    !Value.Equal(evidence.before.eventActionType, evidence.after.eventActionType)
  );
}

function refreshNextSteps(): Extract<
  Civ7DiplomacyResponseResult,
  { status: "sent-confirmed" }
>["nextSteps"] {
  return [
    {
      kind: "refresh-attention",
      source: "diplomacy.response.request",
      label: "Refresh current attention before choosing the next player action.",
    },
  ];
}

function noRepeatNextSteps(
  input: Civ7DiplomacyResponseInput
): Extract<Civ7DiplomacyResponseResult, { status: "sent-unverified" }>["nextSteps"] {
  return [
    {
      kind: "do-not-repeat",
      source: "diplomacy.response.request",
      label: `Do not repeat diplomacy response ${input.responseType} for action ${input.actionId} until fresh exact blocker evidence is read.`,
    },
  ];
}

function notSentPostcondition(
  reason: string
): Extract<Civ7DiplomacyResponseResult["postcondition"], { classification: "not-sent" }> {
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
  Civ7DiplomacyResponseResult["postcondition"],
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
