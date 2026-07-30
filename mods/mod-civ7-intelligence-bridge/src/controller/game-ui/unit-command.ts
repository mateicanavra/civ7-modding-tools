import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcDirectControlFacade,
} from "../service-types";

const UNIT_UPGRADE = "UNITCOMMAND_UPGRADE";
const UNIT_RESETTLE = "UNITCOMMAND_RESETTLE";

type UnitUpgradeCheckInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7UnitUpgrade"]
>[0];
type UnitUpgradeSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7UnitUpgrade"]
>[0];
type UnitResettleCheckInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7UnitResettle"]
>[0];
type UnitResettleSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7UnitResettle"]
>[0];
type UnitCheckResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["checkCiv7UnitUpgrade"]>
>;
type UnitSendResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["sendCiv7UnitUpgrade"]>
>;
type UnitSnapshot = UnitSendResult["before"];
type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;

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
        queue?: boolean
      ) => unknown;
      sendRequest?: (
        unitId: Civ7ControlOrpcComponentId,
        commandType: unknown,
        args: Readonly<Record<string, number>>
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

/** Reports whether the in-game controller can check and send both supported unit commands. */
export function civ7GameUiUnitCommandAvailable(target: Civ7GameUiUnitCommandTarget): boolean {
  return (
    typeof target.Game?.UnitCommands?.canStart === "function" &&
    typeof target.Game.UnitCommands.sendRequest === "function" &&
    target.UnitCommandTypes != null &&
    (target.UnitCommandTypes.UNITCOMMAND_UPGRADE !== undefined ||
      target.UnitCommandTypes.UPGRADE !== undefined) &&
    (target.UnitCommandTypes.UNITCOMMAND_RESETTLE !== undefined ||
      target.UnitCommandTypes.RESETTLE !== undefined) &&
    typeof target.GameContext?.localPlayerID === "number" &&
    typeof target.Units?.get === "function" &&
    typeof target.UI?.Player?.getFirstReadyUnit === "function" &&
    typeof target.UI.Player.getHeadSelectedUnit === "function" &&
    typeof target.Game?.Notifications?.getEndTurnBlockingType === "function"
  );
}

/** Checks upgrade admission against the current in-game unit-command router. */
export async function checkCiv7GameUiUnitUpgrade(
  input: UnitUpgradeCheckInput,
  target: Civ7GameUiUnitCommandTarget = globalThis as Civ7GameUiUnitCommandTarget
): Promise<UnitCheckResult> {
  return checkUnitCommand(input.unitId, UNIT_UPGRADE, {}, target);
}

/** Sends an upgrade only after a fresh in-game admission check and captures surrounding state. */
export async function sendCiv7GameUiUnitUpgrade(
  input: UnitUpgradeSendInput,
  target: Civ7GameUiUnitCommandTarget = globalThis as Civ7GameUiUnitCommandTarget
): Promise<UnitSendResult> {
  return sendUnitCommand(input.unitId, UNIT_UPGRADE, {}, target);
}

/** Checks resettlement admission against the current in-game unit-command router. */
export async function checkCiv7GameUiUnitResettle(
  input: UnitResettleCheckInput,
  target: Civ7GameUiUnitCommandTarget = globalThis as Civ7GameUiUnitCommandTarget
): Promise<UnitCheckResult> {
  return checkUnitCommand(
    input.unitId,
    UNIT_RESETTLE,
    { X: input.destination.x, Y: input.destination.y },
    target
  );
}

/** Sends resettlement only after a fresh in-game admission check and captures surrounding state. */
export async function sendCiv7GameUiUnitResettle(
  input: UnitResettleSendInput,
  target: Civ7GameUiUnitCommandTarget = globalThis as Civ7GameUiUnitCommandTarget
): Promise<UnitSendResult> {
  return sendUnitCommand(
    input.unitId,
    UNIT_RESETTLE,
    { X: input.destination.x, Y: input.destination.y },
    target
  );
}

function checkUnitCommand(
  unitId: Civ7ControlOrpcComponentId,
  operationType: string,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiUnitCommandTarget
): UnitCheckResult {
  if (unitId.owner !== target.GameContext?.localPlayerID) {
    return {
      valid: false,
      result: {
        ok: false,
        reason:
          "The requested unit is not owned by GameContext.localPlayerID; the game UI controller refused the command.",
        unitId,
      },
    };
  }
  const commands = target.Game?.UnitCommands;
  if (typeof commands?.canStart !== "function") {
    throw new Error("Game.UnitCommands.canStart is unavailable.");
  }
  const commandType = enumValueFor(target.UnitCommandTypes, operationType);
  const result = commands.canStart(unitId, commandType, args, false);
  return {
    valid: successFromCanStart(result),
    result,
  };
}

function sendUnitCommand(
  unitId: Civ7ControlOrpcComponentId,
  operationType: string,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiUnitCommandTarget
): UnitSendResult {
  const before = readUnitSnapshot(unitId, target);
  const validation = checkUnitCommand(unitId, operationType, args, target);
  if (!validation.valid) {
    return {
      sent: false,
      validation,
      before,
      after: before,
    };
  }

  const commands = target.Game?.UnitCommands;
  if (typeof commands?.sendRequest !== "function") {
    throw new Error("Game.UnitCommands.sendRequest is unavailable.");
  }
  const commandType = enumValueFor(target.UnitCommandTypes, operationType);
  const result = commands.sendRequest(unitId, commandType, args);
  return {
    sent: result !== false,
    validation,
    before,
    after: readUnitSnapshot(unitId, target),
  };
}

function readUnitSnapshot(
  unitId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiUnitCommandTarget
): UnitSnapshot {
  const localPlayerId = target.GameContext?.localPlayerID;
  return {
    unit: probe(() => summarizeUnit(target.Units?.get?.(unitId))),
    selectedUnitId: probe(() => componentIdFromUnknown(target.UI?.Player?.getHeadSelectedUnit?.())),
    firstReadyUnitId: probe(() => componentIdFromUnknown(target.UI?.Player?.getFirstReadyUnit?.())),
    blocker: probe(() =>
      typeof localPlayerId === "number"
        ? (target.Game?.Notifications?.getEndTurnBlockingType?.(localPlayerId) ?? null)
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
    movement: record.Movement ?? record.movement ?? record.movementMovesRemaining ?? null,
    activity: record.Activity ?? record.activity ?? record.currentActivity ?? null,
    damage: record.Damage ?? record.damage ?? null,
    attacks: record.Attacks ?? record.attacks ?? record.attackCharges ?? null,
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
  upperKey: string
): number | null {
  const lower = record[lowerKey];
  if (typeof lower === "number") return lower;
  const upper = record[upperKey];
  return typeof upper === "number" ? upper : null;
}

function enumValueFor(
  enums: Readonly<Record<string, unknown>> | undefined,
  operationType: string
): unknown {
  if (enums == null) return operationType;
  if (Object.prototype.hasOwnProperty.call(enums, operationType)) return enums[operationType];
  const normalized = operationType.replace(/^UNITCOMMAND_/, "");
  return Object.prototype.hasOwnProperty.call(enums, normalized)
    ? enums[normalized]
    : operationType;
}

function successFromCanStart(result: unknown): boolean {
  if (typeof result === "boolean") return result;
  if (result !== null && typeof result === "object" && !Array.isArray(result)) {
    const record = result as Record<string, unknown>;
    for (const key of ["Success", "success", "canStart"] as const) {
      if (key in record) {
        if (typeof record[key] === "boolean") return record[key];
        throw new Error(`Game.UnitCommands.canStart returned a non-boolean ${key} field.`);
      }
    }
  }
  throw new Error("Game.UnitCommands.canStart returned an unrecognized result.");
}

function probe<T>(read: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: read() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
