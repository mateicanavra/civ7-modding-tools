import type { Civ7ControlOrpcProductionChoiceResult } from "./dependencies/direct-control";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;
type ProductionPostcondition = NonNullable<
  Civ7ControlOrpcProductionChoiceResult["productionPostcondition"]
>;
type ProductionSnapshot = NonNullable<ProductionPostcondition["before"]>;

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
        queue?: boolean,
      ) => unknown;
      sendRequest?: (
        cityId: Civ7ControlOrpcComponentId,
        operationType: unknown,
        args: Readonly<Record<string, number>>,
      ) => unknown;
    };
    Notifications?: {
      getEndTurnBlockingType?: (playerId: number) => unknown;
      findEndTurnBlocking?: (
        playerId: number,
        blockerType: unknown,
      ) => Civ7ControlOrpcComponentId | null;
      find?: (id: Civ7ControlOrpcComponentId) => unknown;
    };
  };
  GameContext?: {
    localPlayerID?: number;
  };
  GameplayMap?: {
    getLocationFromIndex?: (index: number) => { x?: unknown; y?: unknown } | null;
  };
  InterfaceMode?: {
    switchToDefault?: () => unknown;
    getCurrentMode?: () => unknown;
  };
  PlotCursor?: {
    plotCursorCoords?: unknown;
  };
  UI?: {
    Player?: {
      getHeadSelectedCity?: () => unknown;
      deselectAllCities?: () => unknown;
    };
  };
  canEndTurn?: () => unknown;
}>;

export function civ7GameUiProductionChoiceAvailable(
  target: Civ7GameUiProductionTarget,
): boolean {
  return typeof target.Game?.CityOperations?.canStart === "function"
    && typeof target.Game.CityOperations.sendRequest === "function"
    && target.CityOperationTypes?.BUILD !== undefined
    && typeof target.Game?.Notifications?.getEndTurnBlockingType === "function"
    && typeof target.Game.Notifications.findEndTurnBlocking === "function"
    && typeof target.Game.Notifications.find === "function";
}

export async function requestCiv7GameUiProductionChoice(
  input: Readonly<{
    cityId: Civ7ControlOrpcComponentId;
    args: Readonly<Record<string, number>>;
  }>,
  target: Civ7GameUiProductionTarget = globalThis as Civ7GameUiProductionTarget,
): Promise<Civ7ControlOrpcProductionChoiceResult> {
  const cityId = toComponentId(input.cityId);
  if (cityId == null) {
    throw new Error("Production choice cityId must be a ComponentID.");
  }
  const args = normalizeProductionArgs(input.args);
  const operationInput = {
    cityId,
    operationType: "BUILD" as const,
    args,
  };
  const beforeSnapshot = gameUiProductionSnapshot(cityId, target);
  const before = gameUiProductionValidation(cityId, args, target);

  if (!before.valid) {
    const productionPostcondition = gameUiProductionPostcondition({
      sent: false,
      before,
      after: before,
      beforeSnapshot,
      afterSnapshot: beforeSnapshot,
    });
    return {
      before,
      after: before,
      sent: false,
      verified: false,
      productionPostcondition,
      payload: {
        cityId,
        args,
        beforeValidation: before.result,
        afterValidation: before.result,
        sent: false,
        beforeProductionPostcondition: beforeSnapshot,
        afterProductionPostcondition: beforeSnapshot,
        notes: [
          "Game UI production choice was blocked by the official CityOperations canStart result before send.",
        ],
      },
    };
  }

  const sendArgs = productionSendArgs(cityId, before.result, args, target);
  const sendResult = probe(() =>
    target.Game?.CityOperations?.sendRequest?.(
      cityId,
      target.CityOperationTypes?.BUILD,
      sendArgs,
    )
  );
  const sent = sendResult.ok && sendResult.value !== false;
  if (sent) {
    closeGameUiProductionSurface(target);
  }
  const after = gameUiProductionValidation(cityId, sendArgs, target);
  const afterSnapshot = gameUiProductionSnapshot(cityId, target);
  const productionPostcondition = gameUiProductionPostcondition({
    sent,
    before,
    after,
    beforeSnapshot,
    afterSnapshot,
  });

  return {
    before,
    after,
    sent,
    verified: productionPostcondition.classification === "production-choice-cleared"
      || productionPostcondition.classification === "production-state-changed",
    productionPostcondition,
    payload: {
      cityId,
      args: sendArgs,
      beforeValidation: before.result,
      afterValidation: after.result,
      sent,
      sendResult,
      beforeProductionPostcondition: beforeSnapshot,
      afterProductionPostcondition: afterSnapshot,
      notes: [
        "Game UI production choice used ambient CityOperations canStart/sendRequest evidence inside the controller context.",
      ],
    },
  };
}

