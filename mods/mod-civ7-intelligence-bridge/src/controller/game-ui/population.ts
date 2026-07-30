import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcMapLocation,
} from "../service-types";

type WorkerAssignmentInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7WorkerAssignment"]
>[0];
type WorkerAssignmentCheckResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["checkCiv7WorkerAssignment"]>
>;
type WorkerAssignmentSendResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["sendCiv7WorkerAssignment"]>
>;
type WorkerAssignmentSnapshot = WorkerAssignmentCheckResult["snapshot"];
type WorkerAssignmentValidationResult = WorkerAssignmentCheckResult["result"];

type CityExpansionInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7CityExpansion"]
>[0];
type CityExpansionCheckResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["checkCiv7CityExpansion"]>
>;
type CityExpansionSendResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["sendCiv7CityExpansion"]>
>;
type CityExpansionSnapshot = CityExpansionCheckResult["snapshot"];
type CityExpansionValidationResult = CityExpansionCheckResult["result"];

type PopulationValidation<T> = Readonly<{
  valid: boolean;
  result: T;
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
        args: unknown,
        queue?: boolean
      ) => unknown;
      sendRequest?: (playerId: number, operationType: unknown, args: unknown) => unknown;
    };
  };
  GameContext?: {
    localPlayerID?: number;
  };
  GameplayMap?: {
    getIndexFromLocation?: (location: Civ7ControlOrpcMapLocation) => number;
    getOwningCityFromXY?: (x: number, y: number) => unknown;
  };
  PlayerOperationTypes?: {
    ASSIGN_WORKER?: unknown;
  };
  Players?: {
    get?: (playerId: number) => unknown;
  };
}>;

/** Reports whether the game UI can check both exact population-placement branches. */
export function civ7GameUiPopulationPlacementCheckAvailable(
  target: Civ7GameUiPopulationTarget
): boolean {
  return (
    Number.isInteger(target.GameContext?.localPlayerID) &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    target.PlayerOperationTypes?.ASSIGN_WORKER !== undefined &&
    typeof target.Game?.CityCommands?.canStart === "function" &&
    target.CityCommandTypes?.EXPAND !== undefined &&
    typeof target.Players?.get === "function" &&
    typeof target.Cities?.get === "function" &&
    typeof target.GameplayMap?.getIndexFromLocation === "function" &&
    typeof target.GameplayMap.getOwningCityFromXY === "function"
  );
}

/** Reports whether the game UI can send both exact population-placement branches. */
export function civ7GameUiPopulationPlacementSendAvailable(
  target: Civ7GameUiPopulationTarget
): boolean {
  return (
    civ7GameUiPopulationPlacementCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function" &&
    typeof target.Game.CityCommands?.sendRequest === "function"
  );
}

/** Checks exact ASSIGN_WORKER admission for the ambient local player and target plot. */
export async function checkCiv7GameUiWorkerAssignment(
  input: WorkerAssignmentInput,
  target: Civ7GameUiPopulationTarget = globalThis as Civ7GameUiPopulationTarget
): Promise<WorkerAssignmentCheckResult> {
  requirePlotIndex(input.location, "location");
  const snapshot = readWorkerAssignmentSnapshot(input, target);
  const validation = checkWorkerAssignmentValidation(input, snapshot, target);
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot,
  };
}

