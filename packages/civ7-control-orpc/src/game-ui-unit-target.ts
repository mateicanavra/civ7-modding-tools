import type { Civ7ControlOrpcUnitTargetActionResult } from "./dependencies/direct-control";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;
type UnitTargetCandidate =
  Civ7ControlOrpcUnitTargetActionResult["candidates"][number];

export type Civ7GameUiUnitTargetActionTarget = Readonly<{
  Game?: {
    UnitCommands?: UnitActionRouter;
    UnitOperations?: UnitActionRouter;
  };
  GameContext?: {
    localPlayerID?: number;
  };
  GameplayMap?: {
    getIndexFromLocation?: (location: Readonly<{ x: number; y: number }>) => number;
    getIndexFromXY?: (x: number, y: number) => number;
  };
  MapUnits?: {
    getUnits?: (x: number, y: number) => unknown;
  };
  UnitCommandTypes?: Record<string, unknown>;
  UnitOperationMoveModifiers?: {
    ATTACK?: number;
    MOVE_IGNORE_UNEXPLORED_DESTINATION?: number;
  };
  UnitOperationTypes?: Record<string, unknown>;
  Units?: {
    get?: (id: Civ7ControlOrpcComponentId) => unknown;
  };
}>;

type UnitActionRouter = Readonly<{
  canStart?: (
    unitId: Civ7ControlOrpcComponentId,
    operationType: unknown,
    args: Readonly<Record<string, number>>,
    queue?: boolean,
  ) => unknown;
  sendRequest?: (
    unitId: Civ7ControlOrpcComponentId,
    operationType: unknown,
    args: Readonly<Record<string, number>>,
  ) => unknown;
}>;

export function civ7GameUiUnitTargetActionAvailable(
  target: Civ7GameUiUnitTargetActionTarget,
): boolean {
  return typeof target.Game?.UnitOperations?.canStart === "function"
    && typeof target.Game.UnitOperations.sendRequest === "function"
    && typeof target.Game?.UnitCommands?.canStart === "function"
    && typeof target.Game.UnitCommands.sendRequest === "function"
    && target.UnitOperationTypes != null
    && target.UnitCommandTypes != null
    && typeof target.Units?.get === "function"
    && typeof target.MapUnits?.getUnits === "function"
    && (
      typeof target.GameplayMap?.getIndexFromLocation === "function"
      || typeof target.GameplayMap?.getIndexFromXY === "function"
    );
}

export async function requestCiv7GameUiUnitTargetAction(
  input: Readonly<{
    unitId: Civ7ControlOrpcComponentId;
    x: number;
    y: number;
  }>,
  target: Civ7GameUiUnitTargetActionTarget =
    globalThis as Civ7GameUiUnitTargetActionTarget,
): Promise<Civ7ControlOrpcUnitTargetActionResult> {
  const beforeUnit = probe(() => summarizeUnit(input.unitId, target));
  const beforeTargetUnits = probe(() => targetUnitsAt(input.x, input.y, target));
  const targetIndex = targetIndexFor(input.x, input.y, target);
  const ownerMatchesLocalPlayer = input.unitId.owner === target.GameContext?.localPlayerID;
  const candidates = ownerMatchesLocalPlayer
    ? unitTargetCandidates(input, targetIndex, target)
    : [];
  const selected = candidates.find(acceptedCandidate) ?? null;

  if (!ownerMatchesLocalPlayer || selected == null) {
    return unitTargetResult({
      input,
      targetIndex,
      beforeUnit,
      beforeTargetUnits,
      candidates,
      selected: null,
      sent: false,
      sendResult: undefined,
      afterUnit: undefined,
      afterTargetUnits: undefined,
      verification: {
        status: "not-sent",
        classification: "not-sent",
        unitChanged: false,
        targetUnitsChanged: false,
        destinationReached: null,
        requestedLocation: { x: input.x, y: input.y },
        landedLocation: locationFromUnitProbe(beforeUnit),
        source: "immediate",
        attempts: 0,
        observedAfterMs: 0,
        reason: ownerMatchesLocalPlayer
          ? "No acceptable game UI unit target action candidate validated for the requested tile."
          : "The requested unit is not owned by GameContext.localPlayerID; game UI controller did not send.",
      },
    });
  }

  const sendResult = probe(() => sendCandidate(input.unitId, selected, target));
  const sent = sendResult.ok && sendResult.value !== false;
  const afterUnit = probe(() => summarizeUnit(input.unitId, target));
  const afterTargetUnits = probe(() => targetUnitsAt(input.x, input.y, target));
  const verification = unitTargetVerification(
    input,
    selected,
    sent,
    beforeUnit,
    beforeTargetUnits,
    afterUnit,
    afterTargetUnits,
  );

  return unitTargetResult({
    input,
    targetIndex,
    beforeUnit,
    beforeTargetUnits,
    candidates,
    selected,
    sent,
    sendResult,
    afterUnit,
    afterTargetUnits,
    verification,
  });
}

