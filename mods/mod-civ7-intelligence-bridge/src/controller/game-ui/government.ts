import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcDirectControlFacade,
} from "../service-types";

type GovernmentChoiceInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7GovernmentChoice"]
>[0];
type GovernmentChoiceSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7GovernmentChoice"]
>[0];
type GovernmentChoiceCheckResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["checkCiv7GovernmentChoice"]>
>;
type GovernmentChoiceSendResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["sendCiv7GovernmentChoice"]>
>;
type GovernmentChoiceSnapshot = GovernmentChoiceCheckResult["snapshot"];
type GovernmentChoiceValidationResult = GovernmentChoiceCheckResult["result"];
type GovernmentChoiceAvailableRow = GovernmentChoiceSnapshot["availableGovernments"][number];
type GovernmentChoiceSendValidation = GovernmentChoiceSendResult["validation"];

type CelebrationChoiceInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7CelebrationChoice"]
>[0];
type CelebrationChoiceSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7CelebrationChoice"]
>[0];
type CelebrationChoiceCheckResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["checkCiv7CelebrationChoice"]>
>;
type CelebrationChoiceSendResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["sendCiv7CelebrationChoice"]>
>;
type CelebrationChoiceSnapshot = CelebrationChoiceCheckResult["snapshot"];
type CelebrationChoiceValidationResult = CelebrationChoiceCheckResult["result"];
type CelebrationChoiceAvailableRow = CelebrationChoiceSnapshot["availableGoldenAges"][number];
type CelebrationChoiceSendValidation = CelebrationChoiceSendResult["validation"];

type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;
type BlockingNotification =
  GovernmentChoiceSnapshot["blockingNotification"] extends RuntimeProbe<infer Notification>
    ? Notification
    : never;

export type Civ7GameUiGovernmentTarget = Readonly<{
  Database?: {
    makeHash?: (value: string) => unknown;
  };
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
        args: Readonly<Record<string, number>>,
        queue?: boolean
      ) => unknown;
      sendRequest?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<Record<string, number>>
      ) => unknown;
    };
  };
  GameContext?: {
    localPlayerID?: number;
  };
  GameInfo?: {
    GoldenAges?: {
      lookup?: (type: string | number) => unknown;
    };
    Governments?: {
      lookup?: (type: string | number) => unknown;
    };
    StartingGovernments?: Iterable<unknown>;
  };
  PlayerOperationParameters?: {
    Activate?: unknown;
  };
  PlayerOperationTypes?: {
    CHANGE_GOVERNMENT?: unknown;
    CHOOSE_GOLDEN_AGE?: unknown;
  };
  Players?: {
    get?: (playerId: number) => unknown;
  };
}>;

/** Reports whether the game UI can check exact government-change admission. */
export function civ7GameUiGovernmentChoiceCheckAvailable(
  target: Civ7GameUiGovernmentTarget
): boolean {
  return (
    commonGovernmentReadAvailable(target) &&
    governmentCultureReadAvailable(target) &&
    typeof target.GameInfo?.StartingGovernments?.[Symbol.iterator] === "function" &&
    typeof target.GameInfo.Governments?.lookup === "function" &&
    Number.isInteger(target.PlayerOperationParameters?.Activate) &&
    target.PlayerOperationTypes?.CHANGE_GOVERNMENT !== undefined
  );
}

