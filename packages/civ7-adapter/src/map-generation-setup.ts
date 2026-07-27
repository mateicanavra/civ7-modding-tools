import { assessCiv7SignedIntSeed } from "@civ7/map-policy/setup";

import type { MapDimensions, MapInfo, MapSizeId } from "./types.js";

const CIV7_MAP_INFO_NUMBER_KEYS = [
  "GridWidth",
  "GridHeight",
  "MinLatitude",
  "MaxLatitude",
  "NumNaturalWonders",
  "LakeGenerationFrequency",
  "PlayersLandmass1",
  "PlayersLandmass2",
  "StartSectorRows",
  "StartSectorCols",
] as const;

type Civ7MapInfoNumberKey = (typeof CIV7_MAP_INFO_NUMBER_KEYS)[number];

type Civ7ConfigurationRuntime = Readonly<{
  getGameValue?: (key: string) => unknown;
  getMapValue?: (key: string) => unknown;
}>;

type Civ7PlayersRuntime = Readonly<{
  getAliveMajorIds?: () => unknown;
}>;

type SnapshotValueResult =
  | Readonly<{ ok: true; value: Civ7SetupOptionValue }>
  | Readonly<{ ok: false }>;

/** Latitude bounds already resolved for the exact map-generation invocation. */
export type Civ7MapGenerationLatitudeBounds = Readonly<{
  topLatitude: number;
  bottomLatitude: number;
}>;

/**
 * Detached projection of the map-info fields declared by the adapter contract.
 *
 * The capture does not retain the live `GameInfo.Maps` row or claim that
 * unmodeled row fields belong to this setup authority.
 */
export type Civ7MapInfoSnapshot = Readonly<Partial<Record<Civ7MapInfoNumberKey, number>>>;

/** Immutable object branch of one snapshotted Civ7 configuration value. */
export interface Civ7SetupOptionObject {
  readonly [key: string]: Civ7SetupOptionValue;
}

/** Portable configuration value that can be independently snapshotted and frozen. */
export type Civ7SetupOptionValue =
  | null
  | boolean
  | number
  | string
  | readonly Civ7SetupOptionValue[]
  | Civ7SetupOptionObject;

/** Why one explicitly requested configuration key could not produce detached evidence. */
export type Civ7SetupOptionUnavailableReason =
  | "configuration-api-unavailable"
  | "read-failed"
  | "value-unavailable"
  | "value-not-snapshotable";

/** Detached evidence for exactly one explicitly requested configuration key. */
export type Civ7SetupOptionEvidence<Key extends string = string> = Readonly<
  | {
      status: "available";
      key: Key;
      value: Civ7SetupOptionValue;
    }
  | {
      status: "unavailable";
      key: Key;
      reason: Civ7SetupOptionUnavailableReason;
    }
>;

/** Static placement-slot capacity declared by the resolved Civ7 map-info row. */
export type Civ7StartSlotCapacity = Readonly<{
  west: number;
  east: number;
  total: number;
}>;

/**
 * Inputs the SDK has already resolved before Civ7 enters `GenerateMap`.
 *
 * Requested option keys are explicit because Civ7 exposes keyed reads, not a
 * supported bulk-enumeration contract.
 */
export type Civ7MapGenerationSetupCaptureInput<
  MapOptionKey extends string = string,
  GameOptionKey extends string = string,
> = Readonly<{
  mapSeed: number;
  dimensions: Readonly<MapDimensions>;
  latitudeBounds: Civ7MapGenerationLatitudeBounds;
  mapSizeId: MapSizeId;
  mapInfo: MapInfo;
  requestedMapOptionKeys: readonly MapOptionKey[];
  requestedGameOptionKeys: readonly GameOptionKey[];
}>;

/** Immutable one-shot evidence captured at the Civ7 `GenerateMap` boundary. */
export type Civ7MapGenerationSetupCapture<
  MapOptionKey extends string = string,
  GameOptionKey extends string = string,
