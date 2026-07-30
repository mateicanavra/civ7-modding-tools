import type {
  Civ7UnitTargetActionCheckInput,
  Civ7UnitTargetActionCheckResult,
  Civ7UnitTargetActionId,
  Civ7UnitTargetActionSendInput,
  Civ7UnitTargetActionSendResult,
  Civ7UnitTargetObservationInput,
  Civ7UnitTargetSnapshot,
  Civ7UnitTargetUnitSummary,
} from "@civ7/direct-control";
import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

type UnitTargetComponentId = Civ7UnitTargetObservationInput["unitId"];
type UnitTargetArgs = Civ7UnitTargetActionCheckResult["args"];
type UnitTargetPrerequisite = Civ7UnitTargetActionCheckResult["prerequisite"];
type UnitTargetJsonValue = Civ7UnitTargetSnapshot["combatType"];
type UnitTargetWarObservation = Civ7UnitTargetSnapshot["war"];

type UnitTargetActionRouter = Readonly<{
  canStart?: (
    unitId: UnitTargetComponentId,
    operationType: unknown,
    args: UnitTargetArgs,
    includeDetails?: boolean
  ) => unknown;
  sendRequest?: (
    unitId: UnitTargetComponentId,
    operationType: unknown,
    args: UnitTargetArgs
  ) => unknown;
}>;

export type Civ7GameUiUnitTargetTarget = Readonly<{
  CombatTypes?: {
    COMBAT_RANGED?: unknown;
  };
  Game?: {
    Combat?: {
      testAttackInto?: (
        unitId: UnitTargetComponentId,
        args: Readonly<{ X: number; Y: number; Modifiers: number | null }>
      ) => unknown;
    };
    UnitCommands?: UnitTargetActionRouter;
    UnitOperations?: UnitTargetActionRouter;
  };
  GameContext?: {
    localPlayerID?: number;
  };
  GameplayMap?: {
    getIndexFromLocation?: (location: Readonly<{ x: number; y: number }>) => unknown;
    getIndexFromXY?: (x: number, y: number) => unknown;
  };
  MapUnits?: {
    getUnits?: (x: number, y: number) => unknown;
  };
  PlayerIds?: {
    NO_PLAYER?: unknown;
  };
  Players?: {
    get?: (playerId: number) => unknown;
  };
  UnitOperationMoveModifiers?: {
    NONE?: unknown;
    ATTACK?: unknown;
    MOVE_IGNORE_UNEXPLORED_DESTINATION?: unknown;
  };
  UnitOperationTypes?: Readonly<Record<string, unknown>> & {
    MOVE_TO?: unknown;
  };
  Units?: {
    get?: (id: UnitTargetComponentId) => unknown;
  };
}>;

type UnitTargetActionSpec = Readonly<{
  family: "command" | "operation";
  operationType: unknown;
  checkArgs: UnitTargetArgs;
  sendArgs: UnitTargetArgs;
  prerequisite: UnitTargetPrerequisite;
  warGate: "none" | "before-check" | "after-check";
}>;

const UNIT_TARGET_ACTION_IDS = new Set<Civ7UnitTargetActionId>([
  "naval-attack",
  "air-attack",
  "ranged-attack",
  "army-overrun",
  "swap-units",
  "move-to",
]);

/** Reports whether focused unit-target snapshots can be read from the controller runtime. */
function civ7GameUiUnitTargetObservationAvailable(target: Civ7GameUiUnitTargetTarget): boolean {
  return (
    Number.isInteger(target.GameContext?.localPlayerID) &&
    typeof target.Units?.get === "function" &&
    typeof target.MapUnits?.getUnits === "function" &&
    typeof target.Players?.get === "function" &&
    (typeof target.GameplayMap?.getIndexFromLocation === "function" ||
      typeof target.GameplayMap?.getIndexFromXY === "function") &&
    Number.isInteger(target.UnitOperationMoveModifiers?.NONE) &&
    Number.isInteger(target.UnitOperationMoveModifiers?.ATTACK) &&
    Number.isInteger(target.UnitOperationMoveModifiers?.MOVE_IGNORE_UNEXPLORED_DESTINATION)
  );
}

/** Reports whether one exact native unit-target action can be checked without sending. */
export function civ7GameUiUnitTargetActionCheckAvailable(
  target: Civ7GameUiUnitTargetTarget
): boolean {
  return (
    civ7GameUiUnitTargetObservationAvailable(target) &&
    typeof target.Game?.Combat?.testAttackInto === "function" &&
    target.CombatTypes?.COMBAT_RANGED !== undefined &&
    typeof target.Game.UnitCommands?.canStart === "function" &&
    typeof target.Game.UnitOperations?.canStart === "function" &&
    target.UnitOperationTypes?.MOVE_TO !== undefined
  );
}

