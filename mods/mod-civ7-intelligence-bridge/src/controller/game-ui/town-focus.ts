import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcDirectControlFacade,
} from "../service-types";

type TownFocusChangeCheckInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7TownFocusChange"]
>[0];
type TownFocusChangeSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7TownFocusChange"]
>[0];
type TownFocusReviewCheckInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7TownFocusReview"]
>[0];
type TownFocusReviewSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7TownFocusReview"]
>[0];
type TownFocusChangeCheckResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["checkCiv7TownFocusChange"]>
>;
type TownFocusChangeSendResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["sendCiv7TownFocusChange"]>
>;
type TownFocusReviewCheckResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["checkCiv7TownFocusReview"]>
>;
type TownFocusReviewSendResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["sendCiv7TownFocusReview"]>
>;
type TownFocusSnapshot = TownFocusChangeCheckResult["snapshot"];
type TownFocusValidationResult = TownFocusChangeSendResult["validation"]["result"];
type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;

export type Civ7GameUiTownFocusTarget = Readonly<{
  CityCommandTypes?: {
    CHANGE_GROWTH_MODE?: unknown;
  };
  CityOperationTypes?: {
    CONSIDER_TOWN_PROJECT?: unknown;
  };
  Cities?: {
    get?: (id: Civ7ControlOrpcComponentId) => unknown;
  };
  Game?: {
    CityCommands?: {
      canStart?: (
        cityId: Civ7ControlOrpcComponentId,
        commandType: unknown,
        args: Readonly<Record<string, number>>,
        queue?: boolean
      ) => unknown;
      sendRequest?: (
        cityId: Civ7ControlOrpcComponentId,
        commandType: unknown,
        args: Readonly<Record<string, number>>
      ) => unknown;
    };
    CityOperations?: {
      sendRequest?: (
        cityId: Civ7ControlOrpcComponentId,
        operationType: unknown,
        args: Readonly<Record<string, number>>
      ) => unknown;
    };
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
  };
  GameContext?: {
    localPlayerID?: number;
  };
}>;

/** Reports whether the in-game controller can check town-focus changes. */
export function civ7GameUiTownFocusChangeCheckAvailable(
  target: Civ7GameUiTownFocusTarget
): boolean {
  return (
    typeof target.Game?.CityCommands?.canStart === "function" &&
    target.CityCommandTypes?.CHANGE_GROWTH_MODE !== undefined
  );
}

/** Reports whether the in-game controller can send town-focus changes. */
export function civ7GameUiTownFocusChangeSendAvailable(target: Civ7GameUiTownFocusTarget): boolean {
  return (
    civ7GameUiTownFocusChangeCheckAvailable(target) &&
    typeof target.Game?.CityCommands?.sendRequest === "function"
  );
}

/** Reports whether the in-game controller can read town-focus review state. */
export function civ7GameUiTownFocusReviewCheckAvailable(
  target: Civ7GameUiTownFocusTarget
): boolean {
  return (
    typeof target.Cities?.get === "function" &&
    typeof target.Game?.Notifications?.getEndTurnBlockingType === "function" &&
    typeof target.Game.Notifications.findEndTurnBlocking === "function" &&
    typeof target.Game.Notifications.find === "function"
  );
}

/** Reports whether the in-game controller can send town-focus review requests. */
export function civ7GameUiTownFocusReviewSendAvailable(target: Civ7GameUiTownFocusTarget): boolean {
  return (
    civ7GameUiTownFocusReviewCheckAvailable(target) &&
    typeof target.Game?.CityOperations?.sendRequest === "function" &&
    target.CityOperationTypes?.CONSIDER_TOWN_PROJECT !== undefined
  );
}

/** Checks native town-focus change admission and captures current runtime evidence. */
export async function checkCiv7GameUiTownFocusChange(
  input: TownFocusChangeCheckInput,
  target: Civ7GameUiTownFocusTarget = globalThis as Civ7GameUiTownFocusTarget
): Promise<TownFocusChangeCheckResult> {
  const normalized = normalizeChangeInput(input);
  const validation = checkTownFocusChange(normalized, target);
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot: readTownFocusSnapshot(normalized.cityId, target),
  };
}

