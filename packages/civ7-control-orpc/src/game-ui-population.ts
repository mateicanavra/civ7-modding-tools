import type { Civ7ControlOrpcDirectControlFacade } from "./dependencies/direct-control";
import type { Civ7ControlOrpcComponentId, Civ7ControlOrpcMapLocation } from "./model/primitives";

type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;
type PopulationPlacementResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["requestCiv7AssignWorkerPlacement"]>
>;
type PopulationPostcondition = NonNullable<PopulationPlacementResult["populationPostcondition"]>;
type PopulationSnapshot = NonNullable<PopulationPostcondition["before"]>;
type PopulationValidation = Readonly<{
  host: "game-ui";
  port: 0;
  state: Readonly<{ id: "game-ui"; name: "Game UI" }>;
  family: "player-operation" | "city-command";
  operationType: "ASSIGN_WORKER" | "EXPAND";
  enumValue: unknown;
  target: Readonly<{ playerId: number } | { cityId: Civ7ControlOrpcComponentId }>;
  args: Readonly<Record<string, number>>;
  valid: boolean;
  result: unknown;
}>;

export type Civ7GameUiPopulationTarget = Readonly<{
  CityCommandTypes?: {
    EXPAND?: unknown;
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
  PlayerOperationTypes?: {
    ASSIGN_WORKER?: unknown;
  };
  Players?: {
    get?: (playerId: number) => unknown;
  };
}>;

export function civ7GameUiPopulationPlacementAvailable(
  target: Civ7GameUiPopulationTarget
): boolean {
  return (
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    typeof target.Game.PlayerOperations.sendRequest === "function" &&
    target.PlayerOperationTypes?.ASSIGN_WORKER !== undefined &&
    typeof target.Game?.CityCommands?.canStart === "function" &&
    typeof target.Game.CityCommands.sendRequest === "function" &&
    target.CityCommandTypes?.EXPAND !== undefined &&
    typeof target.Players?.get === "function" &&
    typeof target.Cities?.get === "function"
  );
}

export async function requestCiv7GameUiAssignWorkerPlacement(
  input: Readonly<{
    playerId: number;
    location: number;
  }>,
  target: Civ7GameUiPopulationTarget = globalThis as Civ7GameUiPopulationTarget
): Promise<PopulationPlacementResult> {
  const args = {
    Location: input.location,
    Amount: 1,
  };
  const beforeCityId = readyPopulationCityId(target);
  const beforeSnapshot =
    beforeCityId == null ? undefined : gameUiPopulationSnapshot(beforeCityId, target);
  const localPlayerId = target.GameContext?.localPlayerID;
  const before =
    input.playerId === localPlayerId
      ? gameUiPlayerOperationValidation(
          input.playerId,
          "ASSIGN_WORKER",
          target.PlayerOperationTypes?.ASSIGN_WORKER,
          args,
          target
        )
      : gameUiPlayerOperationLocalPlayerMismatch(input.playerId, localPlayerId, args);

  if (!before.valid) {
    return populationPlacementResult({
      family: "player-operation",
      operationType: "ASSIGN_WORKER",
      enumValue: target.PlayerOperationTypes?.ASSIGN_WORKER,
      target: { playerId: input.playerId },
      args,
      before,
      after: before,
      sent: false,
      beforeSnapshot,
      afterSnapshot: beforeSnapshot,
      sendResult: undefined,
    });
  }

  const sendResult = probe(() =>
    target.Game?.PlayerOperations?.sendRequest?.(
      input.playerId,
      target.PlayerOperationTypes?.ASSIGN_WORKER,
      args
    )
  );
  const sent = sendResult.ok && sendResult.value !== false;
  const after = gameUiPlayerOperationValidation(
    input.playerId,
    "ASSIGN_WORKER",
    target.PlayerOperationTypes?.ASSIGN_WORKER,
    args,
    target
  );
  const afterCityId = beforeCityId ?? readyPopulationCityId(target);
  const afterSnapshot =
    afterCityId == null ? undefined : gameUiPopulationSnapshot(afterCityId, target);

  return populationPlacementResult({
    family: "player-operation",
    operationType: "ASSIGN_WORKER",
    enumValue: target.PlayerOperationTypes?.ASSIGN_WORKER,
    target: { playerId: input.playerId },
    args,
    before,
    after,
    sent,
    beforeSnapshot,
    afterSnapshot,
    sendResult,
  });
}

function gameUiPlayerOperationLocalPlayerMismatch(
  playerId: number,
  localPlayerId: number | undefined,
  args: Readonly<Record<string, number>>
): PopulationValidation {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: "ASSIGN_WORKER",
    enumValue: "ASSIGN_WORKER",
    target: { playerId },
    args,
    valid: false,
    result: {
      ok: false,
      reason: "player-id-mismatch",
      playerId,
      localPlayerId: localPlayerId ?? null,
    },
  };
}

