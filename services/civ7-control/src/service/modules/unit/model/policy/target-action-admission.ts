import { Value } from "typebox/value";

import type {
  Civ7ControlOrpcUnitTargetActionCheckResult,
  Civ7ControlOrpcUnitTargetSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7UnitTargetAction, Civ7UnitTargetActionInput } from "../../contract";

const WAR_GATED_ACTIONS: ReadonlySet<Civ7UnitTargetAction> = new Set([
  "naval-attack",
  "air-attack",
  "ranged-attack",
  "move-to",
]);

export type Civ7UnitTargetActionAdmission =
  | Readonly<{
      kind: "admitted";
      action: Civ7UnitTargetAction;
      check: Civ7ControlOrpcUnitTargetActionCheckResult;
    }>
  | Readonly<{
      kind: "dedicated-war-workflow-required";
      action: Civ7UnitTargetAction;
      check: Civ7ControlOrpcUnitTargetActionCheckResult;
    }>
  | Readonly<{ kind: "not-admitted" }>;

/** Admits one exact action check while refusing stale, foreign, or war-starting targets. */
export function unitTargetActionAdmission(
  input: Civ7UnitTargetActionInput,
  action: Civ7UnitTargetAction,
  check: Civ7ControlOrpcUnitTargetActionCheckResult
): Civ7UnitTargetActionAdmission {
  if (!unitTargetCheckMatchesInput(input, action, check) || !check.prerequisite.satisfied) {
    return { kind: "not-admitted" };
  }

  if (WAR_GATED_ACTIONS.has(action)) {
    const war = check.snapshot.war;
    if (war.observed !== true || war.required === null) {
      return { kind: "not-admitted" };
    }
    if (war.required) {
      return {
        kind: "dedicated-war-workflow-required",
        action,
        check,
      };
    }
  }

  return check.valid ? { kind: "admitted", action, check } : { kind: "not-admitted" };
}

/** Correlates one provider check to the exact action and target requested by the service. */
export function unitTargetCheckMatchesInput(
  input: Civ7UnitTargetActionInput,
  action: Civ7UnitTargetAction,
  check: Civ7ControlOrpcUnitTargetActionCheckResult
): boolean {
  const expectedPrerequisite =
    action === "ranged-attack"
      ? "ranged-combat"
      : action === "swap-units" || action === "move-to"
        ? "off-current-tile"
        : "none";
  const expectedPrerequisiteSatisfied =
    action === "ranged-attack"
      ? check.snapshot.combatType !== null &&
        check.snapshot.rangedCombatType !== null &&
        Object.is(check.snapshot.combatType, check.snapshot.rangedCombatType)
      : action === "swap-units" || action === "move-to"
        ? unitTargetIsOffCurrentTile(check.snapshot)
        : true;
  const expectedModifiers =
    action === "move-to" ? check.snapshot.modifiers.dispatch : check.snapshot.modifiers.none;
  return (
    unitTargetSnapshotMatchesInput(input, check.snapshot) &&
    check.actionId === action &&
    check.prerequisite.kind === expectedPrerequisite &&
    check.prerequisite.satisfied === expectedPrerequisiteSatisfied &&
    unitTargetWarEvidenceMatches(action, check, expectedPrerequisiteSatisfied) &&
    check.args.X === input.x &&
    check.args.Y === input.y &&
    check.args.Modifiers === expectedModifiers
  );
}

function unitTargetWarEvidenceMatches(
  action: Civ7UnitTargetAction,
  check: Civ7ControlOrpcUnitTargetActionCheckResult,
  prerequisiteSatisfied: boolean
): boolean {
  const war = check.snapshot.war;
  const shouldObserve =
    action === "naval-attack" || action === "air-attack"
      ? check.valid
      : (action === "ranged-attack" || action === "move-to") && prerequisiteSatisfied;
  if (!shouldObserve) {
    return war.observed === false && war.required === null;
  }
  if (war.observed !== true || war.required === null) return false;
  return (
    war.required !== true ||
    ((action === "naval-attack" || action === "air-attack") && check.valid) ||
    (!check.valid && check.result === null)
  );
}

/** Confirms that a snapshot belongs to the requested local unit and target plot. */
export function unitTargetSnapshotMatchesInput(
  input: Civ7UnitTargetActionInput,
  snapshot: Civ7ControlOrpcUnitTargetSnapshot
): boolean {
  return (
    snapshot.localPlayerId === input.unitId.owner &&
    sameComponentId(snapshot.unitId, input.unitId) &&
    snapshot.actor !== null &&
    sameComponentId(snapshot.actor.id, input.unitId) &&
    snapshot.target.x === input.x &&
    snapshot.target.y === input.y &&
    Number.isInteger(snapshot.target.index) &&
    Number.isInteger(snapshot.modifiers.none) &&
    Number.isInteger(snapshot.modifiers.dispatch)
  );
}

/** Compares the decision-bearing snapshot surface while allowing action-local war observation. */
export function unitTargetDecisionStateMatches(
  expected: Civ7ControlOrpcUnitTargetSnapshot,
  observed: Civ7ControlOrpcUnitTargetSnapshot
): boolean {
  return Value.Equal(withoutActionLocalEvidence(expected), withoutActionLocalEvidence(observed));
}

export function unitTargetIsCurrentTile(snapshot: Civ7ControlOrpcUnitTargetSnapshot): boolean {
  const location = snapshot.actor?.location;
  return location != null && location.x === snapshot.target.x && location.y === snapshot.target.y;
}

function unitTargetIsOffCurrentTile(snapshot: Civ7ControlOrpcUnitTargetSnapshot): boolean {
  const location = snapshot.actor?.location;
  return location != null && (location.x !== snapshot.target.x || location.y !== snapshot.target.y);
}

function withoutActionLocalEvidence(snapshot: Civ7ControlOrpcUnitTargetSnapshot) {
  const { combatType: _combatType, war: _war, ...stable } = snapshot;
  return stable;
}

function sameComponentId(
  left: Civ7UnitTargetActionInput["unitId"],
  right: Civ7UnitTargetActionInput["unitId"]
): boolean {
  if (left.owner !== right.owner || left.id !== right.id) return false;
  return left.type === undefined || right.type === undefined || left.type === right.type;
}