/** Sends a town-focus change after a fresh native admission check. */
export async function sendCiv7GameUiTownFocusChange(
  input: TownFocusChangeSendInput,
  target: Civ7GameUiTownFocusTarget = globalThis as Civ7GameUiTownFocusTarget
): Promise<TownFocusChangeSendResult> {
  let sendInvoked = false;
  try {
    const normalized = normalizeChangeInput(input);
    const before = readTownFocusSnapshot(normalized.cityId, target);
    const validation = checkTownFocusChange(normalized, target);
    if (!validation.valid) {
      return {
        sent: false,
        validation: {
          valid: false,
          result: validation.result,
        },
        before,
        after: readTownFocusSnapshot(normalized.cityId, target),
      };
    }

    const commands = target.Game?.CityCommands;
    if (typeof commands?.sendRequest !== "function") {
      throw new Error("Game.CityCommands.sendRequest is unavailable.");
    }
    const commandType = target.CityCommandTypes?.CHANGE_GROWTH_MODE;
    if (commandType === undefined) {
      throw new Error("CityCommandTypes.CHANGE_GROWTH_MODE is unavailable.");
    }

    sendInvoked = true;
    commands.sendRequest(normalized.cityId, commandType, normalized.args);
    return {
      sent: true,
      validation: {
        valid: true,
        result: validation.result,
      },
      before,
      after: readTownFocusSnapshot(normalized.cityId, target),
    };
  } catch (cause) {
    throw townFocusDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

/** Reads the native state from which the service derives town-focus review eligibility. */
export async function checkCiv7GameUiTownFocusReview(
  input: TownFocusReviewCheckInput,
  target: Civ7GameUiTownFocusTarget = globalThis as Civ7GameUiTownFocusTarget
): Promise<TownFocusReviewCheckResult> {
  const cityId = requireComponentId(input.cityId);
  return {
    snapshot: readTownFocusSnapshot(cityId, target),
  };
}

/** Sends the native town-focus review request exactly once and snapshots surrounding state. */
export async function sendCiv7GameUiTownFocusReview(
  input: TownFocusReviewSendInput,
  target: Civ7GameUiTownFocusTarget = globalThis as Civ7GameUiTownFocusTarget
): Promise<TownFocusReviewSendResult> {
  let sendInvoked = false;
  try {
    const cityId = requireComponentId(input.cityId);
    const before = readTownFocusSnapshot(cityId, target);
    const operations = target.Game?.CityOperations;
    if (typeof operations?.sendRequest !== "function") {
      throw new Error("Game.CityOperations.sendRequest is unavailable.");
    }
    const operationType = target.CityOperationTypes?.CONSIDER_TOWN_PROJECT;
    if (operationType === undefined) {
      throw new Error("CityOperationTypes.CONSIDER_TOWN_PROJECT is unavailable.");
    }

    sendInvoked = true;
    operations.sendRequest(cityId, operationType, {});
    return {
      sent: true,
      before,
      after: readTownFocusSnapshot(cityId, target),
    };
  } catch (cause) {
    throw townFocusDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function checkTownFocusChange(
  input: Readonly<{
    cityId: Civ7ControlOrpcComponentId;
    args: Readonly<{ Type: number; ProjectType: number; City: number }>;
  }>,
  target: Civ7GameUiTownFocusTarget
): Readonly<{ valid: boolean; result: TownFocusValidationResult }> {
  const commands = target.Game?.CityCommands;
  if (typeof commands?.canStart !== "function") {
    throw new Error("Game.CityCommands.canStart is unavailable.");
  }
  const commandType = target.CityCommandTypes?.CHANGE_GROWTH_MODE;
  if (commandType === undefined) {
    throw new Error("CityCommandTypes.CHANGE_GROWTH_MODE is unavailable.");
  }

  const rawResult = commands.canStart(input.cityId, commandType, input.args, false);
  return {
    valid: successFromCanStart(rawResult),
    result: snapshotJsonResult(rawResult),
  };
}

function normalizeChangeInput(input: TownFocusChangeCheckInput): Readonly<{
  cityId: Civ7ControlOrpcComponentId;
  args: Readonly<{ Type: number; ProjectType: number; City: number }>;
}> {
  const cityId = requireComponentId(input.cityId);
  if (!Number.isInteger(input.growthType)) {
    throw new Error("Town focus growthType must be an integer.");
  }
  if (!Number.isInteger(input.projectType)) {
    throw new Error("Town focus projectType must be an integer.");
  }
  return {
    cityId,
    args: {
      Type: input.growthType,
      ProjectType: input.projectType,
      City: cityId.id,
    },
  };
}

function readTownFocusSnapshot(
  cityId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiTownFocusTarget
): TownFocusSnapshot {
  const localPlayerId = target.GameContext?.localPlayerID;
  const blocker = probe(() => {
    if (!isInteger(localPlayerId)) {
      throw new Error("GameContext.localPlayerID is unavailable.");
    }
    const readBlocker = target.Game?.Notifications?.getEndTurnBlockingType;
    if (typeof readBlocker !== "function") {
      throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
    }
    return toNotificationType(readBlocker(localPlayerId));
  });

  return {
    cityId,
    city: probe(() => summarizeCity(cityId, target)),
    blocker,
    blockingTownFocusNotification: probe(() =>
      readBlockingTownFocusNotification(localPlayerId, blocker, target)
    ),
  };
}

function summarizeCity(
  cityId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiTownFocusTarget
): TownFocusSnapshot["city"] extends RuntimeProbe<infer City> ? City : never {
  const readCity = target.Cities?.get;
  if (typeof readCity !== "function") throw new Error("Cities.get is unavailable.");
  const city = readCity(cityId);
  if (city == null) return null;
  if (!isObjectLike(city)) throw new Error("Cities.get returned an invalid city.");
  const observedCityId = toComponentId(valueFrom(city, ["id", "ID"]));
  const growth = valueFrom(city, ["Growth", "growth"]);
  return {
    observedCityId,
    owner: finiteNumber(valueFrom(city, ["owner", "Owner"]) ?? observedCityId?.owner),
    isTown: nullableBoolean(valueFrom(city, ["isTown", "IsTown"])),
    growthType: finiteNumber(valueFrom(growth, ["growthType", "GrowthType"])),
    projectType: finiteNumber(valueFrom(growth, ["projectType", "ProjectType"])),
  };
}

function readBlockingTownFocusNotification(
  localPlayerId: number | undefined,
  blocker: RuntimeProbe<number | string | null>,
  target: Civ7GameUiTownFocusTarget
): TownFocusSnapshot["blockingTownFocusNotification"] extends RuntimeProbe<infer Notification>
  ? Notification
  : never {
  if (!blocker.ok) throw new Error(blocker.error);
  if (!isInteger(localPlayerId)) {
    throw new Error("GameContext.localPlayerID is unavailable.");
  }
  const notifications = target.Game?.Notifications;
  if (typeof notifications?.findEndTurnBlocking !== "function") {
    throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
  }
  const rawNotificationId = notifications.findEndTurnBlocking(localPlayerId, blocker.value);
  if (rawNotificationId == null) return null;
  const id = toComponentId(rawNotificationId);
  if (id == null) {
    throw new Error("Game.Notifications.findEndTurnBlocking returned an invalid ComponentID.");
  }
  const notification =
    typeof notifications.find === "function" ? (notifications.find(id) ?? null) : null;
  const type = toNotificationType(
    typeof notifications.getType === "function"
      ? notifications.getType(id)
      : valueFrom(notification, ["Type", "type"])
  );
  const typeName = toNullableString(
    typeof notifications.getTypeName === "function"
      ? notifications.getTypeName(type)
      : valueFrom(notification, ["TypeName", "typeName"])
  );
  return {
    id,
    type,
    typeName,
    target: toComponentId(valueFrom(notification, ["Target", "target"])),
  };
}

function successFromCanStart(result: unknown): boolean {
  if (typeof result === "boolean") return result;
  if (result !== null && typeof result === "object" && !Array.isArray(result)) {
    if ("Success" in result) return booleanAdmission(result.Success, "Success");
    if ("success" in result) return booleanAdmission(result.success, "success");
    if ("canStart" in result) return booleanAdmission(result.canStart, "canStart");
  }
  throw new Error("Game.CityCommands.canStart returned an unrecognized result.");
}

function booleanAdmission(value: unknown, key: string): boolean {
  if (typeof value === "boolean") return value;
  throw new Error(`Game.CityCommands.canStart returned a non-boolean ${key} field.`);
}

function requireComponentId(value: unknown): Civ7ControlOrpcComponentId {
  const cityId = toComponentId(value);
  if (cityId == null) throw new Error("Town focus cityId must be a ComponentID.");
  return cityId;
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const owner = "owner" in value ? value.owner : "Owner" in value ? value.Owner : null;
  const id = "id" in value ? value.id : "ID" in value ? value.ID : null;
  if (!isFiniteNumber(owner) || !isFiniteNumber(id)) return null;
  const type = "type" in value ? value.type : "Type" in value ? value.Type : null;
  return isFiniteNumber(type) ? { owner, id, type } : { owner, id };
}

function valueFrom(value: unknown, names: readonly string[]): unknown {
  if (!isObjectLike(value)) return null;
  for (const name of names) {
    if (name in value) {
      const field = Reflect.get(value, name);
      return typeof field === "function" ? Reflect.apply(field, value, []) : field;
    }
    const getter = Reflect.get(value, `get${name}`);
    if (typeof getter === "function") return Reflect.apply(getter, value, []);
  }
  return null;
}

function isObjectLike(value: unknown): value is object {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function finiteNumber(value: unknown): number | null {
  return isFiniteNumber(value) ? value : null;
}

function nullableBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function toNotificationType(value: unknown): number | string | null {
  return typeof value === "string" || isInteger(value) ? value : null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function snapshotJsonResult(value: unknown): TownFocusValidationResult {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new Error("Game.CityCommands.canStart returned non-JSON evidence.");
  }
  return JSON.parse(serialized);
}

function townFocusDispatchError(
  cause: unknown,
  dispatchStatus: "not-dispatched" | "dispatched"
): Civ7DirectControlErrorShape {
  const message = cause instanceof Error ? cause.message : String(cause);
  const name: Civ7DirectControlErrorShape["name"] = "Civ7DirectControlError";
  const code: Civ7DirectControlErrorShape["code"] = "command-failed";
  const error = new Error(message, { cause });
  error.name = name;
  return Object.assign(error, {
    name,
    code,
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