/** Reports whether the game UI can send an exact government change. */
export function civ7GameUiGovernmentChoiceSendAvailable(
  target: Civ7GameUiGovernmentTarget
): boolean {
  return (
    civ7GameUiGovernmentChoiceCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

/** Reports whether the game UI can check exact celebration-choice admission. */
export function civ7GameUiCelebrationChoiceCheckAvailable(
  target: Civ7GameUiGovernmentTarget
): boolean {
  return (
    commonGovernmentReadAvailable(target) &&
    celebrationPlayerReadAvailable(target) &&
    typeof target.Database?.makeHash === "function" &&
    typeof target.GameInfo?.GoldenAges?.lookup === "function" &&
    target.PlayerOperationTypes?.CHOOSE_GOLDEN_AGE !== undefined
  );
}

/** Reports whether the game UI can send an exact celebration choice. */
export function civ7GameUiCelebrationChoiceSendAvailable(
  target: Civ7GameUiGovernmentTarget
): boolean {
  return (
    civ7GameUiCelebrationChoiceCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

/** Checks CHANGE_GOVERNMENT for the ambient player and native Activate action. */
export async function checkCiv7GameUiGovernmentChoice(
  input: GovernmentChoiceInput,
  target: Civ7GameUiGovernmentTarget = globalThis as Civ7GameUiGovernmentTarget
): Promise<GovernmentChoiceCheckResult> {
  const governmentType = requireInteger(input.governmentType, "governmentType");
  const snapshot = readGovernmentChoiceSnapshot(target);
  const validation = checkGovernmentChoice(governmentType, snapshot, target);
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot,
  };
}

/** Sends CHANGE_GOVERNMENT once after a fresh exact native check. */
export async function sendCiv7GameUiGovernmentChoice(
  input: GovernmentChoiceSendInput,
  target: Civ7GameUiGovernmentTarget = globalThis as Civ7GameUiGovernmentTarget
): Promise<GovernmentChoiceSendResult> {
  let sendInvoked = false;
  try {
    const governmentType = requireInteger(input.governmentType, "governmentType");
    const before = readGovernmentChoiceSnapshot(target);
    if (!governmentChoiceGuardMatches(input.expected, before)) {
      throw new Error("Government choice admission evidence changed before dispatch.");
    }
    const validation = checkGovernmentChoice(governmentType, before, target);
    if (!validation.valid) {
      return {
        sent: false,
        validation,
        before,
        after: readGovernmentChoiceSnapshot(target),
      };
    }

    const operations = requirePlayerOperations(target);
    sendInvoked = true;
    operations.sendRequest(before.localPlayerId, requireGovernmentOperationType(target), {
      GovernmentType: governmentType,
      Action: before.activateAction,
    });
    return {
      sent: true,
      validation,
      before,
      after: readGovernmentChoiceSnapshot(target),
    };
  } catch (cause) {
    throw governmentDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

/** Checks CHOOSE_GOLDEN_AGE for the ambient local player. */
export async function checkCiv7GameUiCelebrationChoice(
  input: CelebrationChoiceInput,
  target: Civ7GameUiGovernmentTarget = globalThis as Civ7GameUiGovernmentTarget
): Promise<CelebrationChoiceCheckResult> {
  const goldenAgeType = requireInteger(input.goldenAgeType, "goldenAgeType");
  const snapshot = readCelebrationChoiceSnapshot(target);
  const validation = checkCelebrationChoice(goldenAgeType, snapshot, target);
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot,
  };
}

/** Sends CHOOSE_GOLDEN_AGE once after a fresh exact native check. */
export async function sendCiv7GameUiCelebrationChoice(
  input: CelebrationChoiceSendInput,
  target: Civ7GameUiGovernmentTarget = globalThis as Civ7GameUiGovernmentTarget
): Promise<CelebrationChoiceSendResult> {
  let sendInvoked = false;
  try {
    const goldenAgeType = requireInteger(input.goldenAgeType, "goldenAgeType");
    const before = readCelebrationChoiceSnapshot(target);
    if (!celebrationChoiceGuardMatches(input.expected, before)) {
      throw new Error("Celebration choice admission evidence changed before dispatch.");
    }
    const validation = checkCelebrationChoice(goldenAgeType, before, target);
    if (!validation.valid) {
      return {
        sent: false,
        validation,
        before,
        after: readCelebrationChoiceSnapshot(target),
      };
    }

    const operations = requirePlayerOperations(target);
    sendInvoked = true;
    operations.sendRequest(before.localPlayerId, requireCelebrationOperationType(target), {
      GoldenAgeType: goldenAgeType,
    });
    return {
      sent: true,
      validation,
      before,
      after: readCelebrationChoiceSnapshot(target),
    };
  } catch (cause) {
    throw governmentDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function commonGovernmentReadAvailable(target: Civ7GameUiGovernmentTarget): boolean {
  return (
    Number.isInteger(target.GameContext?.localPlayerID) &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    typeof target.Players?.get === "function" &&
    typeof target.Game?.Notifications?.getEndTurnBlockingType === "function" &&
    typeof target.Game.Notifications.findEndTurnBlocking === "function" &&
    typeof target.Game.Notifications.getType === "function" &&
    typeof target.Game.Notifications.getTypeName === "function"
  );
}

function governmentCultureReadAvailable(target: Civ7GameUiGovernmentTarget): boolean {
  const player = availableLocalPlayer(target);
  try {
    return hasMethod(player == null ? null : Reflect.get(player, "Culture"), "getGovernmentType");
  } catch {
    return false;
  }
}

function celebrationPlayerReadAvailable(target: Civ7GameUiGovernmentTarget): boolean {
  const player = availableLocalPlayer(target);
  try {
    const culture = player == null ? null : Reflect.get(player, "Culture");
    const happiness = player == null ? null : Reflect.get(player, "Happiness");
    return (
      hasMethod(culture, "getGovernmentType") &&
      hasMethod(culture, "getGoldenAgeChoices") &&
      hasMethod(happiness, "isInGoldenAge") &&
      hasMethod(happiness, "getCurrentGoldenAge") &&
      hasMethod(happiness, "getGoldenAgeTurnsLeft")
    );
  } catch {
    return false;
  }
}

function availableLocalPlayer(target: Civ7GameUiGovernmentTarget): Record<string, unknown> | null {
  const localPlayerId = target.GameContext?.localPlayerID;
  const get = target.Players?.get;
  if (!Number.isInteger(localPlayerId) || typeof get !== "function") return null;
  try {
    const player = get.call(target.Players, localPlayerId as number);
    return player != null && typeof player === "object" && !Array.isArray(player)
      ? (player as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function hasMethod(value: unknown, method: string): boolean {
  return (
    value != null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof Reflect.get(value, method) === "function"
  );
}

function checkGovernmentChoice(
  governmentType: number,
  snapshot: GovernmentChoiceSnapshot,
  target: Civ7GameUiGovernmentTarget
): GovernmentChoiceSendValidation {
  const rawResult = requireCanStart(target)(
    snapshot.localPlayerId,
    requireGovernmentOperationType(target),
    {
      GovernmentType: governmentType,
      Action: snapshot.activateAction,
    },
    false
  );
  const valid = exactCanStartSuccess(rawResult, "CHANGE_GOVERNMENT");
  const result = snapshotJsonResult<GovernmentChoiceValidationResult>(
    rawResult,
    "Game.PlayerOperations.canStart"
  );
  return valid ? { valid: true, result } : { valid: false, result };
}

function checkCelebrationChoice(
  goldenAgeType: number,
  snapshot: CelebrationChoiceSnapshot,
  target: Civ7GameUiGovernmentTarget
): CelebrationChoiceSendValidation {
  const rawResult = requireCanStart(target)(
    snapshot.localPlayerId,
    requireCelebrationOperationType(target),
    { GoldenAgeType: goldenAgeType },
    false
  );
  const valid = exactCanStartSuccess(rawResult, "CHOOSE_GOLDEN_AGE");
  const result = snapshotJsonResult<CelebrationChoiceValidationResult>(
    rawResult,
    "Game.PlayerOperations.canStart"
  );
  return valid ? { valid: true, result } : { valid: false, result };
}

function governmentChoiceGuardMatches(
  expected: GovernmentChoiceSnapshot,
  observed: GovernmentChoiceSnapshot
): boolean {
  return (
    expected != null &&
    expected.localPlayerId === observed.localPlayerId &&
    expected.currentGovernmentType === observed.currentGovernmentType &&
    expected.activateAction === observed.activateAction &&
    sameRawEvidence(expected.blocker, observed.blocker) &&
    sameRawEvidence(expected.blockingNotification, observed.blockingNotification)
  );
}

function celebrationChoiceGuardMatches(
  expected: CelebrationChoiceSnapshot,
  observed: CelebrationChoiceSnapshot
): boolean {
  return (
    expected != null &&
    expected.localPlayerId === observed.localPlayerId &&
    expected.isInGoldenAge === observed.isInGoldenAge &&
    expected.currentGoldenAgeType === observed.currentGoldenAgeType &&
    sameRawEvidence(expected.blocker, observed.blocker) &&
    sameRawEvidence(expected.blockingNotification, observed.blockingNotification)
  );
}

function sameRawEvidence(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function readGovernmentChoiceSnapshot(
  target: Civ7GameUiGovernmentTarget
): GovernmentChoiceSnapshot {
  const localPlayerId = requireLocalPlayerId(target);
  const culture = requirePlayerCulture(localPlayerId, target);
  return {
    localPlayerId,
    currentGovernmentType: nullableInteger(
      callRequired(culture, "getGovernmentType", "Players.get(localPlayerId).Culture")
    ),
    availableGovernments: readAvailableGovernments(target),
    activateAction: requireActivateAction(target),
    ...readBlockerSnapshot(localPlayerId, target),
  };
}

function readCelebrationChoiceSnapshot(
  target: Civ7GameUiGovernmentTarget
): CelebrationChoiceSnapshot {
  const localPlayerId = requireLocalPlayerId(target);
  const player = requireLocalPlayer(localPlayerId, target);
  const culture = requireObjectField(player, "Culture", "The local player's Culture");
  const happiness = requireObjectField(
    player,
    "Happiness",
    "The local player's golden-age observations"
  );
  return {
    localPlayerId,
    currentGovernmentType: nullableInteger(
      callRequired(culture, "getGovernmentType", "Players.get(localPlayerId).Culture")
    ),
    availableGoldenAges: readAvailableGoldenAges(culture, target),
    isInGoldenAge: requireBoolean(
      callRequired(happiness, "isInGoldenAge", "Players.get(localPlayerId).Happiness"),
      "Happiness.isInGoldenAge result"
    ),
    currentGoldenAgeType: readCurrentGoldenAgeType(happiness, target),
    goldenAgeTurnsLeft: nullableFiniteNumber(
      callRequired(happiness, "getGoldenAgeTurnsLeft", "Players.get(localPlayerId).Happiness")
    ),
    ...readBlockerSnapshot(localPlayerId, target),
  };
}

function readAvailableGovernments(
  target: Civ7GameUiGovernmentTarget
): GovernmentChoiceAvailableRow[] {
  const startingGovernments = target.GameInfo?.StartingGovernments;
  const lookup = target.GameInfo?.Governments?.lookup;
  if (startingGovernments == null || typeof startingGovernments[Symbol.iterator] !== "function") {
    throw new Error("GameInfo.StartingGovernments is unavailable.");
  }
  if (typeof lookup !== "function") {
    throw new Error("GameInfo.Governments.lookup is unavailable.");
  }

  const rows: GovernmentChoiceAvailableRow[] = [];
  for (const startingDefinition of startingGovernments) {
    const starting = requireRecord(startingDefinition, "Starting government definition");
    const sourceType = requireIdentifier(
      valueFrom(starting, ["GovernmentType"]),
      "Starting government GovernmentType"
    );
    const government = requireRecord(
      lookup.call(target.GameInfo?.Governments, sourceType),
      "Government definition"
    );
    rows.push({
      governmentType: requireInteger(
        valueFrom(government, ["$index"]),
        "Government definition $index"
      ),
      governmentTypeName: requireString(
        valueFrom(government, ["GovernmentType"]),
        "Government definition GovernmentType"
      ),
    });
  }
  return rows;
}

function readAvailableGoldenAges(
  culture: Record<string, unknown>,
  target: Civ7GameUiGovernmentTarget
): CelebrationChoiceAvailableRow[] {
  const choices = callRequired(
    culture,
    "getGoldenAgeChoices",
    "Players.get(localPlayerId).Culture"
  );
  if (!isIterable(choices)) {
    throw new Error(
      "Players.get(localPlayerId).Culture.getGoldenAgeChoices returned a non-iterable value."
    );
  }
  const lookup = target.GameInfo?.GoldenAges?.lookup;
  const makeHash = target.Database?.makeHash;
  if (typeof lookup !== "function") {
    throw new Error("GameInfo.GoldenAges.lookup is unavailable.");
  }
  if (typeof makeHash !== "function") {
    throw new Error("Database.makeHash is unavailable.");
  }

  const rows: CelebrationChoiceAvailableRow[] = [];
  for (const sourceChoice of choices) {
    const normalizedChoice = requireInteger(sourceChoice, "Golden age source choice");
    const definition = requireRecord(
      lookup.call(target.GameInfo?.GoldenAges, normalizedChoice),
      "Golden age definition"
    );
    const goldenAgeTypeName = requireString(
      valueFrom(definition, ["GoldenAgeType"]),
      "Golden age definition GoldenAgeType"
    );
    rows.push({
      sourceChoice: normalizedChoice,
      goldenAgeType: requireInteger(
        makeHash.call(target.Database, goldenAgeTypeName),
        "Database.makeHash result"
      ),
      goldenAgeTypeName,
    });
  }
  return rows;
}

function readCurrentGoldenAgeType(
  happiness: Record<string, unknown>,
  target: Civ7GameUiGovernmentTarget
): number | null {
  const sourceChoice = nullableInteger(
    callRequired(happiness, "getCurrentGoldenAge", "Players.get(localPlayerId).Happiness")
  );
  if (sourceChoice == null) return null;

  const lookup = target.GameInfo?.GoldenAges?.lookup;
  const makeHash = target.Database?.makeHash;
  if (typeof lookup !== "function") {
    throw new Error("GameInfo.GoldenAges.lookup is unavailable.");
  }
  if (typeof makeHash !== "function") {
    throw new Error("Database.makeHash is unavailable.");
  }
  const definition = requireRecord(
    lookup.call(target.GameInfo?.GoldenAges, sourceChoice),
    "Current golden age definition"
  );
  const typeName = requireString(
    valueFrom(definition, ["GoldenAgeType"]),
    "Current golden age definition GoldenAgeType"
  );
  return requireInteger(
    makeHash.call(target.Database, typeName),
    "Database.makeHash current GoldenAgeType result"
  );
}

function readBlockerSnapshot(
  localPlayerId: number,
  target: Civ7GameUiGovernmentTarget
): Pick<GovernmentChoiceSnapshot, "blocker" | "blockingNotification"> {
  const blocker = probe(() => {
    const read = target.Game?.Notifications?.getEndTurnBlockingType;
    if (typeof read !== "function") {
      throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
    }
    return nullableNotificationType(read.call(target.Game?.Notifications, localPlayerId));
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
    blockingNotification: probe(() =>
      readBlockingNotification(localPlayerId, blocker.value, target)
    ),
  };
}

function readBlockingNotification(
  localPlayerId: number,
  blockerType: string | number | null,
  target: Civ7GameUiGovernmentTarget
): BlockingNotification {
  const notifications = target.Game?.Notifications;
  if (notifications == null) {
    throw new Error("Game.Notifications is unavailable.");
  }
  const findBlocking = notifications?.findEndTurnBlocking;
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

function requireLocalPlayerId(target: Civ7GameUiGovernmentTarget): number {
  return requireInteger(target.GameContext?.localPlayerID, "GameContext.localPlayerID");
}

function requireLocalPlayer(
  localPlayerId: number,
  target: Civ7GameUiGovernmentTarget
): Record<string, unknown> {
  const get = target.Players?.get;
  if (typeof get !== "function") throw new Error("Players.get is unavailable.");
  return requireRecord(get.call(target.Players, localPlayerId), "The local player");
}

function requirePlayerCulture(
  localPlayerId: number,
  target: Civ7GameUiGovernmentTarget
): Record<string, unknown> {
  return requireObjectField(
    requireLocalPlayer(localPlayerId, target),
    "Culture",
    "The local player's Culture"
  );
}

function requireActivateAction(target: Civ7GameUiGovernmentTarget): number {
  return requireInteger(
    target.PlayerOperationParameters?.Activate,
    "PlayerOperationParameters.Activate"
  );
}

function requireGovernmentOperationType(target: Civ7GameUiGovernmentTarget): unknown {
  const operationType = target.PlayerOperationTypes?.CHANGE_GOVERNMENT;
  if (operationType === undefined) {
    throw new Error("PlayerOperationTypes.CHANGE_GOVERNMENT is unavailable.");
  }
  return operationType;
}

function requireCelebrationOperationType(target: Civ7GameUiGovernmentTarget): unknown {
  const operationType = target.PlayerOperationTypes?.CHOOSE_GOLDEN_AGE;
  if (operationType === undefined) {
    throw new Error("PlayerOperationTypes.CHOOSE_GOLDEN_AGE is unavailable.");
  }
  return operationType;
}

function requireCanStart(
  target: Civ7GameUiGovernmentTarget
): (
  playerId: number,
  operationType: unknown,
  args: Readonly<Record<string, number>>,
  queue?: boolean
) => unknown {
  const operations = target.Game?.PlayerOperations;
  const canStart = operations?.canStart;
  if (typeof canStart !== "function") {
    throw new Error("Game.PlayerOperations.canStart is unavailable.");
  }
  return (playerId, operationType, args, queue) =>
    canStart.call(operations, playerId, operationType, args, queue);
}

function requirePlayerOperations(target: Civ7GameUiGovernmentTarget): {
  sendRequest: (
    playerId: number,
    operationType: unknown,
    args: Readonly<Record<string, number>>
  ) => unknown;
} {
  const operations = target.Game?.PlayerOperations;
  const sendRequest = operations?.sendRequest;
  if (typeof sendRequest !== "function") {
    throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
  }
  return {
    sendRequest: (playerId, operationType, args) =>
      sendRequest.call(operations, playerId, operationType, args),
  };
}

function exactCanStartSuccess(result: unknown, operationType: string): boolean {
  if (result == null || typeof result !== "object" || Array.isArray(result)) {
    throw new Error(
      `Game.PlayerOperations.canStart returned unrecognized ${operationType} evidence.`
    );
  }
  const success = Reflect.get(result, "Success");
  if (typeof success !== "boolean") {
    throw new Error(
      `Game.PlayerOperations.canStart returned a non-boolean ${operationType} Success field.`
    );
  }
  return success;
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} is unavailable.`);
  }
  return value as Record<string, unknown>;
}

function requireObjectField(
  record: Record<string, unknown>,
  field: string,
  label: string
): Record<string, unknown> {
  return requireRecord(Reflect.get(record, field), label);
}

function callRequired(record: Record<string, unknown>, method: string, label: string): unknown {
  const fn = Reflect.get(record, method);
  if (typeof fn !== "function") throw new Error(`${label}.${method} is unavailable.`);
  return Reflect.apply(fn, record, []);
}

function valueFrom(value: unknown, fields: readonly string[]): unknown {
  if (value == null || typeof value !== "object") return null;
  for (const field of fields) {
    if (field in value) return Reflect.get(value, field);
  }
  return null;
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

function requireIdentifier(value: unknown, label: string): string | number {
  if (typeof value === "string" || (typeof value === "number" && Number.isFinite(value))) {
    return value;
  }
  throw new Error(`${label} must be a string or finite number.`);
}

function requireInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value)) throw new Error(`${label} must be an integer.`);
  return value as number;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string") throw new Error(`${label} must be a string.`);
  return value;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function nullableNotificationType(value: unknown): string | number | null {
  return typeof value === "string" || Number.isInteger(value) ? (value as string | number) : null;
}

function nullableInteger(value: unknown): number | null {
  if (value == null) return null;
  return requireInteger(value, "Runtime integer observation");
}

function requireBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") throw new Error(`${label} must be a boolean.`);
  return value;
}

function nullableFiniteNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Runtime numeric observation must be a finite number.");
  }
  return value;
}

function isIterable(value: unknown): value is Iterable<unknown> {
  return (
    value != null &&
    (typeof value === "object" || typeof value === "function") &&
    typeof Reflect.get(value, Symbol.iterator) === "function"
  );
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const owner = valueFrom(value, ["owner", "Owner"]);
  const id = valueFrom(value, ["id", "ID"]);
  if (!isFiniteNumber(owner) || !isFiniteNumber(id)) return null;
  const type = valueFrom(value, ["type", "Type"]);
  return isFiniteNumber(type) ? { owner, id, type } : { owner, id };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function snapshotJsonResult<T>(value: unknown, label: string): T {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error(`${label} returned non-JSON evidence.`);
  return JSON.parse(serialized) as T;
}

function governmentDispatchError(
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