export async function requestCiv7GameUiExpandCityPlacement(
  input: Readonly<{
    cityId: Civ7ControlOrpcComponentId;
    destination: Civ7ControlOrpcMapLocation;
  }>,
  target: Civ7GameUiPopulationTarget = globalThis as Civ7GameUiPopulationTarget
): Promise<PopulationPlacementResult> {
  const cityId = toComponentId(input.cityId);
  if (cityId == null) {
    throw new Error("Population placement cityId must be a ComponentID.");
  }
  const args = {
    X: input.destination.x,
    Y: input.destination.y,
  };
  const beforeSnapshot = gameUiPopulationSnapshot(cityId, target);
  const before = gameUiCityCommandValidation(
    cityId,
    "EXPAND",
    target.CityCommandTypes?.EXPAND,
    args,
    target
  );

  if (!before.valid) {
    return populationPlacementResult({
      family: "city-command",
      operationType: "EXPAND",
      enumValue: target.CityCommandTypes?.EXPAND,
      target: { cityId },
      args,
      before,
      after: before,
      sent: false,
      beforeSnapshot,
      afterSnapshot: beforeSnapshot,
      sendResult: undefined,
    });
  }

  const sendResult = probe(() =>
    target.Game?.CityCommands?.sendRequest?.(cityId, target.CityCommandTypes?.EXPAND, args)
  );
  const sent = sendResult.ok && sendResult.value !== false;
  const after = gameUiCityCommandValidation(
    cityId,
    "EXPAND",
    target.CityCommandTypes?.EXPAND,
    args,
    target
  );
  const afterSnapshot = gameUiPopulationSnapshot(cityId, target);

  return populationPlacementResult({
    family: "city-command",
    operationType: "EXPAND",
    enumValue: target.CityCommandTypes?.EXPAND,
    target: { cityId },
    args,
    before,
    after,
    sent,
    beforeSnapshot,
    afterSnapshot,
    sendResult,
  });
}

function populationPlacementResult(
  input: Readonly<{
    family: "player-operation" | "city-command";
    operationType: "ASSIGN_WORKER" | "EXPAND";
    enumValue: unknown;
    target: Readonly<{ playerId: number } | { cityId: Civ7ControlOrpcComponentId }>;
    args: Readonly<Record<string, number>>;
    before: PopulationValidation;
    after: PopulationValidation;
    sent: boolean;
    beforeSnapshot: PopulationSnapshot | undefined;
    afterSnapshot: PopulationSnapshot | undefined;
    sendResult: RuntimeProbe<unknown> | undefined;
  }>
): PopulationPlacementResult {
  const populationPostcondition = gameUiPopulationPostcondition({
    family: input.family,
    operationType: input.operationType,
    sent: input.sent,
    before: input.before,
    after: input.after,
    beforeSnapshot: input.beforeSnapshot,
    afterSnapshot: input.afterSnapshot,
  });
  return {
    before: input.before,
    after: input.after,
    sent: input.sent,
    verified:
      populationPostcondition?.classification === "population-ready-cleared" ||
      populationPostcondition?.classification === "placement-state-changed",
    populationPostcondition,
    payload: {
      family: input.family,
      operationType: input.operationType,
      enumValue: input.enumValue,
      target: input.target,
      args: input.args,
      sent: input.sent,
      sendResult: input.sendResult,
      beforePopulationPostcondition: input.beforeSnapshot,
      afterPopulationPostcondition: input.afterSnapshot,
      notes: [
        "Game UI population placement used ambient PlayerOperations/CityCommands validation and send evidence inside the controller context.",
      ],
    },
  } as PopulationPlacementResult;
}

