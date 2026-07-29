import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcProductionChoiceCheckResult,
  Civ7ControlOrpcProductionChoiceSendResult,
} from "../service-types";

type ProductionChoiceInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7ProductionChoice"]
>[0];
type ProductionChoiceSnapshot = Civ7ControlOrpcProductionChoiceCheckResult["snapshot"];
type ProductionChoiceValidationResult =
  Civ7ControlOrpcProductionChoiceSendResult["validation"]["result"];
type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;
type RawProductionChoiceValidation = Readonly<{
  valid: boolean;
  rawResult: unknown;
  result: ProductionChoiceValidationResult;
}>;

export type Civ7GameUiProductionTarget = Readonly<{
  CityOperationTypes?: {
    BUILD?: unknown;
  };
  CityOperationsParametersValues?: {
    Exclusive?: number;
  };
  Cities?: {
    get?: (id: Civ7ControlOrpcComponentId) => unknown;
  };
  Game?: {
    CityOperations?: {
      canStart?: (
        cityId: Civ7ControlOrpcComponentId,
        operationType: unknown,
        args: Readonly<Record<string, number>>,
        queue?: boolean
      ) => unknown;
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
  GameplayMap?: {
    getLocationFromIndex?: (index: number) => { x?: unknown; y?: unknown } | null;
  };
}>;

/** Reports whether the in-game controller can check production choices. */
export function civ7GameUiProductionChoiceCheckAvailable(
  target: Civ7GameUiProductionTarget
): boolean {
  return (
    typeof target.Game?.CityOperations?.canStart === "function" &&
    target.CityOperationTypes?.BUILD !== undefined
  );
}

/** Reports whether the in-game controller can send production choices. */
export function civ7GameUiProductionChoiceSendAvailable(
  target: Civ7GameUiProductionTarget
): boolean {
  return (
    civ7GameUiProductionChoiceCheckAvailable(target) &&
    typeof target.Game?.CityOperations?.sendRequest === "function"
  );
}

/** Checks production admission and captures the current raw game UI evidence. */
export async function checkCiv7GameUiProductionChoice(
  input: ProductionChoiceInput,
  target: Civ7GameUiProductionTarget = globalThis as Civ7GameUiProductionTarget
): Promise<Civ7ControlOrpcProductionChoiceCheckResult> {
  const cityId = requireComponentId(input.cityId);
  const args = normalizeProductionArgs(input.args);
  const validation = checkProductionChoice(cityId, args, target);
  const valid =
    validation.valid &&
    productionChoiceAdaptationAvailable(cityId, validation.rawResult, args, target);
  return {
    valid,
    result: validation.result,
    snapshot: readProductionSnapshot(cityId, args, target),
  };
}

/** Sends production only after a fresh game UI admission check and captures surrounding state. */
export async function sendCiv7GameUiProductionChoice(
  input: ProductionChoiceInput,
  target: Civ7GameUiProductionTarget = globalThis as Civ7GameUiProductionTarget
): Promise<Civ7ControlOrpcProductionChoiceSendResult> {
  let sendInvoked = false;
  try {
    const cityId = requireComponentId(input.cityId);
    const args = normalizeProductionArgs(input.args);
    const before = readProductionSnapshot(cityId, args, target);
    const validation = checkProductionChoice(cityId, args, target);
    if (!validation.valid) {
      return {
        sent: false,
        validation: {
          valid: false,
          result: validation.result,
        },
        before,
        after: readProductionSnapshot(cityId, args, target),
      };
    }

    const operations = target.Game?.CityOperations;
    if (typeof operations?.sendRequest !== "function") {
      throw new Error("Game.CityOperations.sendRequest is unavailable.");
    }
    if (target.CityOperationTypes?.BUILD === undefined) {
      throw new Error("CityOperationTypes.BUILD is unavailable.");
    }

    const sendArgs = productionSendArgs(cityId, validation.rawResult, args, target);
    sendInvoked = true;
    operations.sendRequest(cityId, target.CityOperationTypes.BUILD, sendArgs);

    return {
      sent: true,
      validation: {
        valid: true,
        result: validation.result,
      },
      before,
      after: readProductionSnapshot(cityId, sendArgs, target),
    };
  } catch (cause) {
    throw productionChoiceDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function checkProductionChoice(
  cityId: Civ7ControlOrpcComponentId,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiProductionTarget
): RawProductionChoiceValidation {
  const operations = target.Game?.CityOperations;
  if (typeof operations?.canStart !== "function") {
    throw new Error("Game.CityOperations.canStart is unavailable.");
  }
  if (target.CityOperationTypes?.BUILD === undefined) {
    throw new Error("CityOperationTypes.BUILD is unavailable.");
  }

  const rawResult = operations.canStart(cityId, target.CityOperationTypes.BUILD, args, false);
  return {
    valid: successFromCanStart(rawResult),
    rawResult,
    result: snapshotJsonResult(rawResult),
  };
}

function readProductionSnapshot(
  cityId: Civ7ControlOrpcComponentId,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiProductionTarget
): ProductionChoiceSnapshot {
  const localPlayerId = target.GameContext?.localPlayerID;
  const blocker = probe(() => {
    if (typeof localPlayerId !== "number" || !Number.isInteger(localPlayerId)) {
      throw new Error("GameContext.localPlayerID is unavailable.");
    }
    const readBlocker = target.Game?.Notifications?.getEndTurnBlockingType;
    if (typeof readBlocker !== "function") {
      throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
    }
    return toNotificationType(readBlocker(localPlayerId));
  });
  const blockingProductionNotification = probe(() => {
    if (!blocker.ok) throw new Error(blocker.error);
    if (typeof localPlayerId !== "number" || !Number.isInteger(localPlayerId)) {
      throw new Error("GameContext.localPlayerID is unavailable.");
    }
    const notifications = target.Game?.Notifications;
    if (typeof notifications?.findEndTurnBlocking !== "function") {
      throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
    }
    const rawNotificationId = notifications.findEndTurnBlocking(localPlayerId, blocker.value);
    if (rawNotificationId == null) return null;
    const notificationId = toComponentId(rawNotificationId);
    if (notificationId == null) {
      throw new Error("Game.Notifications.findEndTurnBlocking returned an invalid ComponentID.");
    }
    const notification =
      typeof notifications.find === "function"
        ? (notifications.find(notificationId) ?? null)
        : null;
    const type = toNotificationType(
      typeof notifications.getType === "function"
        ? notifications.getType(notificationId)
        : notificationValue(notification, ["Type", "type"])
    );
    const typeName = toNullableString(
      typeof notifications.getTypeName === "function"
        ? notifications.getTypeName(type)
        : notificationValue(notification, ["TypeName", "typeName"])
    );
    return {
      id: notificationId,
      type,
      typeName,
      target: toComponentId(notificationValue(notification, ["Target", "target"])),
    };
  });

  return {
    cityId,
    city: probe(() => summarizeCity(cityId, target)),
    buildQueue: probe(() => summarizeBuildQueue(cityId, args, target)),
    blocker,
    blockingProductionNotification,
  };
}

function normalizeProductionArgs(
  input: Readonly<Record<string, number>>
): Readonly<Record<string, number>> {
  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Production choice args must be an object.");
  }
  const itemKeys = ["UnitType", "ConstructibleType", "ProjectType"] as const;
  const presentItems = itemKeys.filter((key) => Object.prototype.hasOwnProperty.call(input, key));
  if (presentItems.length !== 1 || !Number.isInteger(input[presentItems[0]!])) {
    throw new Error(
      "Production choice requires exactly one UnitType, ConstructibleType, or ProjectType."
    );
  }
  const hasX = Object.prototype.hasOwnProperty.call(input, "X");
  const hasY = Object.prototype.hasOwnProperty.call(input, "Y");
  if (hasX !== hasY || (hasX && (!Number.isInteger(input.X) || !Number.isInteger(input.Y)))) {
    throw new Error("Production placement coordinates require integer X and Y.");
  }
  const allowed = new Set(["UnitType", "ConstructibleType", "ProjectType", "X", "Y"]);
  if (Object.keys(input).some((key) => !allowed.has(key))) {
    throw new Error("Production choice args contain an unsupported field.");
  }
  if (hasX && presentItems[0] !== "ConstructibleType") {
    throw new Error(
      "Production placement coordinates are only valid for ConstructibleType choices."
    );
  }
  return { ...input };
}

function productionSendArgs(
  cityId: Civ7ControlOrpcComponentId,
  canStartResult: unknown,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiProductionTarget
): Readonly<Record<string, number>> {
  const out: Record<string, number> = { ...args };
  if (Number.isInteger(out.ConstructibleType) && out.X == null && out.Y == null) {
    if (
      canStartResult == null ||
      typeof canStartResult !== "object" ||
      (canStartResult as Record<string, unknown>).InProgress !== true
    ) {
      throw new Error("Constructible production requires an InProgress validation plot.");
    }
    const plots = (canStartResult as Record<string, unknown>).Plots;
    if (!Array.isArray(plots) || plots.length === 0 || !Number.isInteger(plots[0])) {
      throw new Error("Constructible production requires an integer validation plot.");
    }
    if (typeof target.GameplayMap?.getLocationFromIndex !== "function") {
      throw new Error("GameplayMap.getLocationFromIndex is unavailable.");
    }
    const location = target.GameplayMap.getLocationFromIndex(plots[0] as number);
    const x = location?.x;
    const y = location?.y;
    if (!Number.isInteger(x) || !Number.isInteger(y)) {
      throw new Error("Constructible production validation plot has no integer coordinates.");
    }
    out.X = x as number;
    out.Y = y as number;
  }

  if (Number.isInteger(out.ProjectType)) {
    if (typeof target.Cities?.get !== "function") {
      throw new Error("Cities.get is unavailable for ProjectType production.");
    }
    const city = target.Cities.get(cityId);
    if (city == null || typeof city !== "object") {
      throw new Error("ProjectType production requires a known city or town state.");
    }
    const isTown = (city as Record<string, unknown>).isTown;
    if (typeof isTown !== "boolean") {
      throw new Error("ProjectType production requires a known city or town state.");
    }
    if (!isTown) return out;
    const exclusive = target.CityOperationsParametersValues?.Exclusive;
    if (typeof exclusive !== "number" || !Number.isInteger(exclusive)) {
      throw new Error("Town ProjectType production requires Exclusive insert mode.");
    }
    out.InsertMode = exclusive;
  }
  return out;
}

function productionChoiceAdaptationAvailable(
  cityId: Civ7ControlOrpcComponentId,
  rawResult: unknown,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiProductionTarget
): boolean {
  try {
    productionSendArgs(cityId, rawResult, args, target);
    return true;
  } catch {
    return false;
  }
}

function successFromCanStart(result: unknown): boolean {
  if (typeof result === "boolean") return result;
  if (result !== null && typeof result === "object" && !Array.isArray(result)) {
    const record = result as Record<string, unknown>;
    for (const key of ["Success", "success", "canStart"] as const) {
      if (key in record) {
        if (typeof record[key] === "boolean") return record[key];
        throw new Error(`Game.CityOperations.canStart returned a non-boolean ${key} field.`);
      }
    }
  }
  throw new Error("Game.CityOperations.canStart returned an unrecognized result.");
}

function requireComponentId(value: unknown): Civ7ControlOrpcComponentId {
  const cityId = toComponentId(value);
  if (cityId == null) throw new Error("Production choice cityId must be a ComponentID.");
  return cityId;
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const candidate = value as Partial<Civ7ControlOrpcComponentId>;
  if (typeof candidate.owner !== "number" || typeof candidate.id !== "number") {
    return null;
  }
  return typeof candidate.type === "number"
    ? { owner: candidate.owner, id: candidate.id, type: candidate.type }
    : { owner: candidate.owner, id: candidate.id };
}

function summarizeCity(
  cityId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiProductionTarget
): { id: Civ7ControlOrpcComponentId; observedCityId: Civ7ControlOrpcComponentId | null } | null {
  if (typeof target.Cities?.get !== "function") throw new Error("Cities.get is unavailable.");
  const city = target.Cities.get(cityId);
  if (city == null) return null;
  if (typeof city !== "object") throw new Error("Cities.get returned an invalid city.");
  const record = city as Record<string, unknown>;
  return {
    id: { ...cityId },
    observedCityId: toComponentId(record.id ?? record.ID),
  };
}

function summarizeBuildQueue(
  cityId: Civ7ControlOrpcComponentId,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiProductionTarget
): {
  currentProductionTypeHash: number | null;
  previousProductionTypeHash: number | null;
  productionProgress: number | null;
  turnsLeftForRequestedItem: number | null;
  queueLength: number | null;
} | null {
  if (typeof target.Cities?.get !== "function") throw new Error("Cities.get is unavailable.");
  const city = target.Cities.get(cityId);
  if (city == null) return null;
  if (typeof city !== "object") throw new Error("Cities.get returned an invalid city.");
  const cityRecord = city as Record<string, unknown>;
  const queue =
    cityRecord.BuildQueue ?? cityRecord.buildQueue ?? cityRecord.buildQueueManager ?? null;
  if (queue == null) return null;
  if (typeof queue !== "object") throw new Error("City build queue is invalid.");
  const record = queue as Record<string, unknown>;
  const current = readQueueNumber(record, "getCurrentProductionTypeHash", [
    "currentProductionTypeHash",
    "currentProductionType",
  ]);
  const previous = readQueueNumber(record, "getPreviousProductionTypeHash", [
    "previousProductionTypeHash",
    "previousProductionType",
  ]);
  const progress = readQueueNumber(record, "getProductionProgress", [
    "productionProgress",
    "progress",
  ]);
  const rawQueue =
    typeof record.getQueue === "function" ? (record.getQueue as () => unknown).call(queue) : null;
  const requestedType = args.UnitType ?? args.ConstructibleType ?? args.ProjectType;
  const turnsLeft =
    Number.isInteger(requestedType) && typeof record.getTurnsLeft === "function"
      ? (record.getTurnsLeft as (type: number) => unknown).call(queue, requestedType)
      : null;
  return {
    currentProductionTypeHash: current,
    previousProductionTypeHash: previous,
    productionProgress: progress,
    turnsLeftForRequestedItem:
      typeof turnsLeft === "number" && Number.isFinite(turnsLeft) ? turnsLeft : null,
    queueLength: Array.isArray(rawQueue) ? rawQueue.length : null,
  };
}

function readQueueNumber(
  queue: Record<string, unknown>,
  getter: string,
  fields: readonly string[]
): number | null {
  const raw =
    typeof queue[getter] === "function"
      ? (queue[getter] as () => unknown).call(queue)
      : fields.map((field) => queue[field]).find((value) => value !== undefined);
  return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

function notificationValue(notification: unknown, names: readonly string[]): unknown {
  if (notification == null || typeof notification !== "object") return null;
  const record = notification as Record<string, unknown>;
  for (const name of names) {
    if (name in record) {
      const value = record[name];
      return typeof value === "function" ? (value as () => unknown).call(notification) : value;
    }
    const getter = `get${name}`;
    if (typeof record[getter] === "function") {
      return (record[getter] as () => unknown).call(notification);
    }
  }
  return null;
}

function toNotificationType(value: unknown): number | string | null {
  return typeof value === "string" || Number.isInteger(value) ? (value as number | string) : null;
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function snapshotJsonResult(value: unknown): ProductionChoiceValidationResult {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new Error("Game.CityOperations.canStart returned non-JSON evidence.");
  }
  return JSON.parse(serialized) as ProductionChoiceValidationResult;
}

function productionChoiceDispatchError(
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
