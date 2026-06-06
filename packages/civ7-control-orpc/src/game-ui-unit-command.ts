import type { Civ7ControlOrpcContext } from "./context";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type Civ7GameUiUnitCommandRuntimeResult = Awaited<
  ReturnType<Civ7ControlOrpcContext["directControl"]["requestCiv7UnitCommand"]>
>;
type UnitCommandValidation = Civ7GameUiUnitCommandRuntimeResult["before"];
type UnitCommandPostcondition =
  NonNullable<Civ7GameUiUnitCommandRuntimeResult["postcondition"]>;
type UnitCommandPostconditionSnapshot =
  NonNullable<UnitCommandPostcondition["before"]>;
type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;

export type Civ7GameUiUnitCommandTarget = Readonly<{
  Game?: {
    Notifications?: {
      getEndTurnBlockingType?: (playerId: number) => unknown;
    };
    UnitCommands?: {
      canStart?: (
        unitId: Civ7ControlOrpcComponentId,
        commandType: unknown,
        args: Readonly<Record<string, number>>,
        queue?: boolean,
      ) => unknown;
      sendRequest?: (
        unitId: Civ7ControlOrpcComponentId,
        commandType: unknown,
        args: Readonly<Record<string, number>>,
      ) => unknown;
    };
  };
  GameContext?: {
    localPlayerID?: number;
  };
  UI?: {
    Player?: {
      getFirstReadyUnit?: () => unknown;
      getHeadSelectedUnit?: () => unknown;
    };
  };
  UnitCommandTypes?: Record<string, unknown>;
  Units?: {
    get?: (id: Civ7ControlOrpcComponentId) => unknown;
  };
}>;

export function civ7GameUiUnitCommandAvailable(
  target: Civ7GameUiUnitCommandTarget,
): boolean {
  return typeof target.Game?.UnitCommands?.canStart === "function"
    && typeof target.Game.UnitCommands.sendRequest === "function"
    && target.UnitCommandTypes != null
    && (
      target.UnitCommandTypes.UNITCOMMAND_UPGRADE !== undefined
      || target.UnitCommandTypes.UPGRADE !== undefined
    )
    && (
      target.UnitCommandTypes.UNITCOMMAND_RESETTLE !== undefined
      || target.UnitCommandTypes.RESETTLE !== undefined
    )
    && typeof target.GameContext?.localPlayerID === "number"
    && typeof target.Units?.get === "function"
    && typeof target.UI?.Player?.getFirstReadyUnit === "function"
    && typeof target.UI.Player.getHeadSelectedUnit === "function"
    && typeof target.Game?.Notifications?.getEndTurnBlockingType === "function";
}

export async function requestCiv7GameUiUnitCommand(
  input: Readonly<{
    unitId: Civ7ControlOrpcComponentId;
    operationType: string;
    args?: Readonly<Record<string, number>>;
  }>,
  target: Civ7GameUiUnitCommandTarget =
    globalThis as Civ7GameUiUnitCommandTarget,
): Promise<Civ7GameUiUnitCommandRuntimeResult> {
  const args = argsRecord(input.args);
  const localPlayerId = target.GameContext?.localPlayerID;
  const beforeSnapshot = readUnitPostconditionSnapshot(input.unitId, target);
  const before = input.unitId.owner === localPlayerId
    ? gameUiUnitCommandValidation(input.unitId, input.operationType, args, target)
    : gameUiUnitCommandValidationBlocked(
      input.unitId,
      input.operationType,
      args,
      "The requested unit is not owned by GameContext.localPlayerID; game UI controller did not send.",
    );

  if (!before.valid) {
    const postcondition = gameUiUnitCommandPostcondition(
      input.operationType,
      false,
      before,
      before,
      beforeSnapshot,
      beforeSnapshot,
    );
    return {
      before,
      after: before,
      sent: false,
      verified: false,
      postcondition,
    };
  }

  const commandType = enumValueFor(target.UnitCommandTypes, input.operationType);
  const sendResult = probe(() =>
    target.Game?.UnitCommands?.sendRequest?.(input.unitId, commandType, args)
  );
  const sent = sendResult.ok && sendResult.value !== false;
  const afterSnapshot = readUnitPostconditionSnapshot(input.unitId, target);
  const after = gameUiUnitCommandValidation(
    input.unitId,
    input.operationType,
    args,
    target,
  );
  const postcondition = gameUiUnitCommandPostcondition(
    input.operationType,
    sent,
    before,
    after,
    beforeSnapshot,
    afterSnapshot,
  );

  return {
    before,
    ...(sent
      ? {
          command: {
            host: "game-ui",
            port: 0,
            state: { id: "game-ui", name: "Game UI" },
            output: ["game-ui-unit-command-requested"],
          },
        }
      : {}),
    after,
    sent,
    verified: sent && postcondition.classification !== "no-state-change",
    postcondition,
  };
}

