import { Value } from "typebox/value";

import type { Civ7ControlOrpcUnitTargetSnapshot } from "#civ7-control-service/model/ports/direct-control";
import type {
  Civ7UnitTargetAction,
  Civ7UnitTargetActionInput,
  Civ7UnitTargetActionResult,
} from "../../contract";
import { unitTargetSnapshotMatchesInput } from "./target-action-admission";

export type Civ7UnitTargetPostconditionEvidence =
  | Readonly<{ kind: "not-admitted" }>
  | Readonly<{
      kind: "dedicated-war-workflow-required";
      action: Civ7UnitTargetAction;
    }>
  | Readonly<{ kind: "validation-rejected" }>
  | Readonly<{ kind: "not-dispatched" }>
  | Readonly<{ kind: "provider-evidence-mismatch" }>
  | Readonly<{ kind: "postcheck-unavailable" }>
  | Readonly<{
      kind: "observed";
      input: Civ7UnitTargetActionInput;
      action: Civ7UnitTargetAction;
      before: Civ7ControlOrpcUnitTargetSnapshot;
      after: Civ7ControlOrpcUnitTargetSnapshot;
      final?: true;
    }>;

export type Civ7UnitTargetDispatchState = "not-sent" | "sent" | "unknown";

/** Classifies one unit-target transition from focused immutable runtime observations. */
export function civ7UnitTargetPostcondition(
  evidence: Civ7UnitTargetPostconditionEvidence
): Civ7UnitTargetActionResult["postcondition"] {
  switch (evidence.kind) {
    case "not-admitted":
      return notSentPostcondition(
        "Fresh local-player, unit, target, and native action evidence did not admit a unit action."
      );
    case "dedicated-war-workflow-required":
      return {
        classification: "war-confirmation-required",
        reason:
          "The selected native unit action would start war and must use Civ7's dedicated war-confirmation workflow.",
        outcome: "requires-war-confirmation",
        confidence: "confirmed",
        confirmed: false,
        noRepeatAfterUnverified: false,
      };
    case "validation-rejected":
      return notSentPostcondition(
        "The guarded unit action failed fresh native validation and was not sent."
      );
    case "not-dispatched":
      return notSentPostcondition(
        "The unit action failed before the native send method was invoked."
      );
    case "provider-evidence-mismatch":
      return missingPostcondition(
        "The provider returned unit-target send evidence that did not correlate with the admitted action."
      );
    case "postcheck-unavailable":
      return missingPostcondition(
        "The unit action may have been dispatched, but no readable post-send unit evidence was available before the polling deadline."
      );
    case "observed":
      return observedUnitTargetPostcondition(evidence);
  }
}