/** Sends exact ASSIGN_WORKER only after a fresh strict native check. */
export async function sendCiv7GameUiWorkerAssignment(
  input: WorkerAssignmentInput,
  target: Civ7GameUiPopulationTarget = globalThis as Civ7GameUiPopulationTarget
): Promise<WorkerAssignmentSendResult> {
  let sendInvoked = false;
  try {
    requirePlotIndex(input.location, "location");
    const before = readWorkerAssignmentSnapshot(input, target);
    const checked = checkWorkerAssignmentValidation(input, before, target);
    const validation = {
      valid: checked.valid,
      result: checked.result,
    };
    if (!checked.valid) {
      return {
        sent: false,
        validation: {
          valid: false,
          result: checked.result,
        },
        before,
        after: readWorkerAssignmentSnapshot(input, target),
      };
    }

    const operations = target.Game?.PlayerOperations;
    if (typeof operations?.sendRequest !== "function") {
      throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
    }
    if (target.PlayerOperationTypes?.ASSIGN_WORKER === undefined) {
      throw new Error("PlayerOperationTypes.ASSIGN_WORKER is unavailable.");
    }
    sendInvoked = true;
    operations.sendRequest(before.localPlayerId, target.PlayerOperationTypes.ASSIGN_WORKER, {
      Location: input.location,
      Amount: 1,
    });
    return {
      sent: true,
      validation: {
        valid: true,
        result: validation.result,
      },
      before,
      after: readWorkerAssignmentSnapshot(input, target),
    };
  } catch (cause) {
    throw populationDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

/** Checks exact EXPAND membership for the requested city and destination. */
export async function checkCiv7GameUiCityExpansion(
  input: CityExpansionInput,
  target: Civ7GameUiPopulationTarget = globalThis as Civ7GameUiPopulationTarget
): Promise<CityExpansionCheckResult> {
  const normalized = normalizeCityExpansionInput(input);
  const checked = checkCityExpansionValidation(normalized, target);
  return {
    valid: checked.valid,
    result: checked.result,
    snapshot: checked.snapshot,
  };
}

/** Sends exact EXPAND coordinates only after a fresh target-membership check. */
export async function sendCiv7GameUiCityExpansion(
  input: CityExpansionInput,
  target: Civ7GameUiPopulationTarget = globalThis as Civ7GameUiPopulationTarget
): Promise<CityExpansionSendResult> {
  let sendInvoked = false;
  try {
    const normalized = normalizeCityExpansionInput(input);
    const checked = checkCityExpansionValidation(normalized, target);
    if (!checked.valid) {
      return {
        sent: false,
        validation: {
          valid: false,
          result: checked.result,
        },
        before: checked.snapshot,
        after: checked.snapshot,
      };
    }

    const commands = target.Game?.CityCommands;
    if (typeof commands?.sendRequest !== "function") {
      throw new Error("Game.CityCommands.sendRequest is unavailable.");
    }
    if (target.CityCommandTypes?.EXPAND === undefined) {
      throw new Error("CityCommandTypes.EXPAND is unavailable.");
    }
    sendInvoked = true;
    commands.sendRequest(normalized.cityId, target.CityCommandTypes.EXPAND, {
      X: normalized.destination.x,
      Y: normalized.destination.y,
    });
    return {
      sent: true,
      validation: {
        valid: true,
        result: checked.result,
      },
      before: checked.snapshot,
      after: checkCityExpansionValidation(normalized, target).snapshot,
    };
  } catch (cause) {
    throw populationDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function checkWorkerAssignmentValidation(
  input: WorkerAssignmentInput,
  snapshot: WorkerAssignmentSnapshot,
  target: Civ7GameUiPopulationTarget
): PopulationValidation<WorkerAssignmentValidationResult> {
  const operations = target.Game?.PlayerOperations;
  if (typeof operations?.canStart !== "function") {
    throw new Error("Game.PlayerOperations.canStart is unavailable.");
  }
  if (target.PlayerOperationTypes?.ASSIGN_WORKER === undefined) {
    throw new Error("PlayerOperationTypes.ASSIGN_WORKER is unavailable.");
  }
  const rawResult = operations.canStart(
    snapshot.localPlayerId,
    target.PlayerOperationTypes.ASSIGN_WORKER,
    { Location: input.location, Amount: 1 },
    false
  );
  return {
    valid:
      rawResult !== null &&
      typeof rawResult === "object" &&
      (rawResult as Record<string, unknown>).Success === true &&
      snapshot.candidateCityId !== null &&
      snapshot.isReadyToPlacePopulation === true,
    result: snapshotJsonResult(rawResult, "Game.PlayerOperations.canStart"),
  };
}

function readWorkerAssignmentSnapshot(
  input: WorkerAssignmentInput,
  target: Civ7GameUiPopulationTarget
): WorkerAssignmentSnapshot {
  const localPlayerId = requireLocalPlayerId(target);
  const player = target.Players?.get?.(localPlayerId);
  if (player == null || typeof player !== "object") {
    throw new Error("The local player is unavailable.");
  }
  const cities = (player as Record<string, unknown>).Cities;
  if (cities == null || typeof cities !== "object") {
    throw new Error("The local player's city list is unavailable.");
  }
  const getCityIds = (cities as Record<string, unknown>).getCityIds;
  if (typeof getCityIds !== "function") {
    throw new Error("The local player's city list is unavailable.");
  }
  const cityIds = getCityIds.call(cities);
  if (!Array.isArray(cityIds)) {
    throw new Error("The local player's city list is not an array.");
  }

  const readyCityIds: Civ7ControlOrpcComponentId[] = [];
  let candidateCityId: Civ7ControlOrpcComponentId | null = null;
  let isReadyToPlacePopulation: boolean | null = null;
  let placementInfo: WorkerAssignmentSnapshot["placementInfo"] = null;
  let numWorkers: number | null = null;
  for (const rawCityId of cityIds) {
    const cityId = toComponentId(rawCityId);
    if (cityId == null) {
      throw new Error("The local player's city list contains an invalid ComponentID.");
    }
    const city = target.Cities?.get?.(cityId);
    const readiness = cityReadyToPlacePopulation(city);
    const ready = readiness === true;
    if (ready) readyCityIds.push(cityId);
    const candidates = cityWorkerPlacementInfo(city);
    if (candidates == null) {
      if (ready) throw new Error("A ready city's worker placement candidates are unavailable.");
      continue;
    }
    const candidate = candidates.find(
      (entry) =>
        entry != null &&
        typeof entry === "object" &&
        (entry as Record<string, unknown>).PlotIndex === input.location &&
        (entry as Record<string, unknown>).IsBlocked !== true
    );
    if (candidate === undefined) continue;
    if (candidateCityId !== null) {
      throw new Error("The worker target belongs to more than one local city.");
    }
    candidateCityId = cityId;
    isReadyToPlacePopulation = typeof readiness === "boolean" ? readiness : null;
    placementInfo = snapshotJsonResult(candidate, "Worker placement candidate");
    const rawNumWorkers = (candidate as Record<string, unknown>).NumWorkers;
    numWorkers = Number.isInteger(rawNumWorkers) ? (rawNumWorkers as number) : null;
  }
  return {
    localPlayerId,
    location: input.location,
    readyCityIds,
    candidateCityId,
    isReadyToPlacePopulation,
    placementInfo,
    numWorkers,
  };
}

function checkCityExpansionValidation(
  input: CityExpansionInput,
  target: Civ7GameUiPopulationTarget
): PopulationValidation<CityExpansionValidationResult> & { snapshot: CityExpansionSnapshot } {
  const localPlayerId = requireLocalPlayerId(target);
  const map = target.GameplayMap;
  if (typeof map?.getIndexFromLocation !== "function") {
    throw new Error("GameplayMap.getIndexFromLocation is unavailable.");
  }
  const plotIndex = map.getIndexFromLocation(input.destination);
  if (!Number.isInteger(plotIndex)) {
    throw new Error("GameplayMap.getIndexFromLocation returned an invalid plot index.");
  }
  const commands = target.Game?.CityCommands;
  if (typeof commands?.canStart !== "function") {
    throw new Error("Game.CityCommands.canStart is unavailable.");
  }
  if (target.CityCommandTypes?.EXPAND === undefined) {
    throw new Error("CityCommandTypes.EXPAND is unavailable.");
  }
  const rawResult = commands.canStart(input.cityId, target.CityCommandTypes.EXPAND, {}, false);
  const snapshot = readCityExpansionSnapshot(
    input,
    localPlayerId,
    plotIndex as number,
    rawResult,
    target
  );
  return {
    valid:
      input.cityId.owner === localPlayerId &&
      snapshot.isReadyToPlacePopulation === true &&
      snapshot.candidate !== null &&
      snapshot.ownership.status === "unowned",
    result: snapshotJsonResult(rawResult, "Game.CityCommands.canStart"),
    snapshot,
  };
}

function readCityExpansionSnapshot(
  input: CityExpansionInput,
  localPlayerId: number,
  plotIndex: number,
  rawResult: unknown,
  target: Civ7GameUiPopulationTarget
): CityExpansionSnapshot {
  const readOwner = target.GameplayMap?.getOwningCityFromXY;
  if (typeof readOwner !== "function") {
    throw new Error("GameplayMap.getOwningCityFromXY is unavailable.");
  }
  const city = target.Cities?.get?.(input.cityId);
  const readiness = cityReadyToPlacePopulation(city);
  return {
    localPlayerId,
    cityId: input.cityId,
    destination: input.destination,
    plotIndex,
    isReadyToPlacePopulation: typeof readiness === "boolean" ? readiness : null,
    candidate: expansionCandidate(rawResult, plotIndex),
    ownership: cityExpansionOwnership(readOwner(input.destination.x, input.destination.y)),
  };
}

function cityExpansionOwnership(value: unknown): CityExpansionSnapshot["ownership"] {
  if (value === null) return { status: "unowned" };
  const cityId = toComponentId(value);
  return cityId === null ? { status: "unavailable" } : { status: "owned", cityId };
}

function expansionCandidate(
  result: unknown,
  plotIndex: number
): CityExpansionSnapshot["candidate"] {
  if (result == null || typeof result !== "object") return null;
  const record = result as Record<string, unknown>;
  if (!Array.isArray(record.Plots) || !Array.isArray(record.ConstructibleTypes)) return null;
  const index = record.Plots.findIndex((candidatePlotIndex) => candidatePlotIndex === plotIndex);
  if (index < 0 || index >= record.ConstructibleTypes.length) return null;
  const constructibleType = record.ConstructibleTypes[index];
  if (constructibleType === undefined) return null;
  return {
    plotIndex,
    constructibleType: snapshotJsonResult(constructibleType, "EXPAND ConstructibleTypes entry"),
  };
}

function normalizeCityExpansionInput(input: CityExpansionInput): CityExpansionInput {
  const cityId = toComponentId(input.cityId);
  if (cityId == null) throw new Error("Population placement cityId must be a ComponentID.");
  requirePlotCoordinate(input.destination.x, "destination.x");
  requirePlotCoordinate(input.destination.y, "destination.y");
  return {
    cityId,
    destination: {
      x: input.destination.x,
      y: input.destination.y,
    },
  };
}

function requireLocalPlayerId(target: Civ7GameUiPopulationTarget): number {
  const localPlayerId = target.GameContext?.localPlayerID;
  if (!Number.isInteger(localPlayerId)) {
    throw new Error("GameContext.localPlayerID is unavailable.");
  }
  return localPlayerId as number;
}

function requirePlotIndex(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 1_000_000) {
    throw new Error(`${label} must be an integer between 0 and 1000000.`);
  }
}

function requirePlotCoordinate(value: number, label: string): void {
  requirePlotIndex(value, label);
}

function cityReadyToPlacePopulation(city: unknown): unknown {
  if (city == null || typeof city !== "object") return null;
  const growth = (city as Record<string, unknown>).Growth;
  return growth != null && typeof growth === "object"
    ? ((growth as Record<string, unknown>).isReadyToPlacePopulation ?? null)
    : null;
}

function cityWorkerPlacementInfo(city: unknown): unknown[] | null {
  if (city == null || typeof city !== "object") return null;
  const workers = (city as Record<string, unknown>).Workers;
  if (workers == null || typeof workers !== "object") return null;
  const read = (workers as Record<string, unknown>).GetAllPlacementInfo;
  if (typeof read !== "function") return null;
  const result = read.call(workers);
  return Array.isArray(result) ? result : null;
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
  record: Readonly<Record<string, unknown>>,
  lower: string,
  upper: string
): number | null {
  const lowerValue = record[lower];
  if (typeof lowerValue === "number" && Number.isFinite(lowerValue)) return lowerValue;
  const upperValue = record[upper];
  return typeof upperValue === "number" && Number.isFinite(upperValue) ? upperValue : null;
}

function snapshotJsonResult<T>(value: unknown, label: string): T {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error(`${label} returned non-JSON evidence.`);
  return JSON.parse(serialized) as T;
}

function populationDispatchError(
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