function unitTargetResult(input: Readonly<{
  input: Readonly<{
    unitId: Civ7ControlOrpcComponentId;
    x: number;
    y: number;
  }>;
  targetIndex: RuntimeProbe<number>;
  beforeUnit: RuntimeProbe<unknown>;
  beforeTargetUnits: RuntimeProbe<unknown>;
  candidates: readonly UnitTargetCandidate[];
  selected: UnitTargetCandidate | null;
  sent: boolean;
  sendResult: RuntimeProbe<unknown> | undefined;
  afterUnit: RuntimeProbe<unknown> | undefined;
  afterTargetUnits: RuntimeProbe<unknown> | undefined;
  verification: NonNullable<Civ7ControlOrpcUnitTargetActionResult["verification"]>;
}>): Civ7ControlOrpcUnitTargetActionResult {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    unitId: input.input.unitId,
    target: {
      x: input.input.x,
      y: input.input.y,
      index: input.targetIndex,
    },
    beforeUnit: input.beforeUnit,
    beforeTargetUnits: input.beforeTargetUnits,
    candidates: [...input.candidates],
    selected: input.selected,
    sent: input.sent,
    ...(input.sendResult === undefined ? {} : { sendResult: input.sendResult }),
    ...(input.afterUnit === undefined ? {} : { afterUnit: input.afterUnit }),
    ...(input.afterTargetUnits === undefined
      ? {}
      : { afterTargetUnits: input.afterTargetUnits }),
    verified: input.verification.status === "verified",
    verification: input.verification,
    notes: [
      "Game UI unit target action uses fixed official right-click candidate ordering: naval, air, ranged, overrun, swap, then MOVE_TO.",
      "Game UI controller only sends for units owned by GameContext.localPlayerID.",
    ],
  };
}

function unitTargetCandidates(
  input: Readonly<{
    unitId: Civ7ControlOrpcComponentId;
    x: number;
    y: number;
  }>,
  targetIndex: RuntimeProbe<number>,
  target: Civ7GameUiUnitTargetActionTarget,
): UnitTargetCandidate[] {
  const baseArgs = { X: input.x, Y: input.y };
  const attackArgs = { ...baseArgs, Modifiers: moveModifiers(target) };
  return [
    candidate("unit-operation", "UNITOPERATION_NAVAL_ATTACK", attackArgs, input.unitId, targetIndex, target),
    candidate("unit-operation", "UNITOPERATION_AIR_ATTACK", attackArgs, input.unitId, targetIndex, target),
    candidate("unit-operation", "UNITOPERATION_RANGE_ATTACK", attackArgs, input.unitId, targetIndex, target),
    candidate("unit-command", "UNITCOMMAND_ARMY_OVERRUN", baseArgs, input.unitId, targetIndex, target),
    candidate("unit-operation", "UNITOPERATION_SWAP_UNITS", baseArgs, input.unitId, targetIndex, target),
    candidate("unit-operation", "MOVE_TO", attackArgs, input.unitId, targetIndex, target),
  ];
}

function candidate(
  family: UnitTargetCandidate["family"],
  operationType: string,
  args: Readonly<Record<string, number>>,
  unitId: Civ7ControlOrpcComponentId,
  targetIndex: RuntimeProbe<number>,
  target: Civ7GameUiUnitTargetActionTarget,
): UnitTargetCandidate {
  const router = family === "unit-command"
    ? target.Game?.UnitCommands
    : target.Game?.UnitOperations;
  const enums = family === "unit-command"
    ? target.UnitCommandTypes
    : target.UnitOperationTypes;
  const enumValue = enumValueFor(enums, operationType);
  const result = probe(() =>
    router?.canStart?.(unitId, enumValue, args, false) ?? false
  );
  const valid = result.ok && successFromCanStart(result.value);
  const targetInReturnedPlots = targetInReturnedPlotsFor(result, targetIndex);
  return {
    family,
    operationType,
    args,
    valid,
    result,
    targetInReturnedPlots,
    ...(valid && targetInReturnedPlots === false
      ? { rejectedReason: "target not present in canStart returned Plots" }
      : {}),
  };
}

