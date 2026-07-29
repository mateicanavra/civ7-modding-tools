import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcDirectControlFacade,
} from "../service-types";

type NarrativeChoiceInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7NarrativeChoice"]
>[0];
type NarrativeChoiceSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7NarrativeChoice"]
>[0];
type NarrativeChoiceCheckResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["checkCiv7NarrativeChoice"]>
>;
type NarrativeChoiceSendResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["sendCiv7NarrativeChoice"]>
>;
type NarrativeChoiceSnapshot = NarrativeChoiceCheckResult["snapshot"];
type NarrativeChoiceValidationResult = NarrativeChoiceCheckResult["result"];
type NarrativeChoiceSendValidation = NarrativeChoiceSendResult["validation"];
type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;
type BlockingNotification =
  NarrativeChoiceSnapshot["blockingNotification"] extends RuntimeProbe<infer Notification>
    ? Notification
    : never;

export type Civ7GameUiNarrativeTarget = Readonly<{
  canEndTurn?: () => unknown;
  Game?: {
    Notifications?: {
      getEndTurnBlockingType?: (playerId: number) => unknown;
      findEndTurnBlocking?: (
        playerId: number,
        blockerType: unknown
      ) => Civ7ControlOrpcComponentId | null;
      find?: (id: Civ7ControlOrpcComponentId) => unknown;
      getType?: (id: Civ7ControlOrpcComponentId | null) => unknown;
      getTypeName?: (type: unknown) => string | null;
    };
    PlayerOperations?: {
      canStart?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<{
          TargetType: string;
          Target: Civ7ControlOrpcComponentId;
          Action: number;
        }>,
        queue?: boolean
      ) => unknown;
      sendRequest?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<{
          TargetType: string;
          Target: Civ7ControlOrpcComponentId;
          Action: number;
        }>
      ) => unknown;
    };
  };
  GameContext?: {
    localPlayerID?: number;
  };
  PlayerOperationParameters?: {
    Activate?: unknown;
  };
  PlayerOperationTypes?: {
    CHOOSE_NARRATIVE_STORY_DIRECTION?: unknown;
  };
}>;

/** Reports whether the game UI can check exact native narrative-choice admission. */
export function civ7GameUiNarrativeChoiceCheckAvailable(
  target: Civ7GameUiNarrativeTarget
): boolean {
  return (
    Number.isInteger(target.GameContext?.localPlayerID) &&
    Number.isInteger(target.PlayerOperationParameters?.Activate) &&
    target.PlayerOperationTypes?.CHOOSE_NARRATIVE_STORY_DIRECTION !== undefined &&
    typeof target.Game?.PlayerOperations?.canStart === "function"
  );
}