> = Readonly<{
  mapSeed: number;
  gameSeed: number;
  dimensions: Readonly<MapDimensions>;
  latitudeBounds: Civ7MapGenerationLatitudeBounds;
  mapSizeId: MapSizeId;
  mapInfo: Civ7MapInfoSnapshot;
  /** Exact ordered unique alive-major ids observed from Civ7; never synthesized from slot counts. */
  aliveMajorPlayerIds: readonly number[];
  /** Static map-size placement capacity, which is not an observation of actual players. */
  startSlotCapacity: Civ7StartSlotCapacity;
  options: Readonly<{
    map: readonly Civ7SetupOptionEvidence<MapOptionKey>[];
    game: readonly Civ7SetupOptionEvidence<GameOptionKey>[];
  }>;
}>;

/**
 * Captures Civ7's initial map-generation setup once, synchronously.
 *
 * Required identity fails closed. Contextually unavailable requested options
 * remain explicit evidence instead of being defaulted, inferred, or omitted.
 */
export function captureCiv7MapGenerationSetup<
  const MapOptionKey extends string,
  const GameOptionKey extends string,
>(
  input: Civ7MapGenerationSetupCaptureInput<MapOptionKey, GameOptionKey>
): Civ7MapGenerationSetupCapture<MapOptionKey, GameOptionKey> {
  const mapSeed = requireSignedIntSeed(input.mapSeed, "Civ7 map seed");
  const dimensions = snapshotDimensions(input.dimensions);
  const latitudeBounds = snapshotLatitudeBounds(input.latitudeBounds);
  const mapSizeId = requireMapSizeId(input.mapSizeId);
  const mapInfo = snapshotMapInfo(input.mapInfo);
  const startSlotCapacity = deriveStartSlotCapacity(mapInfo);
  const requestedMapOptionKeys = snapshotRequestedKeys(
    input.requestedMapOptionKeys,
    "Civ7 requested map option keys"
  );
  const requestedGameOptionKeys = snapshotRequestedKeys(
    input.requestedGameOptionKeys,
    "Civ7 requested game option keys"
  );

  const configuration = readConfigurationRuntime();
  const gameSeed = captureRequiredGameSeed(configuration);
  const aliveMajorPlayerIds = captureAliveMajorPlayerIds();
  const options = Object.freeze({
    map: captureRequestedOptions(configuration?.getMapValue, configuration, requestedMapOptionKeys),
    game: captureRequestedOptions(
      configuration?.getGameValue,
      configuration,
      requestedGameOptionKeys
    ),
  });

  return Object.freeze({
    mapSeed,
    gameSeed,
    dimensions,
    latitudeBounds,
    mapSizeId,
    mapInfo,
    aliveMajorPlayerIds,
    startSlotCapacity,
    options,
  });
}

function requireSignedIntSeed(value: unknown, label: string): number {
  const result = assessCiv7SignedIntSeed(value);
  if (result.ok) return result.value;
  const message =
    result.reason === "not-integer"
      ? `${label} must be a signed 32-bit integer without coercion.`
      : `${label} must be between ${String(result.min)} and ${String(result.max)}.`;
  if (result.reason === "out-of-range") throw new RangeError(message);
  throw new TypeError(message);
}

function snapshotDimensions(value: MapDimensions): Readonly<MapDimensions> {
  if (
    value === null ||
    typeof value !== "object" ||
    !Number.isSafeInteger(value.width) ||
    value.width <= 0 ||
    !Number.isSafeInteger(value.height) ||
    value.height <= 0
  ) {
    throw new TypeError("Civ7 map dimensions must be positive safe integers.");
  }
  if (value.width > Math.floor(0x7fff_ffff / value.height)) {
    throw new RangeError("Civ7 map tile count must fit a signed 32-bit grid index.");
  }
  return Object.freeze({ width: value.width, height: value.height });
}

function snapshotLatitudeBounds(
  value: Civ7MapGenerationLatitudeBounds
): Civ7MapGenerationLatitudeBounds {
  if (
    value === null ||
    typeof value !== "object" ||
    typeof value.topLatitude !== "number" ||
    !Number.isFinite(value.topLatitude) ||
    typeof value.bottomLatitude !== "number" ||
    !Number.isFinite(value.bottomLatitude)
  ) {
    throw new TypeError("Civ7 map latitude bounds must be finite numbers.");
  }
  if (value.topLatitude <= value.bottomLatitude) {
    throw new RangeError("Civ7 map topLatitude must be greater than bottomLatitude.");
  }
  return Object.freeze({
    topLatitude: value.topLatitude,
    bottomLatitude: value.bottomLatitude,
  });
}

