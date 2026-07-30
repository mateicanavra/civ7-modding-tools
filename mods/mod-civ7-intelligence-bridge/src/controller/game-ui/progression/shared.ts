import type { Civ7ProgressionTreeCheckResult } from "@civ7/direct-control";
import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

import type { Civ7ControlOrpcComponentId } from "../../service-types";

export type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;
export type PlayerRecord = Readonly<Record<string, unknown>>;
type PlayerOperations = NonNullable<
  NonNullable<Civ7GameUiProgressionTarget["Game"]>["PlayerOperations"]
>;
type JsonValue = Civ7ProgressionTreeCheckResult["result"];

export type StrictValidation = Readonly<
  { valid: true; result: JsonValue } | { valid: false; result: JsonValue }
>;

export type Civ7GameUiProgressionTarget = Readonly<{
  Game?: {
    Notifications?: {
      find?: unknown;
      findEndTurnBlocking?: (playerId: number, blockerType: unknown) => unknown;
      getEndTurnBlockingType?: (playerId: number) => unknown;
      getType?: unknown;
      getTypeName?: (type: unknown) => unknown;
    };
    PlayerOperations?: {
      canStart?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<Record<string, number>>,
        queue?: boolean
      ) => unknown;
      sendRequest?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<Record<string, number>>
      ) => unknown;
    };
    ProgressionTrees?: {
      getNode?: (playerId: number, node: number) => unknown;
      getNodeState?: (playerId: number, node: number) => unknown;
      getTree?: (playerId: number, treeId: unknown) => unknown;
    };
  };
  GameContext?: {
    localPlayerID?: number;
  };
  GameInfo?: {
    Attributes?: Iterable<unknown>;
    ProgressionTreeNodes?: {
      lookup?: (node: unknown) => unknown;
    };
  };
  CultureSlotTypes?: {
    POLICY_CULTURE_SLOT?: unknown;
    TRADITION_CULTURE_SLOT?: unknown;
    CRISIS_CULTURE_SLOT?: unknown;
  };
  PlayerOperationParameters?: {
    Activate?: unknown;
    Deactivate?: unknown;
  };
  PlayerOperationTypes?: {
    SET_TECH_TREE_NODE?: unknown;
    SET_TECH_TREE_TARGET_NODE?: unknown;
    SET_CULTURE_TREE_NODE?: unknown;
    SET_CULTURE_TREE_TARGET_NODE?: unknown;
    BUY_ATTRIBUTE_TREE_NODE?: unknown;
    CONSIDER_ASSIGN_ATTRIBUTE?: unknown;
    CHANGE_TRADITION?: unknown;
    CONSIDER_ASSIGN_TRADITIONS?: unknown;
  };
  Players?: {
    get?: (playerId: number) => unknown;
  };
  ProgressionTreeNodeTypes?: {
    NO_NODE?: unknown;
  };
}>;

export function readBlockingNotificationEvidence(
  localPlayerId: number,
  target: Civ7GameUiProgressionTarget
): Readonly<{
  blocker: RuntimeProbe<number | string>;
  blockingNotification: RuntimeProbe<Readonly<{
    id: Civ7ControlOrpcComponentId;
    type: number | string | null;
    typeName: string | null;
    target: Civ7ControlOrpcComponentId | null;
  }> | null>;
}> {
  const blocker = probe(() => {
    const notifications = target.Game?.Notifications;
    const readBlocker = notifications?.getEndTurnBlockingType;
    if (typeof readBlocker !== "function") {
      throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
    }
    return endTurnBlockerType(readBlocker.call(notifications, localPlayerId));
  });
  if (!blocker.ok) {
    return {
      blocker,
      blockingNotification: {
        ok: false,
        error: "Blocking notification is unavailable because the blocker read failed.",
      },
    };
  }
  return {
    blocker,
    blockingNotification: probe(() => {
      const notifications = target.Game?.Notifications;
      if (typeof notifications?.findEndTurnBlocking !== "function") {
        throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
      }
      const rawId = notifications.findEndTurnBlocking(localPlayerId, blocker.value);
      if (rawId == null) return null;
      const id = toComponentId(rawId);
      if (id == null) {
        throw new Error("Game.Notifications.findEndTurnBlocking returned an invalid ComponentID.");
      }
      const notification =
        typeof notifications.find === "function"
          ? Reflect.apply(notifications.find, notifications, [rawId])
          : null;
      const type = notificationType(
        typeof notifications.getType === "function"
          ? Reflect.apply(notifications.getType, notifications, [rawId])
          : notificationValue(notification, ["Type", "type"])
      );
      const typeName = nullableString(
        typeof notifications.getTypeName === "function"
          ? notifications.getTypeName(type)
          : notificationValue(notification, ["TypeName", "typeName"])
      );
      return {
        id,
        type,
        typeName,
        target: toComponentId(notificationValue(notification, ["Target", "target"])),
      };
    }),
  };
}