/** Reports whether the game UI can send an exact native narrative choice. */
export function civ7GameUiNarrativeChoiceSendAvailable(target: Civ7GameUiNarrativeTarget): boolean {
  return (
    civ7GameUiNarrativeChoiceCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

/** Checks CHOOSE_NARRATIVE_STORY_DIRECTION with ambient player and Activate identity. */
export async function checkCiv7GameUiNarrativeChoice(
  input: NarrativeChoiceInput,
  target: Civ7GameUiNarrativeTarget = globalThis as Civ7GameUiNarrativeTarget
): Promise<NarrativeChoiceCheckResult> {
  const targetType = requireTargetType(input.targetType);
  const narrativeTarget = requireComponentId(input.target, "target");
  const snapshot = readNarrativeChoiceSnapshot(target);
  const validation = checkNarrativeChoice(targetType, narrativeTarget, snapshot, target);
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot,
  };
}

/** Sends CHOOSE_NARRATIVE_STORY_DIRECTION once after a fresh exact native check. */
export async function sendCiv7GameUiNarrativeChoice(
  input: NarrativeChoiceSendInput,
  target: Civ7GameUiNarrativeTarget = globalThis as Civ7GameUiNarrativeTarget
): Promise<NarrativeChoiceSendResult> {
  let sendInvoked = false;
  try {
    const targetType = requireTargetType(input.targetType);
    const narrativeTarget = requireComponentId(input.target, "target");
    const operations = requirePlayerOperations(target);
    const operationType = requireNarrativeChoiceOperationType(target);
    const before = readNarrativeChoiceSnapshot(target);
    if (!narrativeChoiceGuardMatches(input.expected, before)) {
      throw new Error("Narrative choice admission evidence changed before dispatch.");
    }

    const args = narrativeChoiceArgs(targetType, narrativeTarget, before.activateAction);
    const validation = checkNarrativeChoiceWith(
      operations.canStart,
      operationType,
      args,
      before.localPlayerId
    );
    if (!validation.valid) {
      return {
        sent: false,
        validation,
        before,
        after: readNarrativeChoiceSnapshot(target),
      };
    }

    sendInvoked = true;
    operations.sendRequest(before.localPlayerId, operationType, args);
    return {
      sent: true,
      validation,
      before,
      after: readNarrativeChoiceSnapshot(target),
    };
  } catch (cause) {
    throw narrativeChoiceDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function checkNarrativeChoice(
  targetType: string,
  narrativeTarget: Civ7ControlOrpcComponentId,
  snapshot: NarrativeChoiceSnapshot,
  target: Civ7GameUiNarrativeTarget
): NarrativeChoiceSendValidation {
  const operations = requirePlayerOperations(target);
  return checkNarrativeChoiceWith(
    operations.canStart,
    requireNarrativeChoiceOperationType(target),
    narrativeChoiceArgs(targetType, narrativeTarget, snapshot.activateAction),
    snapshot.localPlayerId
  );
}

function checkNarrativeChoiceWith(
  canStart: (
    playerId: number,
    operationType: unknown,
    args: Readonly<{
      TargetType: string;
      Target: Civ7ControlOrpcComponentId;
      Action: number;
    }>,
    queue?: boolean
  ) => unknown,
  operationType: unknown,
  args: Readonly<{
    TargetType: string;
    Target: Civ7ControlOrpcComponentId;
    Action: number;
  }>,
  localPlayerId: number
): NarrativeChoiceSendValidation {
  const rawResult = canStart(localPlayerId, operationType, args, false);
  const valid = exactCanStartSuccess(rawResult);
  const result = snapshotJsonResult<NarrativeChoiceValidationResult>(
    rawResult,
    "Game.PlayerOperations.canStart"
  );
  return valid ? { valid: true, result } : { valid: false, result };
}

function narrativeChoiceArgs(
  targetType: string,
  target: Civ7ControlOrpcComponentId,
  activateAction: number
): Readonly<{
  TargetType: string;
  Target: Civ7ControlOrpcComponentId;
  Action: number;
}> {
  return {
    TargetType: targetType,
    Target: target,
    Action: activateAction,
  };
}

function readNarrativeChoiceSnapshot(target: Civ7GameUiNarrativeTarget): NarrativeChoiceSnapshot {
  const localPlayerId = requireInteger(
    target.GameContext?.localPlayerID,
    "GameContext.localPlayerID"
  );
  const activateAction = requireInteger(
    target.PlayerOperationParameters?.Activate,
    "PlayerOperationParameters.Activate"
  );
  const canEndTurn = probe(() => {
    if (typeof target.canEndTurn !== "function") {
      throw new Error("canEndTurn is unavailable.");
    }
    const value = target.canEndTurn.call(target);
    if (typeof value !== "boolean") {
      throw new Error("canEndTurn returned a non-boolean value.");
    }
    return value;
  });
  const blocker = probe(() => {
    const notifications = target.Game?.Notifications;
    if (typeof notifications?.getEndTurnBlockingType !== "function") {
      throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
    }
    return requireEndTurnBlockerType(
      notifications.getEndTurnBlockingType.call(notifications, localPlayerId)
    );
  });
  const blockingNotification: NarrativeChoiceSnapshot["blockingNotification"] = blocker.ok
    ? probe(() => readBlockingNotification(localPlayerId, blocker.value, target))
    : {
        ok: false,
        error: "Blocking notification is unavailable because the blocker read failed.",
      };
  return {
    localPlayerId,
    activateAction,
    canEndTurn,
    blocker,
    blockingNotification,
  };
}

function readBlockingNotification(
  localPlayerId: number,
  blockerType: string | number,
  target: Civ7GameUiNarrativeTarget
): BlockingNotification {
  const notifications = target.Game?.Notifications;
  if (notifications == null) {
    throw new Error("Game.Notifications is unavailable.");
  }
  const findBlocking = notifications.findEndTurnBlocking;
  if (typeof findBlocking !== "function") {
    throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
  }
  const rawId = findBlocking.call(notifications, localPlayerId, blockerType);
  if (rawId == null) return null as BlockingNotification;
  const id = toComponentId(rawId);
  if (id == null) {
    throw new Error("Game.Notifications.findEndTurnBlocking returned an invalid ComponentID.");
  }
  const notification =
    typeof notifications.find === "function"
      ? (notifications.find.call(notifications, rawId) ?? null)
      : null;
  const type = nullableNotificationType(
    typeof notifications.getType === "function"
      ? notifications.getType.call(notifications, rawId)
      : notificationValue(notification, ["Type", "type"])
  );
  const typeName =
    typeof notifications.getTypeName === "function"
      ? nullableString(notifications.getTypeName.call(notifications, type))
      : nullableString(notificationValue(notification, ["TypeName", "typeName"]));
  return {
    id,
    type,
    typeName,
    target: toComponentId(notificationValue(notification, ["Target", "target"])),
  } as BlockingNotification;
}

function narrativeChoiceGuardMatches(
  expected: NarrativeChoiceSnapshot,
  observed: NarrativeChoiceSnapshot
): boolean {
  return (
    expected != null &&
    expected.localPlayerId === observed.localPlayerId &&
    expected.activateAction === observed.activateAction &&
    sameRawEvidence(expected.blocker, observed.blocker) &&
    sameRawEvidence(expected.blockingNotification, observed.blockingNotification)
  );
}

function sameRawEvidence(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function requirePlayerOperations(target: Civ7GameUiNarrativeTarget): {
  canStart: (
    playerId: number,
    operationType: unknown,
    args: Readonly<{
      TargetType: string;
      Target: Civ7ControlOrpcComponentId;
      Action: number;
    }>,
    queue?: boolean
  ) => unknown;
  sendRequest: (
    playerId: number,
    operationType: unknown,
    args: Readonly<{
      TargetType: string;
      Target: Civ7ControlOrpcComponentId;
      Action: number;
    }>
  ) => unknown;
} {
  const operations = target.Game?.PlayerOperations;
  const canStart = operations?.canStart;
  if (typeof canStart !== "function") {
    throw new Error("Game.PlayerOperations.canStart is unavailable.");
  }
  const sendRequest = operations?.sendRequest;
  return {
    canStart: (playerId, operationType, args, queue) =>
      canStart.call(operations, playerId, operationType, args, queue),
    sendRequest: (playerId, operationType, args) => {
      if (typeof sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      return sendRequest.call(operations, playerId, operationType, args);
    },
  };
}

function requireNarrativeChoiceOperationType(target: Civ7GameUiNarrativeTarget): unknown {
  const operationType = target.PlayerOperationTypes?.CHOOSE_NARRATIVE_STORY_DIRECTION;
  if (operationType === undefined) {
    throw new Error("PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION is unavailable.");
  }
  return operationType;
}

function exactCanStartSuccess(result: unknown): boolean {
  if (result == null || typeof result !== "object" || Array.isArray(result)) {
    throw new Error(
      "Game.PlayerOperations.canStart returned unrecognized CHOOSE_NARRATIVE_STORY_DIRECTION evidence."
    );
  }
  const success = Reflect.get(result, "Success");
  if (typeof success !== "boolean") {
    throw new Error(
      "Game.PlayerOperations.canStart returned a non-boolean CHOOSE_NARRATIVE_STORY_DIRECTION Success field."
    );
  }
  return success;
}

function requireTargetType(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("targetType must be a nonempty string.");
  }
  return value;
}

function requireComponentId(value: unknown, label: string): Civ7ControlOrpcComponentId {
  if (toComponentId(value) == null) {
    throw new Error(`${label} must be a ComponentID.`);
  }
  return value as Civ7ControlOrpcComponentId;
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || (typeof value !== "object" && typeof value !== "function")) return null;
  const owner = valueFrom(value, ["owner", "Owner"]);
  const id = valueFrom(value, ["id", "ID"]);
  if (!isFiniteNumber(owner) || !isFiniteNumber(id)) return null;
  const type = valueFrom(value, ["type", "Type"]);
  return isFiniteNumber(type) ? { owner, id, type } : { owner, id };
}

function notificationValue(value: unknown, fields: readonly string[]): unknown {
  if (value == null || (typeof value !== "object" && typeof value !== "function")) {
    return null;
  }
  for (const field of fields) {
    try {
      if (field in value) {
        const fieldValue = Reflect.get(value, field);
        return typeof fieldValue === "function" ? Reflect.apply(fieldValue, value, []) : fieldValue;
      }
      const getter = Reflect.get(value, `get${field}`);
      if (typeof getter === "function") return Reflect.apply(getter, value, []);
    } catch {
      // Notification evidence is best-effort; try the next supported spelling.
    }
  }
  return null;
}

function valueFrom(value: object, fields: readonly string[]): unknown {
  for (const field of fields) {
    try {
      if (field in value) return Reflect.get(value, field);
    } catch {
      // ComponentID snapshotting supports native accessors with either spelling.
    }
  }
  return null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function nullableNotificationType(value: unknown): string | number | null {
  return typeof value === "string" || Number.isInteger(value) ? (value as string | number) : null;
}

function requireEndTurnBlockerType(value: unknown): string | number {
  if (value === 0) return 0;
  if (Number.isInteger(value)) return value as number;
  if (typeof value === "string" && value.trim().length > 0 && value.trim() !== "0") {
    return value;
  }
  throw new Error(
    "Game.Notifications.getEndTurnBlockingType returned an unsupported blocker identity."
  );
}

function requireInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value)) throw new Error(`${label} must be an integer.`);
  return value as number;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function snapshotJsonResult<T>(value: unknown, label: string): T {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error(`${label} returned non-JSON evidence.`);
  return JSON.parse(serialized) as T;
}

function narrativeChoiceDispatchError(
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