function sendCandidate(
  unitId: Civ7ControlOrpcComponentId,
  entry: UnitTargetCandidate,
  target: Civ7GameUiUnitTargetActionTarget,
): unknown {
  const router = entry.family === "unit-command"
    ? target.Game?.UnitCommands
    : target.Game?.UnitOperations;
  const enums = entry.family === "unit-command"
    ? target.UnitCommandTypes
    : target.UnitOperationTypes;
  return router?.sendRequest?.(
    unitId,
    enumValueFor(enums, entry.operationType),
    argsRecord(entry.args),
  );
}

function unitTargetVerification(
  input: Readonly<{
    x: number;
    y: number;
  }>,
  selected: UnitTargetCandidate,
  sent: boolean,
  beforeUnit: RuntimeProbe<unknown>,
  beforeTargetUnits: RuntimeProbe<unknown>,
  afterUnit: RuntimeProbe<unknown>,
  afterTargetUnits: RuntimeProbe<unknown>,
): NonNullable<Civ7ControlOrpcUnitTargetActionResult["verification"]> {
  if (!sent) {
    return {
      status: "not-sent",
      classification: "not-sent",
      unitChanged: false,
      targetUnitsChanged: false,
      destinationReached: null,
      requestedLocation: { x: input.x, y: input.y },
      landedLocation: locationFromUnitProbe(beforeUnit),
      source: "immediate",
      attempts: 0,
      observedAfterMs: 0,
      reason: "The game UI unit target send did not report a sent result.",
    };
  }

  const unitChanged = stableJson(beforeUnit) !== stableJson(afterUnit);
  const targetUnitsChanged = stableJson(beforeTargetUnits) !== stableJson(afterTargetUnits);
  const requestedLocation = { x: input.x, y: input.y };
  const beforeLocation = locationFromUnitProbe(beforeUnit);
  const landedLocation = locationFromUnitProbe(afterUnit);
  const destinationReached = landedLocation
    ? sameLocation(landedLocation, requestedLocation)
    : null;
  const originChanged = beforeLocation && landedLocation
    ? !sameLocation(beforeLocation, landedLocation)
    : unitChanged;
  const classification = !unitChanged && !targetUnitsChanged
    ? "no-state-change"
    : selected.operationType === "MOVE_TO" && destinationReached === true
      ? "target-reached"
      : selected.operationType === "MOVE_TO" && originChanged && destinationReached === false
        ? "path-shortfall"
        : targetUnitsChanged
          ? "target-state-changed"
          : "unit-state-changed";

  return {
    status: unitChanged || targetUnitsChanged ? "verified" : "no-state-change",
    classification,
    unitChanged,
    targetUnitsChanged,
    destinationReached,
    requestedLocation,
    landedLocation,
    source: "immediate",
    attempts: 0,
    observedAfterMs: 0,
    reason: unitTargetReason(classification),
  };
}

function unitTargetReason(
  classification: NonNullable<
    Civ7ControlOrpcUnitTargetActionResult["verification"]
  >["classification"],
): string {
  switch (classification) {
    case "target-reached":
      return "unit reached the requested target tile";
    case "path-shortfall":
      return "unit moved, but landed short of the requested target tile; re-read before issuing a follow-up move";
    case "target-state-changed":
      return "target-plot unit state changed after send";
    case "unit-state-changed":
      return "unit state changed after send";
    case "no-state-change":
      return "send returned but unit and target-plot probes did not change; re-read before repeating";
    case "not-sent":
      return "no unit target action was sent";
  }
}

function targetIndexFor(
  x: number,
  y: number,
  target: Civ7GameUiUnitTargetActionTarget,
): RuntimeProbe<number> {
  return probe(() =>
    typeof target.GameplayMap?.getIndexFromLocation === "function"
      ? target.GameplayMap.getIndexFromLocation({ x, y })
      : target.GameplayMap?.getIndexFromXY?.(x, y) ?? -1
  );
}