export function strictPlayerOperationValidation(
  localPlayerId: number,
  operationType: unknown,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiProgressionTarget
): StrictValidation {
  const operations = target.Game?.PlayerOperations;
  const canStart = operations?.canStart;
  if (typeof canStart !== "function") {
    throw new Error("Game.PlayerOperations.canStart is unavailable.");
  }
  const rawResult = canStart.call(operations, localPlayerId, operationType, args, false);
  const rawRecord = recordOrNull(rawResult);
  if (rawRecord == null || typeof rawRecord.Success !== "boolean") {
    throw new Error("Game.PlayerOperations.canStart returned an invalid Success result.");
  }
  const result = immutableJson<JsonValue>(rawResult, "Game.PlayerOperations.canStart");
  return rawRecord.Success === true ? { valid: true, result } : { valid: false, result };
}

export function requireLocalPlayer(
  target: Civ7GameUiProgressionTarget
): Readonly<{ localPlayerId: number; player: PlayerRecord }> {
  const localPlayerId = requireInteger(target.GameContext?.localPlayerID, "localPlayerID");
  const players = target.Players;
  const getPlayer = players?.get;
  if (typeof getPlayer !== "function") throw new Error("Players.get is unavailable.");
  const player = recordOrNull(getPlayer.call(players, localPlayerId));
  if (player == null) throw new Error("The ambient local player is unavailable.");
  return { localPlayerId, player };
}

export function requirePlayerOperations(
  target: Civ7GameUiProgressionTarget
): Required<Pick<PlayerOperations, "sendRequest">> {
  const operations = target.Game?.PlayerOperations;
  const sendRequest = operations?.sendRequest;
  if (operations == null || typeof sendRequest !== "function") {
    throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
  }
  return {
    sendRequest: (playerId, operationType, args) =>
      sendRequest.call(operations, playerId, operationType, args),
  };
}

export function requireOperationType(
  name: keyof NonNullable<Civ7GameUiProgressionTarget["PlayerOperationTypes"]>,
  target: Civ7GameUiProgressionTarget
): unknown {
  const value = target.PlayerOperationTypes?.[name];
  if (value === undefined) throw new Error(`PlayerOperationTypes.${name} is unavailable.`);
  return value;
}

export function requireInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${label} must be an integer.`);
  }
  return value;
}

export function requireIntegerOrNull(value: unknown, label: string): number | null {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${label} returned a non-integer value.`);
  }
  return value;
}

export function requireNumberOrNull(value: unknown, label: string): number | null {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} returned a non-number value.`);
  }
  return value;
}

export function localPlayerAvailable(target: Civ7GameUiProgressionTarget): boolean {
  return (
    Number.isInteger(target.GameContext?.localPlayerID) && typeof target.Players?.get === "function"
  );
}

export function jsonValuesMatch(left: unknown, right: unknown): boolean {
  return left != null && JSON.stringify(left) === JSON.stringify(right);
}

export function recordOrNull(value: unknown): PlayerRecord | null {
  return isRecord(value) ? value : null;
}

export function isIterable(value: unknown): value is Iterable<unknown> {
  return (
    value != null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof Reflect.get(value, Symbol.iterator) === "function"
  );
}

export function progressionDispatchError(
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

function endTurnBlockerType(value: unknown): number | string {
  if (value === 0) return 0;
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && value.trim().length > 0 && value.trim() !== "0") {
    return value;
  }
  throw new Error(
    "Game.Notifications.getEndTurnBlockingType returned an unsupported blocker identity."
  );
}

function notificationType(value: unknown): number | string | null {
  if (typeof value === "string") return value;
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function notificationValue(notification: unknown, names: readonly string[]): unknown {
  for (const name of names) {
    if (
      notification != null &&
      (typeof notification === "object" || typeof notification === "function") &&
      name in notification
    ) {
      const value = Reflect.get(notification, name);
      return typeof value === "function" ? Reflect.apply(value, notification, []) : value;
    }
    const getter = `get${name}`;
    if (
      notification != null &&
      (typeof notification === "object" || typeof notification === "function")
    ) {
      const value = Reflect.get(notification, getter);
      if (typeof value === "function") return Reflect.apply(value, notification, []);
    }
  }
  return null;
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  const record = recordOrNull(value);
  if (record == null) return null;
  const owner = finiteNumber(record.owner) ?? finiteNumber(record.Owner);
  const id = finiteNumber(record.id) ?? finiteNumber(record.ID);
  if (owner == null || id == null) return null;
  const type = finiteNumber(record.type) ?? finiteNumber(record.Type);
  return type == null ? { owner, id } : { owner, id, type };
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is PlayerRecord {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function immutableJson<T extends JsonValue>(value: unknown, label: string): T {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error(`${label} returned non-JSON evidence.`);
  return JSON.parse(serialized) as T;
}

function probe<T>(read: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: read() };
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof Error ? cause.message : String(cause),
    };
  }
}