/** Reports whether an admitted exact unit-target action can be sent once. */
export function civ7GameUiUnitTargetActionSendAvailable(
  target: Civ7GameUiUnitTargetTarget
): boolean {
  return (
    civ7GameUiUnitTargetActionCheckAvailable(target) &&
    typeof target.Game?.UnitCommands?.sendRequest === "function" &&
    typeof target.Game.UnitOperations?.sendRequest === "function"
  );
}

/** Reads focused actor, target, combat, war, and modifier evidence without selecting an action. */
export async function observeCiv7GameUiUnitTarget(
  input: Civ7UnitTargetObservationInput,
  target: Civ7GameUiUnitTargetTarget = globalThis as Civ7GameUiUnitTargetTarget
): Promise<Civ7UnitTargetSnapshot> {
  try {
    const admitted = admitUnitTargetObservationInput(input);
    return readUnitTargetSnapshot(admitted, target, admitted.trackedUnitIds, {
      includeCombat: true,
      includeWar: true,
    });
  } catch (cause) {
    throw unitTargetDispatchError(cause, "not-dispatched");
  }
}

/** Checks only the requested native action with its exact right-click arguments. */
export async function checkCiv7GameUiUnitTargetAction(
  input: Civ7UnitTargetActionCheckInput,
  target: Civ7GameUiUnitTargetTarget = globalThis as Civ7GameUiUnitTargetTarget
): Promise<Civ7UnitTargetActionCheckResult> {
  try {
    return checkUnitTargetAction(admitUnitTargetCheckInput(input), target);
  } catch (cause) {
    throw unitTargetDispatchError(cause, "not-dispatched");
  }
}