function requireMapSizeId(value: unknown): MapSizeId {
  if (typeof value === "string") {
    if (value.length === 0 || value.trim() !== value) {
      throw new TypeError("Civ7 mapSizeId must be a non-empty unpadded string or safe integer.");
    }
    return value;
  }
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  throw new TypeError("Civ7 mapSizeId must be a non-empty unpadded string or safe integer.");
}

function snapshotMapInfo(value: MapInfo): Civ7MapInfoSnapshot {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Civ7 mapInfo must be an object.");
  }

  const snapshot: Partial<Record<Civ7MapInfoNumberKey, number>> = {};
  for (const key of CIV7_MAP_INFO_NUMBER_KEYS) {
    const field = value[key];
    if (field === undefined) continue;
    if (typeof field !== "number" || !Number.isFinite(field)) {
      throw new TypeError(`Civ7 mapInfo.${key} must be a finite number when present.`);
    }
    snapshot[key] = field;
  }
  return Object.freeze(snapshot);
}

function deriveStartSlotCapacity(mapInfo: Civ7MapInfoSnapshot): Civ7StartSlotCapacity {
  const west = requireStartSlotCapacity(mapInfo.PlayersLandmass1, "PlayersLandmass1");
  const east = requireStartSlotCapacity(mapInfo.PlayersLandmass2, "PlayersLandmass2");
  const total = west + east;
  if (!Number.isSafeInteger(total)) {
    throw new RangeError("Civ7 total start-slot capacity must be a safe integer.");
  }
  return Object.freeze({ west, east, total });
}

function requireStartSlotCapacity(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`Civ7 mapInfo.${field} must be a non-negative safe integer.`);
  }
  return value;
}

function snapshotRequestedKeys<Key extends string>(
  value: readonly Key[],
  label: string
): readonly Key[] {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  const snapshot: Key[] = [];
  const seen = new Set<string>();
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.hasOwn(value, index)) {
      throw new TypeError(`${label} must not contain sparse entries.`);
    }
    const key = value[index];
    if (typeof key !== "string" || key.length === 0 || key.trim() !== key) {
      throw new TypeError(`${label} must contain non-empty unpadded strings.`);
    }
    if (seen.has(key)) throw new TypeError(`${label} must contain unique keys.`);
    seen.add(key);
    snapshot.push(key as Key);
  }
  return Object.freeze(snapshot);
}

function readConfigurationRuntime(): Civ7ConfigurationRuntime | undefined {
  const runtime = (
    globalThis as typeof globalThis & {
      Configuration?: unknown;
    }
  ).Configuration;
  if (runtime === null || typeof runtime !== "object") return undefined;
  return runtime as Civ7ConfigurationRuntime;
}

function captureRequiredGameSeed(configuration: Civ7ConfigurationRuntime | undefined): number {
  const getter = configuration?.getGameValue;
  if (typeof getter !== "function") {
    throw new Error("Civ7 Configuration.getGameValue is unavailable during GenerateMap.");
  }
  let value: unknown;
  try {
    value = getter.call(configuration, "RandomSeed");
  } catch {
    throw new Error("Civ7 game seed read failed during GenerateMap.");
  }
  return requireSignedIntSeed(value, "Civ7 game seed");
}