function summarizeUnit(
  unitId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiUnitTargetActionTarget,
): unknown {
  const unit = target.Units?.get?.(unitId);
  if (unit == null || typeof unit !== "object") return null;
  const record = unit as Record<string, any>;
  return {
    id: toComponentId(record.id) ?? unitId,
    owner: record.owner ?? unitId.owner,
    type: record.type ?? unitId.type ?? null,
    location: record.location ?? null,
    movementMovesRemaining: record.Movement?.movementMovesRemaining ?? null,
    movementTurnsRemaining: record.Movement?.movementTurnsRemaining ?? null,
    attacksRemaining: record.Combat?.attacksRemaining ?? null,
    rangedStrength: record.Combat?.rangedStrength ?? null,
    bombardStrength: record.Combat?.bombardStrength ?? null,
    meleeStrength: typeof record.Combat?.getMeleeStrength === "function"
      ? record.Combat.getMeleeStrength(false)
      : null,
    damage: record.Health?.damage ?? null,
    hitPoints: record.Health?.hitPoints ?? null,
  };
}

function targetUnitsAt(
  x: number,
  y: number,
  target: Civ7GameUiUnitTargetActionTarget,
): unknown {
  const units = target.MapUnits?.getUnits?.(x, y) ?? [];
  return Array.isArray(units)
    ? units.map((id) => toComponentId(id) ?? id)
    : units;
}

function targetInReturnedPlotsFor(
  result: RuntimeProbe<unknown>,
  targetIndex: RuntimeProbe<number>,
): boolean | null {
  if (!result.ok || !targetIndex.ok) return null;
  const value = result.value;
  if (value == null || typeof value !== "object") return null;
  const plots = (value as { Plots?: unknown }).Plots;
  return Array.isArray(plots) ? plots.includes(targetIndex.value) : null;
}

function moveModifiers(target: Civ7GameUiUnitTargetActionTarget): number {
  return (target.UnitOperationMoveModifiers?.ATTACK ?? 0)
    + (target.UnitOperationMoveModifiers?.MOVE_IGNORE_UNEXPLORED_DESTINATION ?? 0);
}

function acceptedCandidate(entry: UnitTargetCandidate): boolean {
  return entry.valid === true && entry.targetInReturnedPlots !== false;
}

function enumValueFor(
  enums: Record<string, unknown> | undefined,
  operationType: string,
): unknown {
  if (enums == null) return operationType;
  if (Object.prototype.hasOwnProperty.call(enums, operationType)) {
    return enums[operationType];
  }
  for (const key of [
    operationType.replace(/^UNITOPERATION_/, ""),
    operationType.replace(/^UNITCOMMAND_/, ""),
  ]) {
    if (Object.prototype.hasOwnProperty.call(enums, key)) {
      return enums[key];
    }
  }
  return operationType;
}

function successFromCanStart(result: unknown): boolean {
  if (result === true) return true;
  if (result === false || result == null) return false;
  if (typeof result === "object") {
    const record = result as Record<string, unknown>;
    if (record.Success !== undefined) return record.Success === true;
    if (record.success !== undefined) return record.success === true;
    if (record.canStart !== undefined) return record.canStart === true;
  }
  return Boolean(result);
}

function argsRecord(value: unknown): Readonly<Record<string, number>> {
  return value != null && typeof value === "object"
    ? value as Readonly<Record<string, number>>
    : {};
}

function locationFromUnitProbe(
  input: RuntimeProbe<unknown> | undefined,
): { x: number; y: number } | null {
  const value = input?.ok === true ? input.value : null;
  if (value == null || typeof value !== "object") return null;
  const location = (value as { location?: unknown }).location;
  if (location == null || typeof location !== "object") return null;
  const { x, y } = location as { x?: unknown; y?: unknown };
  return typeof x === "number" && typeof y === "number" ? { x, y } : null;
}

function sameLocation(
  left: Readonly<{ x: number; y: number }>,
  right: Readonly<{ x: number; y: number }>,
): boolean {
  return left.x === right.x && left.y === right.y;
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.owner !== "number" || typeof record.id !== "number") {
    return null;
  }
  return typeof record.type === "number"
    ? { owner: record.owner, id: record.id, type: record.type }
    : { owner: record.owner, id: record.id };
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, candidate) => {
    if (candidate == null || typeof candidate !== "object" || Array.isArray(candidate)) {
      return candidate;
    }
    return Object.fromEntries(
      Object.entries(candidate as Record<string, unknown>).sort(([left], [right]) =>
        left.localeCompare(right)
      ),
    );
  });
}

function probe<T>(fn: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