function gameUiUnitCommandValidation(
  unitId: Civ7ControlOrpcComponentId,
  operationType: string,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiUnitCommandTarget,
): UnitCommandValidation {
  const enumValue = enumValueFor(target.UnitCommandTypes, operationType);
  const result = probe(() =>
    target.Game?.UnitCommands?.canStart?.(unitId, enumValue, args, false)
  );
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "unit-command",
    operationType,
    enumValue,
    target: { unitId },
    args,
    valid: result.ok && successFromCanStart(result.value),
    result,
  };
}

function gameUiUnitCommandValidationBlocked(
  unitId: Civ7ControlOrpcComponentId,
  operationType: string,
  args: Readonly<Record<string, number>>,
  reason: string,
): UnitCommandValidation {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "unit-command",
    operationType,
    enumValue: operationType,
    target: { unitId },
    args,
    valid: false,
    result: {
      ok: false,
      reason,
      unitId,
    },
  };
}

function gameUiUnitCommandPostcondition(
  operationType: string,
  sent: boolean,
  before: UnitCommandValidation,
  after: UnitCommandValidation,
  beforeSnapshot: UnitCommandPostconditionSnapshot,
  afterSnapshot: UnitCommandPostconditionSnapshot,
): UnitCommandPostcondition {
  const classification = classifyGameUiUnitCommandPostcondition(
    sent,
    before,
    after,
    beforeSnapshot,
    afterSnapshot,
  );
  return {
    family: "unit-command",
    operationType,
    classification,
    before: beforeSnapshot,
    after: afterSnapshot,
    reason: unitCommandPostconditionReason(classification),
  };
}

function classifyGameUiUnitCommandPostcondition(
  sent: boolean,
  before: UnitCommandValidation,
  after: UnitCommandValidation,
  beforeSnapshot: UnitCommandPostconditionSnapshot,
  afterSnapshot: UnitCommandPostconditionSnapshot,
): UnitCommandPostcondition["classification"] {
  if (!sent) return "not-sent";
  if (probeValueChanged(beforeSnapshot.firstReadyUnitId, afterSnapshot.firstReadyUnitId)) {
    return "queue-advanced";
  }
  if (probeValueChanged(beforeSnapshot.selectedUnitId, afterSnapshot.selectedUnitId)) {
    return "selected-unit-changed";
  }
  if (probeFieldChanged(beforeSnapshot.unit, afterSnapshot.unit, "activity")) {
    return "activity-changed";
  }
  if (probeValueChanged(beforeSnapshot.unit, afterSnapshot.unit)) {
    return "unit-state-changed";
  }
  if (probeValueChanged(beforeSnapshot.blocker, afterSnapshot.blocker)) {
    return "blocker-changed";
  }
  if (before.valid !== after.valid || stableJson(before.result) !== stableJson(after.result)) {
    return "validation-changed";
  }
  return "no-state-change";
}