/** Revalidates one service-admitted action and invokes its native send method at most once. */
export async function sendCiv7GameUiUnitTargetAction(
  input: Civ7UnitTargetActionSendInput,
  target: Civ7GameUiUnitTargetTarget = globalThis as Civ7GameUiUnitTargetTarget
): Promise<Civ7UnitTargetActionSendResult> {
  let sendInvoked = false;
  try {
    const admitted = admitUnitTargetSendInput(input);
    const fresh = checkUnitTargetAction(admitted, target);
    if (
      admitted.actionId !== admitted.expected.actionId ||
      !unitTargetJsonValuesMatch(fresh, admitted.expected)
    ) {
      throw new Error("Unit target evidence changed after service admission.");
    }
    if (!fresh.valid) {
      return {
        sent: false,
        actionId: admitted.actionId,
        validation: fresh,
        before: fresh.snapshot,
        after: fresh.snapshot,
      };
    }
    if (fresh.snapshot.war.required === true) {
      throw new Error("Unit target action requires the dedicated war-confirmation workflow.");
    }

    const spec = unitTargetActionSpec(admitted, fresh.snapshot, target);
    const router = unitTargetRouter(spec.family, target);
    const sendRequest = router?.sendRequest;
    if (typeof sendRequest !== "function") {
      throw new Error("Unit action sendRequest is unavailable.");
    }
    sendInvoked = true;
    Reflect.apply(sendRequest, router, [admitted.unitId, spec.operationType, spec.sendArgs]);

    const trackedUnitIds = fresh.snapshot.targetUnits.map((unit) => unit.id);
    return {
      sent: true,
      actionId: admitted.actionId,
      validation: fresh,
      before: fresh.snapshot,
      after: readUnitTargetSnapshot(admitted, target, trackedUnitIds, {
        includeCombat: true,
        includeWar: true,
      }),
    };
  } catch (cause) {
    throw unitTargetDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function checkUnitTargetAction(
  input: Civ7UnitTargetActionCheckInput,
  target: Civ7GameUiUnitTargetTarget
): Civ7UnitTargetActionCheckResult {
  let snapshot = readUnitTargetSnapshot(input, target, undefined, {
    includeCombat: false,
    includeWar: false,
  });
  if (input.actionId === "ranged-attack") {
    snapshot = {
      ...snapshot,
      combatType: readUnitTargetCombatType(input, snapshot.modifiers.none, target),
    };
  }
  const spec = unitTargetActionSpec(input, snapshot, target);
  if (snapshot.actor === null) {
    return {
      actionId: input.actionId,
      valid: false,
      prerequisite: { ...spec.prerequisite, satisfied: false },
      args: spec.checkArgs,
      result: null,
      snapshot,
    };
  }
  if (!spec.prerequisite.satisfied) {
    return {
      actionId: input.actionId,
      valid: false,
      prerequisite: spec.prerequisite,
      args: spec.checkArgs,
      result: null,
      snapshot,
    };
  }
  if (spec.warGate === "before-check") {
    snapshot = { ...snapshot, war: readUnitTargetWar(input, target) };
    if (snapshot.war.required === true) {
      return {
        actionId: input.actionId,
        valid: false,
        prerequisite: spec.prerequisite,
        args: spec.checkArgs,
        result: null,
        snapshot,
      };
    }
  }

  const router = unitTargetRouter(spec.family, target);
  const canStart = router?.canStart;
  if (typeof canStart !== "function") {
    throw new Error("Unit action canStart is unavailable.");
  }
  const rawResult = Reflect.apply(canStart, router, [
    input.unitId,
    spec.operationType,
    spec.checkArgs,
    false,
  ]);
  const valid =
    rawResult !== null &&
    typeof rawResult === "object" &&
    Reflect.get(rawResult, "Success") === true;
  if (valid && spec.warGate === "after-check") {
    snapshot = { ...snapshot, war: readUnitTargetWar(input, target) };
  }
  return {
    actionId: input.actionId,
    valid,
    prerequisite: spec.prerequisite,
    args: spec.checkArgs,
    result: unitTargetJsonValue(rawResult),
    snapshot,
  };
}

function readUnitTargetSnapshot(
  input: Pick<Civ7UnitTargetObservationInput, "unitId" | "x" | "y">,
  target: Civ7GameUiUnitTargetTarget,
  trackedUnitIds: readonly UnitTargetComponentId[] | undefined,
  options: Readonly<{
    includeCombat: boolean;
    includeWar: boolean;
  }>
): Civ7UnitTargetSnapshot {
  const targetIds = readUnitTargetIds(input.x, input.y, target);
  const trackedIds = trackedUnitIds ?? targetIds;
  const modifiers = readUnitTargetModifiers(target);
  return {
    localPlayerId: Number.isInteger(target.GameContext?.localPlayerID)
      ? (target.GameContext?.localPlayerID as number)
      : null,
    unitId: input.unitId,
    target: {
      x: input.x,
      y: input.y,
      index: readUnitTargetIndex(input.x, input.y, target),
    },
    actor: readUnitTargetUnit(input.unitId, target),
    targetUnits: targetIds
      .map((id) => readUnitTargetUnit(id, target))
      .filter((unit): unit is Civ7UnitTargetUnitSummary => unit !== null),
    trackedTargetUnits: trackedIds.map((id) => ({
      id,
      unit: readUnitTargetUnit(id, target),
    })),
    combatType: options.includeCombat
      ? readUnitTargetCombatType(input, modifiers.none, target)
      : null,
    rangedCombatType: unitTargetJsonValue(target.CombatTypes?.COMBAT_RANGED),
    war: options.includeWar ? readUnitTargetWar(input, target) : unobservedUnitTargetWar(target),
    modifiers,
  };
}

function unitTargetActionSpec(
  input: Civ7UnitTargetActionCheckInput,
  snapshot: Civ7UnitTargetSnapshot,
  target: Civ7GameUiUnitTargetTarget
): UnitTargetActionSpec {
  const none = requireUnitTargetInteger(snapshot.modifiers.none, "UnitOperationMoveModifiers.NONE");
  const dispatch = requireUnitTargetInteger(
    snapshot.modifiers.dispatch,
    "unit target dispatch modifiers"
  );
  const checkArgs = { X: input.x, Y: input.y, Modifiers: none };
  const dispatchArgs = { X: input.x, Y: input.y, Modifiers: dispatch };
  const offCurrentTile = unitTargetIsOffCurrentTile(snapshot);

  switch (input.actionId) {
    case "naval-attack":
      return operationSpec(
        "UNITOPERATION_NAVAL_ATTACK",
        checkArgs,
        dispatchArgs,
        noUnitTargetPrerequisite(),
        "after-check"
      );
    case "air-attack":
      return operationSpec(
        "UNITOPERATION_AIR_ATTACK",
        checkArgs,
        dispatchArgs,
        noUnitTargetPrerequisite(),
        "after-check"
      );
    case "ranged-attack":
      return operationSpec(
        "UNITOPERATION_RANGE_ATTACK",
        checkArgs,
        dispatchArgs,
        {
          kind: "ranged-combat",
          satisfied:
            snapshot.combatType !== null &&
            snapshot.rangedCombatType !== null &&
            Object.is(snapshot.combatType, snapshot.rangedCombatType),
        },
        "before-check"
      );
    case "army-overrun":
      return {
        family: "command",
        operationType: "UNITCOMMAND_ARMY_OVERRUN",
        checkArgs,
        sendArgs: checkArgs,
        prerequisite: noUnitTargetPrerequisite(),
        warGate: "none",
      };
    case "swap-units":
      return operationSpec(
        "UNITOPERATION_SWAP_UNITS",
        checkArgs,
        checkArgs,
        { kind: "off-current-tile", satisfied: offCurrentTile },
        "none"
      );
    case "move-to": {
      const operationType = target.UnitOperationTypes?.MOVE_TO;
      if (operationType === undefined) {
        throw new Error("UnitOperationTypes.MOVE_TO is unavailable.");
      }
      return operationSpec(
        operationType,
        dispatchArgs,
        dispatchArgs,
        { kind: "off-current-tile", satisfied: offCurrentTile },
        "before-check"
      );
    }
  }
}

function operationSpec(
  operationType: unknown,
  checkArgs: UnitTargetArgs,
  sendArgs: UnitTargetArgs,
  prerequisite: UnitTargetPrerequisite,
  warGate: UnitTargetActionSpec["warGate"]
): UnitTargetActionSpec {
  return {
    family: "operation",
    operationType,
    checkArgs,
    sendArgs,
    prerequisite,
    warGate,
  };
}

function noUnitTargetPrerequisite(): UnitTargetPrerequisite {
  return { kind: "none", satisfied: true };
}

function unitTargetRouter(
  family: UnitTargetActionSpec["family"],
  target: Civ7GameUiUnitTargetTarget
): UnitTargetActionRouter | undefined {
  return family === "command" ? target.Game?.UnitCommands : target.Game?.UnitOperations;
}

function readUnitTargetUnit(
  id: UnitTargetComponentId,
  target: Civ7GameUiUnitTargetTarget
): Civ7UnitTargetUnitSummary | null {
  const getUnit = target.Units?.get;
  if (typeof getUnit !== "function") throw new Error("Units.get is unavailable.");
  const value = Reflect.apply(getUnit, target.Units, [id]);
  if (value === null || typeof value !== "object") return null;
  const observedId = unitTargetComponentId(Reflect.get(value, "id")) ?? id;
  const movement = unitTargetRecord(Reflect.get(value, "Movement"));
  const combat = unitTargetRecord(Reflect.get(value, "Combat"));
  const health = unitTargetRecord(Reflect.get(value, "Health"));
  const damage = finiteUnitTargetNumber(health == null ? undefined : Reflect.get(health, "damage"));
  const maxDamage = finiteUnitTargetNumber(
    health == null ? undefined : Reflect.get(health, "maxDamage")
  );
  return {
    id: observedId,
    location: unitTargetLocation(Reflect.get(value, "location")),
    movementMovesRemaining: finiteUnitTargetNumber(
      movement == null ? undefined : Reflect.get(movement, "movementMovesRemaining")
    ),
    movementTurnsRemaining: finiteUnitTargetNumber(
      movement == null ? undefined : Reflect.get(movement, "movementTurnsRemaining")
    ),
    attacksRemaining: finiteUnitTargetNumber(
      combat == null ? undefined : Reflect.get(combat, "attacksRemaining")
    ),
    damage,
    hitPoints: damage === null || maxDamage === null ? null : maxDamage - damage,
  };
}

function readUnitTargetIds(
  x: number,
  y: number,
  target: Civ7GameUiUnitTargetTarget
): UnitTargetComponentId[] {
  const getUnits = target.MapUnits?.getUnits;
  if (typeof getUnits !== "function") throw new Error("MapUnits.getUnits is unavailable.");
  const values = Reflect.apply(getUnits, target.MapUnits, [x, y]);
  if (!Array.isArray(values)) throw new Error("MapUnits.getUnits did not return an array.");
  return values.map((value) => {
    const id = unitTargetComponentId(value);
    if (id === null) throw new Error("Target unit has no valid ComponentID.");
    return id;
  });
}

function readUnitTargetIndex(
  x: number,
  y: number,
  target: Civ7GameUiUnitTargetTarget
): number | null {
  const fromLocation = target.GameplayMap?.getIndexFromLocation;
  const value =
    typeof fromLocation === "function"
      ? Reflect.apply(fromLocation, target.GameplayMap, [{ x, y }])
      : typeof target.GameplayMap?.getIndexFromXY === "function"
        ? Reflect.apply(target.GameplayMap.getIndexFromXY, target.GameplayMap, [x, y])
        : null;
  return Number.isInteger(value) ? (value as number) : null;
}

function readUnitTargetCombatType(
  input: Pick<Civ7UnitTargetObservationInput, "unitId" | "x" | "y">,
  none: number | null,
  target: Civ7GameUiUnitTargetTarget
): UnitTargetJsonValue {
  const testAttackInto = target.Game?.Combat?.testAttackInto;
  if (typeof testAttackInto !== "function") return null;
  return unitTargetJsonValue(
    Reflect.apply(testAttackInto, target.Game?.Combat, [
      input.unitId,
      { X: input.x, Y: input.y, Modifiers: none },
    ])
  );
}

function readUnitTargetWar(
  input: Pick<Civ7UnitTargetObservationInput, "unitId" | "x" | "y">,
  target: Civ7GameUiUnitTargetTarget
): UnitTargetWarObservation {
  const getPlayer = target.Players?.get;
  if (typeof getPlayer !== "function") throw new Error("Players.get is unavailable.");
  const player = Reflect.apply(getPlayer, target.Players, [input.unitId.owner]);
  const diplomacy =
    player !== null && typeof player === "object" ? Reflect.get(player, "Diplomacy") : null;
  const noPlayerId = Number.isInteger(target.PlayerIds?.NO_PLAYER)
    ? (target.PlayerIds?.NO_PLAYER as number)
    : null;
  if (diplomacy === null || typeof diplomacy !== "object") {
    return {
      observed: true,
      result: null,
      player2: null,
      noPlayerId,
      required: false,
    };
  }
  const willMoveStartWar = Reflect.get(diplomacy, "willMoveStartWar");
  if (typeof willMoveStartWar !== "function") {
    throw new Error("Diplomacy.willMoveStartWar is unavailable.");
  }
  const rawResult = Reflect.apply(willMoveStartWar, diplomacy, [
    input.unitId,
    { x: input.x, y: input.y },
  ]);
  const success =
    rawResult !== null &&
    typeof rawResult === "object" &&
    Reflect.get(rawResult, "Success") === true;
  const rawPlayer2 =
    success && rawResult !== null && typeof rawResult === "object"
      ? Reflect.get(rawResult, "Player2")
      : undefined;
  if (rawPlayer2 !== undefined && !Number.isInteger(rawPlayer2)) {
    throw new Error("Diplomacy.willMoveStartWar returned an invalid Player2.");
  }
  const player2 = rawPlayer2 === undefined ? null : (rawPlayer2 as number);
  return {
    observed: true,
    result: unitTargetJsonValue(rawResult),
    player2,
    noPlayerId,
    required: player2 !== null && (noPlayerId === null || player2 !== noPlayerId),
  };
}

function unobservedUnitTargetWar(target: Civ7GameUiUnitTargetTarget): UnitTargetWarObservation {
  return {
    observed: false,
    result: null,
    player2: null,
    noPlayerId: Number.isInteger(target.PlayerIds?.NO_PLAYER)
      ? (target.PlayerIds?.NO_PLAYER as number)
      : null,
    required: null,
  };
}

function readUnitTargetModifiers(
  target: Civ7GameUiUnitTargetTarget
): Civ7UnitTargetSnapshot["modifiers"] {
  const none = target.UnitOperationMoveModifiers?.NONE;
  const attack = target.UnitOperationMoveModifiers?.ATTACK;
  const ignore = target.UnitOperationMoveModifiers?.MOVE_IGNORE_UNEXPLORED_DESTINATION;
  return {
    none: Number.isInteger(none) ? (none as number) : null,
    dispatch:
      Number.isInteger(attack) && Number.isInteger(ignore)
        ? (attack as number) + (ignore as number)
        : null,
  };
}

function admitUnitTargetObservationInput(
  input: Civ7UnitTargetObservationInput
): Civ7UnitTargetObservationInput {
  const admitted = admitUnitTargetInput(input);
  const trackedUnitIds = input.trackedUnitIds?.map((id, index) =>
    requireUnitTargetComponentId(id, `trackedUnitIds[${index}]`)
  );
  return trackedUnitIds === undefined ? admitted : { ...admitted, trackedUnitIds };
}

function admitUnitTargetCheckInput(
  input: Civ7UnitTargetActionCheckInput
): Civ7UnitTargetActionCheckInput {
  const admitted = admitUnitTargetInput(input);
  const actionId = input.actionId;
  if (!UNIT_TARGET_ACTION_IDS.has(actionId)) {
    throw new Error("Unit target action check requires a closed native action identifier.");
  }
  return { ...admitted, actionId };
}

function admitUnitTargetSendInput(
  input: Civ7UnitTargetActionSendInput
): Civ7UnitTargetActionSendInput {
  const admitted = admitUnitTargetCheckInput(input);
  const expected = input.expected;
  if (expected === null || typeof expected !== "object") {
    throw new Error("Unit target action send requires the exact preceding action check.");
  }
  return { ...admitted, expected };
}

function admitUnitTargetInput(
  input: Pick<Civ7UnitTargetObservationInput, "unitId" | "x" | "y">
): Pick<Civ7UnitTargetObservationInput, "unitId" | "x" | "y"> {
  const unitId = requireUnitTargetComponentId(input.unitId, "unitId");
  const x = input.x;
  const y = input.y;
  if (
    !Number.isInteger(x) ||
    x < 0 ||
    x > 1_000_000 ||
    !Number.isInteger(y) ||
    y < 0 ||
    y > 1_000_000
  ) {
    throw new Error("Unit target input requires bounded integer coordinates.");
  }
  return { unitId, x, y };
}

function requireUnitTargetComponentId(
  value: UnitTargetComponentId,
  label: string
): UnitTargetComponentId {
  const owner = value?.owner;
  const id = value?.id;
  const type = value?.type;
  if (
    typeof owner !== "number" ||
    !Number.isFinite(owner) ||
    typeof id !== "number" ||
    !Number.isFinite(id) ||
    (type !== undefined && (typeof type !== "number" || !Number.isFinite(type)))
  ) {
    throw new Error(`${label} must be a Civ7 ComponentID.`);
  }
  return type === undefined ? { owner, id } : { owner, id, type };
}

function unitTargetComponentId(value: unknown): UnitTargetComponentId | null {
  if (value === null || typeof value !== "object") return null;
  const nested = Reflect.get(value, "id");
  const source = nested !== null && typeof nested === "object" ? nested : value;
  const owner = Reflect.get(source, "owner");
  const id = Reflect.get(source, "id");
  const type = Reflect.get(source, "type");
  if (!Number.isInteger(owner) || !Number.isInteger(id)) return null;
  return Number.isInteger(type)
    ? { owner: owner as number, id: id as number, type: type as number }
    : { owner: owner as number, id: id as number };
}

function unitTargetLocation(value: unknown): Civ7UnitTargetUnitSummary["location"] {
  if (value === null || typeof value !== "object") return null;
  const x = Reflect.get(value, "x");
  const y = Reflect.get(value, "y");
  return Number.isInteger(x) && Number.isInteger(y) ? { x: x as number, y: y as number } : null;
}

function unitTargetIsOffCurrentTile(snapshot: Civ7UnitTargetSnapshot): boolean {
  const location = snapshot.actor?.location;
  return (
    location !== null &&
    location !== undefined &&
    (location.x !== snapshot.target.x || location.y !== snapshot.target.y)
  );
}

function unitTargetRecord(value: unknown): object | null {
  return value !== null && typeof value === "object" ? value : null;
}

function finiteUnitTargetNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function requireUnitTargetInteger(value: number | null, label: string): number {
  if (!Number.isInteger(value)) throw new Error(`${label} is unavailable.`);
  return value as number;
}

function unitTargetJsonValue(value: unknown): UnitTargetJsonValue {
  if (value === undefined) return null;
  const serialized = JSON.stringify(value);
  if (serialized === undefined) return null;
  return JSON.parse(serialized) as UnitTargetJsonValue;
}

function unitTargetJsonValuesMatch(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function unitTargetDispatchError(
  cause: unknown,
  dispatchStatus: "not-dispatched" | "dispatched"
): Civ7DirectControlErrorShape {
  const message = cause instanceof Error ? cause.message : String(cause);
  const error = new Error(message, { cause }) as Error & {
    name: "Civ7DirectControlError";
  };
  error.name = "Civ7DirectControlError";
  return Object.assign(error, {
    code: "command-failed" as const,
    dispatchStatus,
  });
}