function gameUiPopulationPostcondition(
  input: Readonly<{
    family: "player-operation" | "city-command";
    operationType: "ASSIGN_WORKER" | "EXPAND";
    sent: boolean;
    before: PopulationValidation;
    after: PopulationValidation;
    beforeSnapshot: PopulationSnapshot | undefined;
    afterSnapshot: PopulationSnapshot | undefined;
  }>
): PopulationPostcondition | undefined {
  if (input.beforeSnapshot == null || input.afterSnapshot == null) {
    return undefined;
  }
  const readyCleared = populationReadyCleared(input.beforeSnapshot, input.afterSnapshot);
  const placementStateChanged = populationSnapshotChanged(
    input.beforeSnapshot,
    input.afterSnapshot
  );
  const classification = classifyPopulationPostcondition({
    sent: input.sent,
    before: input.before,
    after: input.after,
    readyCleared,
    placementStateChanged,
  });
  return {
    family: input.family,
    operationType: input.operationType,
    classification,
    before: input.beforeSnapshot,
    after: input.afterSnapshot,
    readyCleared,
    placementStateChanged,
    reason: populationPostconditionReason(classification),
  };
}

function gameUiPlayerOperationValidation(
  playerId: number,
  operationType: "ASSIGN_WORKER",
  enumValue: unknown,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiPopulationTarget
): PopulationValidation {
  const result = safeValue(
    () => target.Game?.PlayerOperations?.canStart?.(playerId, enumValue, args, false),
    null
  );
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType,
    enumValue,
    target: { playerId },
    args,
    valid: successFromCanStart(result),
    result,
  };
}

function gameUiCityCommandValidation(
  cityId: Civ7ControlOrpcComponentId,
  operationType: "EXPAND",
  enumValue: unknown,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiPopulationTarget
): PopulationValidation {
  const result = safeValue(
    () => target.Game?.CityCommands?.canStart?.(cityId, enumValue, args, false),
    null
  );
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "city-command",
    operationType,
    enumValue,
    target: { cityId },
    args,
    valid: successFromCanStart(result),
    result,
  };
}

function gameUiPopulationSnapshot(
  cityId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiPopulationTarget
): PopulationSnapshot {
  const city = safeValue(() => target.Cities?.get?.(cityId), null);
  const placementInfo = cityPlacementInfo(city);
  const expansion = probe(
    () =>
      target.Game?.CityCommands?.canStart?.(cityId, target.CityCommandTypes?.EXPAND, {}, false) ??
      null
  );
  return {
    cityId,
    city: probe(() => citySummary(cityId, city)),
    isReadyToPlacePopulation: probe(() => cityReadyToPlacePopulation(city)),
    cityWorkerCap: probe(() => cityWorkerCap(city)),
    workablePlotIndexes: probe(() =>
      placementInfo.filter((info) => !info.isBlocked).map((info) => info.plotIndex)
    ),
    blockedPlotIndexes: probe(() =>
      placementInfo.filter((info) => info.isBlocked).map((info) => info.plotIndex)
    ),
    expansionPlotIndexes: probe(() =>
      expansion.ok &&
      expansion.value != null &&
      typeof expansion.value === "object" &&
      Array.isArray((expansion.value as Record<string, unknown>).Plots)
        ? ((expansion.value as Record<string, unknown>).Plots as unknown[])
        : []
    ),
  };
}

function readyPopulationCityId(
  target: Civ7GameUiPopulationTarget
): Civ7ControlOrpcComponentId | null {
  const localPlayerId = target.GameContext?.localPlayerID;
  if (typeof localPlayerId !== "number") return null;
  const player = safeValue(() => target.Players?.get?.(localPlayerId), null);
  if (player == null || typeof player !== "object") return null;
  const cityIds = safeValue(() => {
    const cities = (player as Record<string, unknown>).Cities;
    if (cities == null || typeof cities !== "object") return [];
    const getCityIds = (cities as Record<string, unknown>).getCityIds;
    return typeof getCityIds === "function" ? getCityIds.call(cities) : [];
  }, []);
  if (!Array.isArray(cityIds)) return null;
  for (const rawCityId of cityIds) {
    const cityId = toComponentId(rawCityId);
    if (cityId == null) continue;
    const city = safeValue(() => target.Cities?.get?.(cityId), null);
    if (cityReadyToPlacePopulation(city) === true) return cityId;
  }
  return null;
}

function citySummary(cityId: Civ7ControlOrpcComponentId, city: unknown): unknown {
  if (city == null || typeof city !== "object") return null;
  const record = city as Record<string, unknown>;
  return {
    id: cityId,
    observedCityId: toComponentId(record.id ?? record.ID ?? record.CityId),
    population: record.population ?? record.Population ?? null,
    isTown: record.isTown ?? null,
    location: record.location ?? record.Location ?? null,
  };
}

