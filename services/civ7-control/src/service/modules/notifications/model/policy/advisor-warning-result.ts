import type { Civ7ControlOrpcComponentId } from "#civ7-control-service/model/dto/primitives";
import type {
  Civ7ControlOrpcAdvisorWarningViewedCheckResult,
  Civ7ControlOrpcAdvisorWarningViewedSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7NotificationAdvisorWarningViewedResult } from "../../contract";
import { isAdvisorWarningNotificationType } from "./advisor-warning-type";

type AdvisorWarningPostcondition = Civ7NotificationAdvisorWarningViewedResult["postcondition"];

export type Civ7AdvisorWarningViewedPostconditionEvidence =
  | Readonly<{ kind: "not-admitted" }>
  | Readonly<{ kind: "validation-rejected" }>
  | Readonly<{ kind: "not-dispatched" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "observed";
      before: Civ7ControlOrpcAdvisorWarningViewedSnapshot;
      after: Civ7ControlOrpcAdvisorWarningViewedSnapshot;
    }>;

export type Civ7AdvisorWarningViewedDispatchState = "not-sent" | "sent" | "unknown";

/** Admits only a live, local, active member of the exact advisor-warning family. */
export function advisorWarningViewedAvailable(
  target: Civ7ControlOrpcComponentId,
  check: Civ7ControlOrpcAdvisorWarningViewedCheckResult
): boolean {
  const snapshot = check.snapshot;
  return (
    check.valid &&
    validLocalPlayerId(snapshot.localPlayerId) &&
    componentIdsEqual(target, snapshot.target) &&
    snapshot.target.owner === snapshot.localPlayerId &&
    snapshot.exists &&
    isAdvisorWarningNotificationType(snapshot.typeName) &&
    snapshot.activeQueue.ok &&
    snapshot.activeQueue.value
  );
}

export function civ7AdvisorWarningViewedPostcondition(
  evidence: Civ7AdvisorWarningViewedPostconditionEvidence
): AdvisorWarningPostcondition {
  if (evidence.kind === "not-admitted") {
    return notSentPostcondition(
      "Fresh native evidence did not admit acknowledgement of the exact advisor warning."
    );
  }
  if (evidence.kind === "validation-rejected") {
    return notSentPostcondition(
      "The guarded advisor-warning acknowledgement did not pass native validation, so it was not sent."
    );
  }
  if (evidence.kind === "not-dispatched") {
    return notSentPostcondition(
      "The guarded send failed before the native advisor-warning acknowledgement was invoked."
    );
  }
  if (evidence.kind === "postcheck-unavailable") {
    return missingPostcondition(
      "No readable advisor-warning evidence was available before the polling deadline."
    );
  }
  if (!coherentSnapshots(evidence.before, evidence.after)) {
    return missingPostcondition(
      "The advisor-warning observations did not provide one coherent target and local-player identity."
    );
  }
  if (!evidence.after.exists) {
    return confirmedPostcondition(
      "advisor-warning-disappeared",
      "The exact advisor warning no longer exists in the engine notification registry."
    );
  }
  if (evidence.after.activeQueue.ok && !evidence.after.activeQueue.value) {
    return confirmedPostcondition(
      "active-queue-removed",
      "The exact advisor warning no longer appears in the active engine notification queue."
    );
  }
  if (evidence.after.activeQueue.ok && evidence.after.activeQueue.value) {
    return {
      classification: "advisor-warning-still-active",
      reason: "The exact advisor warning remains in the active engine notification queue.",
      outcome: "still-active",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }
  return missingPostcondition(
    "The advisor warning still exists, but active-queue evidence did not prove target-specific clearance."
  );
}

export function advisorWarningViewedResult(
  target: Civ7ControlOrpcComponentId,
  dispatchState: Civ7AdvisorWarningViewedDispatchState,
  evidence: Civ7AdvisorWarningViewedPostconditionEvidence
): Civ7NotificationAdvisorWarningViewedResult {
  const postcondition = civ7AdvisorWarningViewedPostcondition(evidence);

  if (dispatchState === "not-sent") {
    if (postcondition.classification !== "not-sent") {
      throw new Error("An advisor-warning acknowledgement that was not sent must report not-sent.");
    }
    return {
      target,
      status: "not-sent",
      postcondition,
      nextSteps: [
        {
          kind: "inspect-notification",
          source: "notifications.advisorWarning.viewed.request",
          label: `Read fresh advisor-warning availability for notification ${formatComponentId(target)} before another request.`,
        },
      ],
    };
  }

  if (dispatchState === "unknown") {
    if (postcondition.classification === "not-sent") {
      throw new Error("An uncertain advisor-warning dispatch cannot report not-sent.");
    }
    return {
      target,
      status: "dispatch-unknown",
      postcondition,
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "notifications.advisorWarning.viewed.request",
          label: `Do not repeat acknowledgement of advisor warning ${formatComponentId(target)} until fresh native evidence proves it is still active.`,
        },
      ],
    };
  }

  if (postcondition.confidence === "confirmed") {
    return {
      target,
      status: "sent-confirmed",
      postcondition,
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "notifications.advisorWarning.viewed.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    };
  }
  if (postcondition.classification === "not-sent") {
    throw new Error("A possible advisor-warning dispatch cannot report not-sent.");
  }

  return {
    target,
    status: "sent-unverified",
    postcondition,
    nextSteps: [
      {
        kind: "do-not-repeat",
        source: "notifications.advisorWarning.viewed.request",
        label: `Do not repeat acknowledgement of advisor warning ${formatComponentId(target)} until fresh native evidence proves it is still active.`,
      },
    ],
  };
}

function coherentSnapshots(
  before: Civ7ControlOrpcAdvisorWarningViewedSnapshot,
  after: Civ7ControlOrpcAdvisorWarningViewedSnapshot
): boolean {
  const registryAndQueueAgree =
    after.exists || after.activeQueue.ok === false || after.activeQueue.value === false;
  return (
    validLocalPlayerId(before.localPlayerId) &&
    before.localPlayerId === after.localPlayerId &&
    componentIdsEqual(before.target, after.target) &&
    registryAndQueueAgree &&
    (after.exists || after.typeName === null)
  );
}

function componentIdsEqual(
  left: Civ7ControlOrpcComponentId,
  right: Civ7ControlOrpcComponentId
): boolean {
  return (
    left.owner === right.owner &&
    left.id === right.id &&
    (left.type === right.type || (left.type === undefined && right.type === undefined))
  );
}

function validLocalPlayerId(playerId: number): boolean {
  return Number.isInteger(playerId) && playerId >= 0;
}

function notSentPostcondition(
  reason: string
): Extract<AdvisorWarningPostcondition, { classification: "not-sent" }> {
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
): Extract<AdvisorWarningPostcondition, { classification: "missing-postcondition" }> {
  return {
    classification: "missing-postcondition",
    reason,
    outcome: "unknown",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function confirmedPostcondition(
  classification: Extract<
    AdvisorWarningPostcondition,
    { confidence: "confirmed" }
  >["classification"],
  reason: string
): Extract<AdvisorWarningPostcondition, { confidence: "confirmed" }> {
  return {
    classification,
    reason,
    outcome: "cleared",
    confidence: "confirmed",
    confirmed: true,
    noRepeatAfterUnverified: false,
  };
}

function formatComponentId(id: Civ7ControlOrpcComponentId): string {
  return `${id.owner}:${id.id}:${id.type ?? "?"}`;
}