function gameUiProductionValidation(
  cityId: Civ7ControlOrpcComponentId,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiProductionTarget,
): Civ7ControlOrpcProductionChoiceResult["before"] {
  const result = safeValue(
    () =>
      target.Game?.CityOperations?.canStart?.(
        cityId,
        target.CityOperationTypes?.BUILD,
        args,
        false,
      ),
    null,
  );
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "city-operation",
    operationType: "BUILD",
    enumValue: target.CityOperationTypes?.BUILD,
    target: { cityId },
    args,
    valid: successFromCanStart(result),
    result,
  };
}

function gameUiProductionSnapshot(
  cityId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiProductionTarget,
): ProductionSnapshot {
  const localPlayerId = target.GameContext?.localPlayerID ?? -1;
  const blocker = probe(() =>
    target.Game?.Notifications?.getEndTurnBlockingType?.(localPlayerId) ?? null
  );
  const blockingNotification = probe(() => {
    const blockerValue = blocker.ok ? blocker.value : null;
    const notificationId = target.Game?.Notifications?.findEndTurnBlocking?.(
      localPlayerId,
      blockerValue,
    ) ?? null;
    const notification = notificationId == null
      ? null
      : target.Game?.Notifications?.find?.(notificationId) ?? null;
    return {
      notificationId,
      matchesCity: notificationMatchesCity(notification, cityId),
    };
  });

  return {
    cityId,
    city: probe(() => target.Cities?.get?.(cityId) ?? null),
    buildQueue: probe(() => cityBuildQueue(target.Cities?.get?.(cityId))),
    selectedCityId: probe(() =>
      toComponentId(target.UI?.Player?.getHeadSelectedCity?.())
    ),
    blocker,
    canEndTurn: probe(() => target.canEndTurn?.() ?? false),
    blockingProductionNotification: blockingNotification,
  };
}

function gameUiProductionPostcondition(
  input: Readonly<{
    sent: boolean;
    before: Civ7ControlOrpcProductionChoiceResult["before"];
    after: Civ7ControlOrpcProductionChoiceResult["after"];
    beforeSnapshot: ProductionSnapshot;
    afterSnapshot: ProductionSnapshot;
  }>,
): ProductionPostcondition {
  const productionStateChanged = snapshotChanged(
    input.beforeSnapshot,
    input.afterSnapshot,
  );
  const blockerStillLive = !productionBlockerCleared(
    input.beforeSnapshot,
    input.afterSnapshot,
  );
  const classification = classifyProductionPostcondition({
    sent: input.sent,
    before: input.before,
    after: input.after,
    productionStateChanged,
    blockerStillLive,
  });
  return {
    family: "city-operation",
    operationType: "BUILD",
    classification,
    before: input.beforeSnapshot,
    after: input.afterSnapshot,
    productionStateChanged,
    blockerStillLive,
    reason: productionPostconditionReason(classification),
  };
}

function normalizeProductionArgs(
  input: Readonly<Record<string, number>>,
): Readonly<Record<string, number>> {
  const selected = ["UnitType", "ConstructibleType", "ProjectType"].filter(
    (key) => Number.isInteger(input[key]),
  );
  if (selected.length !== 1) {
    throw new Error(
      "Production choice requires exactly one UnitType, ConstructibleType, or ProjectType.",
    );
  }
  if (
    (input.X !== undefined || input.Y !== undefined)
    && (!Number.isInteger(input.X) || !Number.isInteger(input.Y))
  ) {
    throw new Error("Production placement coordinates require integer X and Y.");
  }
  if ((input.X !== undefined || input.Y !== undefined) && selected[0] !== "ConstructibleType") {
    throw new Error(
      "Production placement coordinates are only valid for ConstructibleType choices.",
    );
  }
  return { ...input };
}

function productionSendArgs(
  cityId: Civ7ControlOrpcComponentId,
  canStartResult: unknown,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiProductionTarget,
): Readonly<Record<string, number>> {
  const out: Record<string, number> = { ...args };
  if (
    canStartResult != null
    && typeof canStartResult === "object"
    && Boolean((canStartResult as Record<string, unknown>).InProgress)
    && Array.isArray((canStartResult as Record<string, unknown>).Plots)
    && out.X == null
    && out.Y == null
  ) {
    const plot = ((canStartResult as Record<string, unknown>).Plots as unknown[])[0];
    if (typeof plot === "number") {
      const location = target.GameplayMap?.getLocationFromIndex?.(plot);
      const x = location?.x;
      const y = location?.y;
      if (Number.isInteger(x) && Number.isInteger(y)) {
        out.X = x as number;
        out.Y = y as number;
      }
    }
  }

  const city = target.Cities?.get?.(cityId) as Record<string, unknown> | null;
  if (
    Number.isInteger(out.ProjectType)
    && city?.isTown === true
    && target.CityOperationsParametersValues?.Exclusive !== undefined
  ) {
    out.InsertMode = target.CityOperationsParametersValues.Exclusive;
  }
  return out;
}