/** Projects dispatch authority and postcondition evidence into the public unit result. */
export function unitTargetActionResult(
  input: Civ7UnitTargetActionInput,
  selectedAction: Civ7UnitTargetAction | null,
  dispatchState: Civ7UnitTargetDispatchState,
  evidence: Civ7UnitTargetPostconditionEvidence
): Civ7UnitTargetActionResult {
  const postcondition = civ7UnitTargetPostcondition(evidence);
  const target = {
    unitId: input.unitId,
    target: { x: input.x, y: input.y },
  };

  if (dispatchState === "not-sent") {
    if (postcondition.classification === "war-confirmation-required") {
      if (selectedAction === null) {
        throw new Error("War-confirmation refusal requires a selected unit action.");
      }
      return {
        ...target,
        selectedAction,
        status: "not-sent",
        postcondition,
        nextSteps: [
          {
            kind: "use-war-confirmation",
            source: "unit.target.action.request",
            label:
              "Use Civ7's dedicated war-confirmation workflow, then obtain a fresh unit-target check.",
          },
        ],
      };
    }
    if (postcondition.classification !== "not-sent" || selectedAction !== null) {
      throw new Error("A refused unit action must report not-sent without a selected action.");
    }
    return {
      ...target,
      selectedAction: null,
      status: "not-sent",
      postcondition,
      nextSteps: [
        {
          kind: "inspect-unit-action",
          source: "unit.target.action.request",
          label: "Inspect fresh native unit-target availability before another request.",
        },
      ],
    };
  }

  if (
    selectedAction === null ||
    postcondition.classification === "not-sent" ||
    postcondition.classification === "war-confirmation-required"
  ) {
    throw new Error("A dispatched unit action requires a selected action and post-send evidence.");
  }

  if (dispatchState === "unknown") {
    return {
      ...target,
      selectedAction,
      status: "dispatch-unknown",
      postcondition,
      nextSteps: noRepeatNextSteps(selectedAction),
    };
  }

  if (postcondition.classification === "path-shortfall") {
    return {
      ...target,
      selectedAction,
      status: "sent-guarded",
      postcondition,
      nextSteps: noRepeatNextSteps(selectedAction),
    };
  }
  if (postcondition.confidence === "confirmed") {
    return {
      ...target,
      selectedAction,
      status: "sent-confirmed",
      postcondition,
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "unit.target.action.request",
          label: "Refresh current attention before choosing the next player action.",
        },
      ],
    };
  }
  return {
    ...target,
    selectedAction,
    status: "sent-unverified",
    postcondition,
    nextSteps: noRepeatNextSteps(selectedAction),
  };
}

function observedUnitTargetPostcondition(
  evidence: Extract<Civ7UnitTargetPostconditionEvidence, { kind: "observed" }>
): Civ7UnitTargetActionResult["postcondition"] {
  if (
    !unitTargetSnapshotMatchesInput(evidence.input, evidence.before) ||
    !unitTargetSnapshotMatchesInput(evidence.input, evidence.after)
  ) {
    return missingPostcondition(
      "The unit-target observations did not preserve one local unit and requested target identity."
    );
  }

  const beforeActor = evidence.before.actor;
  const afterActor = evidence.after.actor;
  if (beforeActor === null || afterActor === null) {
    return missingPostcondition(
      "The acting unit was absent from one or more required unit-target observations."
    );
  }

  if (evidence.action === "move-to") {
    if (sameLocation(afterActor.location, evidence.after.target)) {
      return confirmedPostcondition(
        "target-reached",
        "target-reached",
        "The acting unit reached the requested target plot."
      );
    }
    if (
      evidence.final === true &&
      afterActor.movementMovesRemaining === 0 &&
      locationsDiffer(beforeActor.location, afterActor.location)
    ) {
      return {
        classification: "path-shortfall",
        reason:
          "The acting unit moved but stopped before the requested target; a fresh path decision is required.",
        outcome: "path-shortfall",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: true,
      };
    }
  }

  if (
    evidence.action === "swap-units" &&
    sameLocation(afterActor.location, evidence.after.target) &&
    trackedTargetReachedOrigin(evidence.before, evidence.after)
  ) {
    return confirmedPostcondition(
      "units-swapped",
      "units-swapped",
      "The acting unit reached the target while the tracked target unit reached the actor's origin."
    );
  }

  if (
    isAttackAction(evidence.action) &&
    (trackedTargetCombatStateChanged(evidence.before, evidence.after) ||
      actorAttackResourceConsumed(beforeActor, afterActor))
  ) {
    return confirmedPostcondition(
      "attack-state-changed",
      "state-changed",
      "Focused target-unit health or acting-unit attack resources changed after dispatch."
    );
  }

  if (
    !Value.Equal(beforeActor, afterActor) ||
    !Value.Equal(evidence.before.trackedTargetUnits, evidence.after.trackedTargetUnits) ||
    !Value.Equal(evidence.before.targetUnits, evidence.after.targetUnits)
  ) {
    return {
      classification: "runtime-state-changed",
      reason:
        "Focused unit state changed after dispatch, but the evidence does not prove the selected action's semantic outcome.",
      outcome: "state-changed",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    };
  }

  return {
    classification: "no-state-change",
    reason: "No focused acting-unit or tracked target-unit state changed after dispatch.",
    outcome: "no-state-change",
    confidence: "unverified",
    confirmed: false,
    noRepeatAfterUnverified: true,
  };
}