function captureAliveMajorPlayerIds(): readonly number[] {
  const players = (
    globalThis as typeof globalThis & {
      Players?: unknown;
    }
  ).Players;
  if (players === null || typeof players !== "object") {
    throw new Error("Civ7 Players.getAliveMajorIds is unavailable during GenerateMap.");
  }
  const getter = (players as Civ7PlayersRuntime).getAliveMajorIds;
  if (typeof getter !== "function") {
    throw new Error("Civ7 Players.getAliveMajorIds is unavailable during GenerateMap.");
  }

  let observed: unknown;
  try {
    observed = getter.call(players);
  } catch {
    throw new Error("Civ7 alive-major player read failed during GenerateMap.");
  }
  if (!Array.isArray(observed)) {
    throw new TypeError("Civ7 Players.getAliveMajorIds must return an array.");
  }

  const snapshot: number[] = [];
  const seen = new Set<number>();
  for (let index = 0; index < observed.length; index += 1) {
    if (!Object.hasOwn(observed, index)) {
      throw new TypeError("Civ7 alive-major player ids must not contain sparse entries.");
    }
    const playerId: unknown = observed[index];
    if (
      typeof playerId !== "number" ||
      !Number.isSafeInteger(playerId) ||
      playerId < 0 ||
      playerId > 63
    ) {
      throw new TypeError("Civ7 alive-major player ids must be integers between 0 and 63.");
    }
    if (seen.has(playerId)) {
      throw new TypeError("Civ7 alive-major player ids must be unique.");
    }
    seen.add(playerId);
    snapshot.push(playerId);
  }
  return Object.freeze(snapshot);
}

function captureRequestedOptions<Key extends string>(
  getter: ((key: string) => unknown) | undefined,
  receiver: Civ7ConfigurationRuntime | undefined,
  keys: readonly Key[]
): readonly Civ7SetupOptionEvidence<Key>[] {
  if (typeof getter !== "function") {
    return Object.freeze(
      keys.map((key) =>
        Object.freeze({
          status: "unavailable" as const,
          key,
          reason: "configuration-api-unavailable" as const,
        })
      )
    );
  }

  const evidence = keys.map((key): Civ7SetupOptionEvidence<Key> => {
    let observed: unknown;
    try {
      observed = getter.call(receiver, key);
    } catch {
      return Object.freeze({ status: "unavailable", key, reason: "read-failed" });
    }
    if (observed === undefined) {
      return Object.freeze({ status: "unavailable", key, reason: "value-unavailable" });
    }
    const snapshot = snapshotSetupOptionValue(observed, new Set<object>(), 0);
    return snapshot.ok
      ? Object.freeze({ status: "available", key, value: snapshot.value })
      : Object.freeze({ status: "unavailable", key, reason: "value-not-snapshotable" });
  });
  return Object.freeze(evidence);
}

function snapshotSetupOptionValue(
  value: unknown,
  ancestors: Set<object>,
  depth: number
): SnapshotValueResult {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return { ok: true, value };
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? { ok: true, value } : { ok: false };
  }
  if (typeof value !== "object" || depth >= 64 || ancestors.has(value)) return { ok: false };

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype) return { ok: false };
      const snapshot: Civ7SetupOptionValue[] = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) return { ok: false };
        const item = snapshotSetupOptionValue(value[index], ancestors, depth + 1);
        if (!item.ok) return item;
        snapshot.push(item.value);
      }
      if (Reflect.ownKeys(value).some((key) => key !== "length" && !isArrayIndex(key))) {
        return { ok: false };
      }
      return { ok: true, value: Object.freeze(snapshot) };
    }

    if (Object.getPrototypeOf(value) !== Object.prototype) return { ok: false };
    const snapshot: Record<string, Civ7SetupOptionValue> = {};
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== "string" || isUnsafeObjectKey(key)) return { ok: false };
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor === undefined || !descriptor.enumerable || !("value" in descriptor)) {
        return { ok: false };
      }
      const property = snapshotSetupOptionValue(descriptor.value, ancestors, depth + 1);
      if (!property.ok) return property;
      Object.defineProperty(snapshot, key, {
        configurable: false,
        enumerable: true,
        value: property.value,
        writable: false,
      });
    }
    return { ok: true, value: Object.freeze(snapshot) };
  } finally {
    ancestors.delete(value);
  }
}

function isArrayIndex(key: PropertyKey): boolean {
  if (typeof key !== "string" || key === "") return false;
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && index < 0xffff_ffff && String(index) === key;
}

function isUnsafeObjectKey(key: string): boolean {
  return key === "__proto__" || key === "prototype" || key === "constructor";
}