function closeGameUiProductionSurface(target: Civ7GameUiProductionTarget): void {
  target.UI?.Player?.deselectAllCities?.();
  target.InterfaceMode?.switchToDefault?.();
}

function classifyProductionPostcondition(input: Readonly<{
  sent: boolean;
  before: Civ7ControlOrpcProductionChoiceResult["before"];
  after: Civ7ControlOrpcProductionChoiceResult["after"];
  productionStateChanged: boolean;
  blockerStillLive: boolean;
}>): NonNullable<
  Civ7ControlOrpcProductionChoiceResult["productionPostcondition"]
>["classification"] {
  if (!input.sent) return "not-sent";
  if (input.productionStateChanged && input.blockerStillLive) {
    return "production-state-changed-blocker-still-live";
  }
  if (!input.blockerStillLive) return "production-choice-cleared";
  if (input.productionStateChanged) return "production-state-changed";
  if (
    input.before.valid !== input.after.valid
    || stableJson(input.before.result) !== stableJson(input.after.result)
  ) {
    return "validation-changed";
  }
  return "no-state-change";
}

function productionPostconditionReason(
  classification: NonNullable<
    Civ7ControlOrpcProductionChoiceResult["productionPostcondition"]
  >["classification"],
): string {
  switch (classification) {
    case "not-sent":
      return "The production request was not sent, so no production postcondition can be verified.";
    case "production-choice-cleared":
      return "The sent BUILD request no longer has a matching end-turn-blocking production-choice notification for the city.";
    case "production-state-changed":
      return "The sent BUILD request changed observed city production state.";
    case "production-state-changed-blocker-still-live":
      return "The sent BUILD request changed observed production state, but the matching production-choice notification still blocks turn flow; use notification/chooser closeout diagnostics rather than repeating BUILD blindly.";
    case "validation-changed":
      return "The sent BUILD request changed the subsequent BUILD validation result.";
    case "no-state-change":
      return "The sent BUILD request returned, but observed city production state and the production-choice blocker did not change.";
  }
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

function snapshotChanged(
  before: ProductionSnapshot,
  after: ProductionSnapshot,
): boolean {
  return stableJson(probeValue(before?.city)) !== stableJson(probeValue(after?.city))
    || stableJson(probeValue(before?.buildQueue)) !== stableJson(probeValue(after?.buildQueue));
}

function productionBlockerCleared(
  before: ProductionSnapshot,
  after: ProductionSnapshot,
): boolean {
  const beforeValue = probeValue(before.blockingProductionNotification);
  const afterValue = probeValue(after.blockingProductionNotification);
  if (!blockingNotificationMatchesCity(beforeValue)) return false;
  if (afterValue == null || typeof afterValue !== "object") return false;
  const afterRecord = afterValue as Record<string, unknown>;
  return afterRecord.notificationId == null || afterRecord.matchesCity === false;
}

function blockingNotificationMatchesCity(value: unknown): boolean {
  if (value == null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.notificationId != null && record.matchesCity === true;
}

function notificationMatchesCity(
  notification: unknown,
  cityId: Civ7ControlOrpcComponentId,
): boolean {
  if (notification == null || typeof notification !== "object") return false;
  const record = notification as Record<string, unknown>;
  for (const key of ["Target", "target", "City", "city", "CityID", "cityId"]) {
    const value = typeof record[key] === "function"
      ? (record[key] as () => unknown).call(notification)
      : record[key];
    if (componentIdEqual(toComponentId(value), cityId)) return true;
  }
  return false;
}

function cityBuildQueue(city: unknown): unknown {
  if (city == null || typeof city !== "object") return null;
  const record = city as Record<string, unknown>;
  return record.BuildQueue ?? record.buildQueue ?? record.buildQueueManager ?? null;
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

function componentIdEqual(
  left: Civ7ControlOrpcComponentId | null,
  right: Civ7ControlOrpcComponentId,
): boolean {
  return left?.owner === right.owner
    && left.id === right.id
    && (left.type ?? null) === (right.type ?? null);
}

function safeValue<T>(fn: () => T | undefined, fallback: T): T {
  try {
    return fn() ?? fallback;
  } catch {
    return fallback;
  }
}

function probe<T>(fn: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function probeValue<T>(probe: RuntimeProbe<T> | undefined): T | undefined {
  return probe?.ok ? probe.value : undefined;
}

function stableJson(value: unknown): string {
  if (value == null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) =>
    `${JSON.stringify(key)}:${stableJson(record[key])}`
  ).join(",")}}`;
}