function unitCommandPostconditionReason(
  classification: UnitCommandPostcondition["classification"],
): string {
  switch (classification) {
    case "not-sent":
      return "The operation was not sent, so no unit-side postcondition can be verified.";
    case "queue-advanced":
      return "The first ready unit changed after the request, which shows the unit queue advanced.";
    case "selected-unit-changed":
      return "The selected unit changed after the request, which shows the game consumed the unit action.";
    case "activity-changed":
      return "The unit activity changed after the request.";
    case "unit-state-changed":
      return "The unit summary changed after the request.";
    case "blocker-changed":
      return "The end-turn blocker changed after the request.";
    case "validation-changed":
      return "The operation validation result changed after the request.";
    case "no-state-change":
      return "The request was sent, but no observed unit, queue, blocker, or validation state changed.";
  }
}

function readUnitPostconditionSnapshot(
  unitId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiUnitCommandTarget,
): UnitCommandPostconditionSnapshot {
  const localPlayerId = target.GameContext?.localPlayerID;
  return {
    unit: probe(() => summarizeUnit(target.Units?.get?.(unitId))),
    selectedUnitId: probe(() =>
      componentIdFromUnknown(target.UI?.Player?.getHeadSelectedUnit?.())
    ),
    firstReadyUnitId: probe(() =>
      componentIdFromUnknown(target.UI?.Player?.getFirstReadyUnit?.())
    ),
    blocker: probe(() =>
      typeof localPlayerId === "number"
        ? target.Game?.Notifications?.getEndTurnBlockingType?.(localPlayerId)
          ?? null
        : null
    ),
  };
}

function summarizeUnit(unit: unknown): unknown {
  if (unit == null || typeof unit !== "object") return null;
  const record = unit as Record<string, unknown>;
  return {
    id: componentIdFromUnknown(record.id ?? record.ID ?? record.UnitId ?? record.unitId),
    location: record.location ?? record.Location ?? null,
    movement: record.Movement
      ?? record.movement
      ?? record.movementMovesRemaining
      ?? null,
    activity: record.Activity
      ?? record.activity
      ?? record.currentActivity
      ?? null,
    damage: record.Damage ?? record.damage ?? null,
    attacks: record.Attacks
      ?? record.attacks
      ?? record.attackCharges
      ?? null,
  };
}

function componentIdFromUnknown(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const owner = numberField(record, "owner", "Owner");
  const id = numberField(record, "id", "ID");
  if (owner == null || id == null) return null;
  const type = numberField(record, "type", "Type");
  return type == null ? { owner, id } : { owner, id, type };
}

function numberField(
  record: Readonly<Record<string, unknown>>,
  lowerKey: string,
  upperKey: string,
): number | null {
  const lower = record[lowerKey];
  if (typeof lower === "number") return lower;
  const upper = record[upperKey];
  return typeof upper === "number" ? upper : null;
}

function enumValueFor(
  enums: Readonly<Record<string, unknown>> | undefined,
  operationType: string,
): unknown {
  if (enums == null) return operationType;
  if (Object.prototype.hasOwnProperty.call(enums, operationType)) {
    return enums[operationType];
  }
  const normalized = operationType.replace(/^UNITCOMMAND_/, "");
  if (Object.prototype.hasOwnProperty.call(enums, normalized)) {
    return enums[normalized];
  }
  return operationType;
}

function argsRecord(
  args: Readonly<Record<string, number>> | undefined,
): Readonly<Record<string, number>> {
  return args == null ? {} : { ...args };
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

function probe<T>(read: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: read() };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function probeValueChanged(
  left: RuntimeProbe<unknown> | undefined,
  right: RuntimeProbe<unknown> | undefined,
): boolean {
  if (!left?.ok || !right?.ok) return false;
  return stableJson(left.value) !== stableJson(right.value);
}

function probeFieldChanged(
  left: RuntimeProbe<unknown> | undefined,
  right: RuntimeProbe<unknown> | undefined,
  field: string,
): boolean {
  if (!left?.ok || !right?.ok) return false;
  if (left.value == null || right.value == null) return false;
  if (typeof left.value !== "object" || typeof right.value !== "object") {
    return false;
  }
  return stableJson((left.value as Record<string, unknown>)[field])
    !== stableJson((right.value as Record<string, unknown>)[field]);
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) =>
    `${JSON.stringify(key)}:${stableJson(record[key])}`
  ).join(",")}}`;
}