function trackedTargetReachedOrigin(
  before: Civ7ControlOrpcUnitTargetSnapshot,
  after: Civ7ControlOrpcUnitTargetSnapshot
): boolean {
  const origin = before.actor?.location;
  if (origin === null || origin === undefined) return false;
  const beforeTargetIds = new Set(before.targetUnits.map((unit) => componentIdKey(unit.id)));
  return after.trackedTargetUnits.some(
    (tracked) =>
      beforeTargetIds.has(componentIdKey(tracked.id)) &&
      tracked.unit !== null &&
      sameLocation(tracked.unit.location, origin)
  );
}

function trackedTargetCombatStateChanged(
  before: Civ7ControlOrpcUnitTargetSnapshot,
  after: Civ7ControlOrpcUnitTargetSnapshot
): boolean {
  const afterById = new Map(
    after.trackedTargetUnits.map((tracked) => [componentIdKey(tracked.id), tracked.unit])
  );
  return before.targetUnits.some((unit) => {
    const key = componentIdKey(unit.id);
    if (!afterById.has(key)) return false;
    const observed = afterById.get(key);
    return (
      observed === null ||
      (observed !== undefined &&
        (observed.damage !== unit.damage || observed.hitPoints !== unit.hitPoints))
    );
  });
}

function actorAttackResourceConsumed(
  before: NonNullable<Civ7ControlOrpcUnitTargetSnapshot["actor"]>,
  after: NonNullable<Civ7ControlOrpcUnitTargetSnapshot["actor"]>
): boolean {
  return (
    before.attacksRemaining !== null &&
    after.attacksRemaining !== null &&
    after.attacksRemaining < before.attacksRemaining
  );
}

function isAttackAction(action: Civ7UnitTargetAction): boolean {
  return (
    action === "naval-attack" ||
    action === "air-attack" ||
    action === "ranged-attack" ||
    action === "army-overrun" ||
    action === "move-to"
  );
}

function sameLocation(
  left: { readonly x: number; readonly y: number } | null,
  right: { readonly x: number; readonly y: number }
): boolean {
  return left !== null && left.x === right.x && left.y === right.y;
}

function locationsDiffer(
  left: { readonly x: number; readonly y: number } | null,
  right: { readonly x: number; readonly y: number } | null
): boolean {
  return left !== null && right !== null && !sameLocation(left, right);
}

function componentIdKey(id: Civ7UnitTargetActionInput["unitId"]): string {
  return `${id.owner}:${id.id}:${id.type ?? ""}`;
}

function confirmedPostcondition<
  Classification extends "target-reached" | "units-swapped" | "attack-state-changed",
  Outcome extends "target-reached" | "units-swapped" | "state-changed",
>(
  classification: Classification,
  outcome: Outcome,
  reason: string
): Extract<Civ7UnitTargetActionResult["postcondition"], { classification: Classification }> {
  return {
    classification,
    reason,
    outcome,
    confidence: "confirmed",
    confirmed: true,
    noRepeatAfterUnverified: false,
  } as Extract<Civ7UnitTargetActionResult["postcondition"], { classification: Classification }>;
}

function notSentPostcondition(
  reason: string
): Extract<Civ7UnitTargetActionResult["postcondition"], { classification: "not-sent" }> {
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
  Civ7UnitTargetActionResult["postcondition"],
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

function noRepeatNextSteps(action: Civ7UnitTargetAction) {
  return [
    {
      kind: "do-not-repeat" as const,
      source: "unit.target.action.request" as const,
      label: `Do not repeat ${action} until fresh unit and target evidence is read.`,
    },
  ];
}