function cityReadyToPlacePopulation(city: unknown): unknown {
  if (city == null || typeof city !== "object") return null;
  const growth = (city as Record<string, unknown>).Growth;
  return growth != null && typeof growth === "object"
    ? ((growth as Record<string, unknown>).isReadyToPlacePopulation ?? null)
    : null;
}

function cityWorkerCap(city: unknown): unknown {
  if (city == null || typeof city !== "object") return null;
  const workers = (city as Record<string, unknown>).Workers;
  if (workers == null || typeof workers !== "object") return null;
  const value = (workers as Record<string, unknown>).getCityWorkerCap;
  return typeof value === "function" ? value.call(workers) : null;
}

function cityPlacementInfo(
  city: unknown
): Array<Readonly<{ plotIndex: unknown; isBlocked: boolean }>> {
  if (city == null || typeof city !== "object") return [];
  const workers = (city as Record<string, unknown>).Workers;
  if (workers == null || typeof workers !== "object") return [];
  const value = (workers as Record<string, unknown>).GetAllPlacementInfo;
  const placementInfo = typeof value === "function" ? value.call(workers) : [];
  if (!Array.isArray(placementInfo)) return [];
  return placementInfo.map((info) => {
    const record =
      info != null && typeof info === "object" ? (info as Record<string, unknown>) : {};
    return {
      plotIndex: record.PlotIndex ?? record.plotIndex ?? null,
      isBlocked: record.IsBlocked === true || record.isBlocked === true,
    };
  });
}

function classifyPopulationPostcondition(
  input: Readonly<{
    sent: boolean;
    before: PopulationValidation;
    after: PopulationValidation;
    readyCleared: boolean;
    placementStateChanged: boolean;
  }>
): PopulationPostcondition["classification"] {
  if (!input.sent) return "not-sent";
  if (input.readyCleared) return "population-ready-cleared";
  if (input.placementStateChanged) return "placement-state-changed";
  if (
    input.before.valid !== input.after.valid ||
    stableJson(input.before.result) !== stableJson(input.after.result)
  ) {
    return "validation-changed";
  }
  return "no-state-change";
}

function populationPostconditionReason(
  classification: PopulationPostcondition["classification"]
): string {
  switch (classification) {
    case "not-sent":
      return "The placement request was not sent, so no population-placement postcondition can be verified.";
    case "population-ready-cleared":
      return "Growth.isReadyToPlacePopulation cleared after the placement request.";
    case "placement-state-changed":
      return "The city population placement snapshot changed after the request, but readiness did not clearly clear.";
    case "validation-changed":
      return "The placement validation result changed after the request.";
    case "no-state-change":
      return "The placement request was sent, but no observed population-placement, city, or validation state changed.";
  }
}

function populationReadyCleared(before: PopulationSnapshot, after: PopulationSnapshot): boolean {
  return (
    before.isReadyToPlacePopulation.ok &&
    before.isReadyToPlacePopulation.value === true &&
    after.isReadyToPlacePopulation.ok &&
    after.isReadyToPlacePopulation.value === false
  );
}

function populationSnapshotChanged(before: PopulationSnapshot, after: PopulationSnapshot): boolean {
  return (
    stableJson(probeValue(before.city)) !== stableJson(probeValue(after.city)) ||
    stableJson(probeValue(before.isReadyToPlacePopulation)) !==
      stableJson(probeValue(after.isReadyToPlacePopulation)) ||
    stableJson(probeValue(before.cityWorkerCap)) !== stableJson(probeValue(after.cityWorkerCap)) ||
    stableJson(probeValue(before.workablePlotIndexes)) !==
      stableJson(probeValue(after.workablePlotIndexes)) ||
    stableJson(probeValue(before.blockedPlotIndexes)) !==
      stableJson(probeValue(after.blockedPlotIndexes)) ||
    stableJson(probeValue(before.expansionPlotIndexes)) !==
      stableJson(probeValue(after.expansionPlotIndexes))
  );
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

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const owner = numericField(record, "owner", "Owner");
  const id = numericField(record, "id", "ID");
  if (owner == null || id == null) return null;
  const type = numericField(record, "type", "Type");
  return type == null ? { owner, id } : { owner, id, type };
}

function numericField(
  record: Record<string, unknown>,
  lower: string,
  upper: string
): number | null {
  if (typeof record[lower] === "number") return record[lower] as number;
  if (typeof record[upper] === "number") return record[upper] as number;
  return null;
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
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(",")}}`;
}
