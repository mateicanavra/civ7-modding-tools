import { CIV7_MAP_INFO_COLUMN_DESCRIPTORS, type Civ7MapInfo } from "@civ7/map-policy";
import {
  assessCiv7SignedIntSeed,
  CIV7_GAME_OPTION_DESCRIPTORS,
  CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR,
  CIV7_MAP_OPTION_DESCRIPTORS,
  CIV7_PLAYER_OPTION_DESCRIPTORS,
  CIV7_SIGNED_INT_SEED_MAX,
  type Civ7GameOptionDescriptor,
  type Civ7MapOptionDescriptor,
  type Civ7PlayerOptionDescriptor,
  type Civ7SetupOptionDescriptor,
  type Civ7SetupOptionUnavailableReason,
} from "@civ7/map-policy/setup";

import type { MapDimensions, MapInfo, MapSizeId } from "./types.js";

const CIV7_UINT32_MAX = 0xffff_ffff;
const CIV7_UINT32_MODULUS = CIV7_UINT32_MAX + 1;

type Civ7ConfigurationRuntime = Readonly<{
  getGameValue?: (key: string) => unknown;
  getMapValue?: (key: string) => unknown;
  getPlayer?: (playerId: number) => unknown;
}>;

type Civ7PlayerConfigurationRuntime = Readonly<{
  getValue?: (key: string) => unknown;
}>;

type Civ7PlayersRuntime = Readonly<{
  getAliveMajorIds?: () => unknown;
}>;

type SetupOptionDescriptor =
  | Civ7GameOptionDescriptor
  | Civ7MapOptionDescriptor
  | Civ7PlayerOptionDescriptor;

type AdmittedSetupOptionDescriptors<Descriptors extends readonly SetupOptionDescriptor[]> =
  Readonly<{ [Index in keyof Descriptors]: Descriptors[Index] }>;

type SetupOptionDescriptorForGroup<Group extends "Game" | "Map" | "Player"> = Group extends "Game"
  ? Civ7GameOptionDescriptor
  : Group extends "Map"
    ? Civ7MapOptionDescriptor
    : Civ7PlayerOptionDescriptor;

type SetupOptionParameterId<Descriptor extends Civ7SetupOptionDescriptor> =
  Descriptor["parameterId"] & string;

type SetupOptionValueForDescriptor<Descriptor extends SetupOptionDescriptor> =
  Descriptor extends unknown
    ? Descriptor["cardinality"] extends "array"
      ? readonly string[]
      : Descriptor["valueKind"] extends "boolean"
        ? boolean
        : Descriptor["valueKind"] extends "integer"
          ? number
          : string
    : never;

/** Latitude bounds already resolved for the exact map-generation invocation. */
export type Civ7MapGenerationLatitudeBounds = Readonly<{
  topLatitude: number;
  bottomLatitude: number;
}>;

/**
 * Detached projection of Civ7's complete gameplay `GameInfo.Maps` row.
 *
 * Fields remain optional at this recipe-agnostic boundary because test doubles and unsupported
 * map kinds may expose partial rows. A consuming recipe decides which facts its setup requires.
 */
export type Civ7MapInfoSnapshot = Readonly<Partial<Civ7MapInfo>>;

/** Portable authored option value exposed by Civ7's configuration getters. */
export type Civ7SetupOptionValue = boolean | number | string | readonly string[];

export type { Civ7SetupOptionUnavailableReason } from "@civ7/map-policy/setup";

/** Detached evidence whose key remains the authored Civ7 ParameterID. */
export type Civ7SetupOptionEvidence<
  Key extends string = string,
  Value extends Civ7SetupOptionValue = Civ7SetupOptionValue,
  UnavailableReason extends Civ7SetupOptionUnavailableReason = Civ7SetupOptionUnavailableReason,
> = Readonly<
  | {
      status: "available";
      key: Key;
      value: Value;
    }
  | {
      status: "unavailable";
      key: Key;
      reason: UnavailableReason;
    }
>;

/** Exact detached evidence for one generated setup-option descriptor. */
export type Civ7SetupOptionEvidenceForDescriptor<Descriptor extends SetupOptionDescriptor> =
  Descriptor extends SetupOptionDescriptor
    ? Civ7SetupOptionEvidence<
        SetupOptionParameterId<Descriptor>,
        SetupOptionValueForDescriptor<Descriptor>
      >
    : never;

/** Descriptor-position-preserving evidence for one requested setup-option tuple. */
export type Civ7SetupOptionEvidenceForDescriptors<
  Descriptors extends readonly SetupOptionDescriptor[],
> = Readonly<{
  [Index in keyof Descriptors]: Descriptors[Index] extends SetupOptionDescriptor
    ? Civ7SetupOptionEvidenceForDescriptor<Descriptors[Index]>
    : never;
}>;

/** Exact ordered option evidence captured for one alive Civ7 player identity. */
export type Civ7PlayerSetupOptionEvidence<
  Descriptors extends readonly Civ7PlayerOptionDescriptor[],
> = Readonly<{
  playerId: number;
  options: Civ7SetupOptionEvidenceForDescriptors<Descriptors>;
}>;

/** Static placement-slot capacity declared by the resolved Civ7 map-info row. */
export type Civ7StartSlotCapacity = Readonly<{
  west: number;
  east: number;
  total: number;
}>;

/**
 * Inputs the SDK has already resolved before Civ7 enters `GenerateMap`.
 *
 * Requested option descriptors retain authored ParameterID identity while declaring the
 * physical configuration key, when any, that can reconstruct the authored value.
 */
export type Civ7MapGenerationSetupCaptureInput<
  MapOptions extends
    readonly SetupOptionDescriptorForGroup<"Map">[] = readonly SetupOptionDescriptorForGroup<"Map">[],
  GameOptions extends
    readonly SetupOptionDescriptorForGroup<"Game">[] = readonly SetupOptionDescriptorForGroup<"Game">[],
  PlayerOptions extends
    readonly SetupOptionDescriptorForGroup<"Player">[] = readonly SetupOptionDescriptorForGroup<"Player">[],
> = Readonly<{
  mapSeed: number;
  dimensions: Readonly<MapDimensions>;
  latitudeBounds: Civ7MapGenerationLatitudeBounds;
  mapSizeId: MapSizeId;
  mapInfo: MapInfo;
  requestedMapOptions: MapOptions;
  requestedGameOptions: GameOptions;
  requestedPlayerOptions: PlayerOptions;
}>;

/** Immutable one-shot evidence captured at the Civ7 `GenerateMap` boundary. */
export type Civ7MapGenerationSetupCapture<
  MapOptions extends
    readonly SetupOptionDescriptorForGroup<"Map">[] = readonly SetupOptionDescriptorForGroup<"Map">[],
  GameOptions extends
    readonly SetupOptionDescriptorForGroup<"Game">[] = readonly SetupOptionDescriptorForGroup<"Game">[],
  PlayerOptions extends
    readonly SetupOptionDescriptorForGroup<"Player">[] = readonly SetupOptionDescriptorForGroup<"Player">[],
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
    map: Civ7SetupOptionEvidenceForDescriptors<MapOptions>;
    game: Civ7SetupOptionEvidenceForDescriptors<GameOptions>;
    /** Player rows preserve the exact order of `aliveMajorPlayerIds`. */
    player: readonly Civ7PlayerSetupOptionEvidence<PlayerOptions>[];
  }>;
}>;

/**
 * Captures Civ7's initial map-generation setup once, synchronously.
 *
 * Required identity fails closed. Contextually unavailable requested options
 * remain explicit evidence instead of being defaulted, inferred, or omitted.
 */
export function captureCiv7MapGenerationSetup<
  const MapOptions extends readonly SetupOptionDescriptorForGroup<"Map">[],
  const GameOptions extends readonly SetupOptionDescriptorForGroup<"Game">[],
  const PlayerOptions extends readonly SetupOptionDescriptorForGroup<"Player">[],
>(
  input: Civ7MapGenerationSetupCaptureInput<MapOptions, GameOptions, PlayerOptions>
): Civ7MapGenerationSetupCapture<MapOptions, GameOptions, PlayerOptions> {
  const mapSeed = requireSignedIntSeed(input.mapSeed, "Civ7 map seed");
  const dimensions = snapshotDimensions(input.dimensions);
  const latitudeBounds = snapshotLatitudeBounds(input.latitudeBounds);
  const mapSizeId = requireMapSizeId(input.mapSizeId);
  const mapInfo = snapshotMapInfo(input.mapInfo);
  const startSlotCapacity = deriveStartSlotCapacity(mapInfo);
  const requestedMapOptions = admitRequestedOptions(
    input.requestedMapOptions,
    CIV7_MAP_OPTION_DESCRIPTORS,
    "Civ7 requested map options"
  );
  const requestedGameOptions = admitRequestedOptions(
    input.requestedGameOptions,
    CIV7_GAME_OPTION_DESCRIPTORS,
    "Civ7 requested game options"
  );
  const requestedPlayerOptions = admitRequestedOptions(
    input.requestedPlayerOptions,
    CIV7_PLAYER_OPTION_DESCRIPTORS,
    "Civ7 requested player options"
  );

  const configuration = readConfigurationRuntime();
  const gameSeed = captureRequiredGameSeed(configuration);
  const aliveMajorPlayerIds = captureAliveMajorPlayerIds();
  const options = Object.freeze({
    map: captureRequestedOptions(configuration?.getMapValue, configuration, requestedMapOptions),
    game: captureRequestedOptions(configuration?.getGameValue, configuration, requestedGameOptions),
    player: captureRequestedPlayerOptions(
      configuration,
      aliveMajorPlayerIds,
      requestedPlayerOptions
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

function requireRuntimeSignedIntSeed(value: unknown, label: string): number {
  if (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > CIV7_SIGNED_INT_SEED_MAX &&
    value <= CIV7_UINT32_MAX
  ) {
    return value - CIV7_UINT32_MODULUS;
  }
  return requireSignedIntSeed(value, label);
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

  const snapshot: Record<string, boolean | number | string | null> = {};
  for (const descriptor of CIV7_MAP_INFO_COLUMN_DESCRIPTORS) {
    const field = value[descriptor.name];
    if (field === undefined) continue;
    if (field === null) {
      if (!descriptor.nullable) {
        throw new TypeError(`Civ7 mapInfo.${descriptor.name} cannot be null.`);
      }
      snapshot[descriptor.name] = null;
      continue;
    }
    if (descriptor.sqlType === "BOOLEAN") {
      if (typeof field !== "boolean") {
        throw new TypeError(`Civ7 mapInfo.${descriptor.name} must be a boolean when present.`);
      }
    } else if (descriptor.sqlType === "INTEGER") {
      if (typeof field !== "number" || !Number.isSafeInteger(field)) {
        throw new TypeError(`Civ7 mapInfo.${descriptor.name} must be a safe integer when present.`);
      }
    } else if (typeof field !== "string") {
      throw new TypeError(`Civ7 mapInfo.${descriptor.name} must be a string when present.`);
    }
    if (
      descriptor.name === "MapSizeType" &&
      (typeof field !== "string" || field.length === 0 || field.trim() !== field)
    ) {
      throw new TypeError(
        "Civ7 mapInfo.MapSizeType must be a non-empty unpadded string when present."
      );
    }
    snapshot[descriptor.name] = field;
  }
  return Object.freeze(snapshot) as Civ7MapInfoSnapshot;
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

function admitRequestedOptions<const Descriptors extends readonly SetupOptionDescriptor[]>(
  value: Descriptors,
  catalog: readonly SetupOptionDescriptor[],
  label: string
): AdmittedSetupOptionDescriptors<Descriptors> {
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array.`);
  const seen = new Set<string>();
  const snapshot: SetupOptionDescriptor[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const element = Object.getOwnPropertyDescriptor(value, String(index));
    if (!element) {
      throw new TypeError(`${label} must not contain sparse entries.`);
    }
    if (!("value" in element)) {
      throw new TypeError(`${label} must contain own data elements, not accessors.`);
    }
    const descriptor: unknown = element.value;
    const admittedDescriptor = catalog.find((candidate) => candidate === descriptor);
    if (!admittedDescriptor) {
      throw new TypeError(`${label} must contain exact generated descriptor identities.`);
    }
    const { parameterId } = admittedDescriptor;
    if (seen.has(parameterId)) {
      throw new TypeError(`${label} must contain unique parameterId values.`);
    }
    seen.add(parameterId);
    snapshot.push(admittedDescriptor);
  }
  // Admission proves an exact dense tuple; cloning prevents caller mutation during runtime reads.
  return Object.freeze(snapshot) as AdmittedSetupOptionDescriptors<Descriptors>;
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
    value = getter.call(
      configuration,
      CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR.authoredValueRead.key
    );
  } catch {
    throw new Error("Civ7 game seed read failed during GenerateMap.");
  }
  // The MapGeneration bridge exposes negative int setup values as their uint32 bit pattern.
  return requireRuntimeSignedIntSeed(value, "Civ7 game seed");
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
    const element = Object.getOwnPropertyDescriptor(observed, String(index));
    if (!element) {
      throw new TypeError("Civ7 alive-major player ids must not contain sparse entries.");
    }
    if (!("value" in element)) {
      throw new TypeError(
        "Civ7 alive-major player ids must contain own data elements, not accessors."
      );
    }
    const playerId: unknown = element.value;
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

function captureRequestedPlayerOptions<
  const Descriptors extends readonly Civ7PlayerOptionDescriptor[],
>(
  configuration: Civ7ConfigurationRuntime | undefined,
  playerIds: readonly number[],
  descriptors: Descriptors
): readonly Civ7PlayerSetupOptionEvidence<Descriptors>[] {
  return Object.freeze(
    playerIds.map((playerId): Civ7PlayerSetupOptionEvidence<Descriptors> => {
      let playerConfiguration: Civ7PlayerConfigurationRuntime | undefined;
      let getValue: ((key: string) => unknown) | undefined;
      if (typeof configuration?.getPlayer === "function") {
        try {
          const observed = configuration.getPlayer.call(configuration, playerId);
          if (observed !== null && typeof observed === "object") {
            playerConfiguration = observed as Civ7PlayerConfigurationRuntime;
            getValue = playerConfiguration.getValue;
          }
        } catch {
          getValue = () => {
            throw new Error("Civ7 player setup read failed.");
          };
        }
      }
      return Object.freeze({
        playerId,
        options: captureRequestedOptions(getValue, playerConfiguration, descriptors),
      });
    })
  );
}

function captureRequestedOptions<const Descriptors extends readonly SetupOptionDescriptor[]>(
  getter: ((key: string) => unknown) | undefined,
  receiver: object | undefined,
  descriptors: Descriptors
): Civ7SetupOptionEvidenceForDescriptors<Descriptors> {
  const evidence = descriptors.map((descriptor): Civ7SetupOptionEvidence => {
    const key = descriptor.parameterId;
    if (descriptor.authoredValueRead.kind !== "configuration") {
      return Object.freeze({
        status: "unavailable",
        key,
        reason: descriptor.authoredValueRead.reason,
      });
    }
    if (typeof getter !== "function") {
      return Object.freeze({
        status: "unavailable",
        key,
        reason: "configuration-api-unavailable",
      });
    }

    let observed: unknown;
    try {
      observed = getter.call(receiver, descriptor.authoredValueRead.key);
    } catch {
      return Object.freeze({ status: "unavailable", key, reason: "read-failed" });
    }
    if (observed === undefined) {
      return Object.freeze({ status: "unavailable", key, reason: "value-unavailable" });
    }
    const snapshot = snapshotSetupOptionValue(observed, descriptor);
    return snapshot.ok
      ? Object.freeze({ status: "available", key, value: snapshot.value })
      : Object.freeze({ status: "unavailable", key, reason: "value-not-snapshotable" });
  });
  // Array.map preserves the admitted tuple's order and cardinality; freezing seals that evidence.
  return Object.freeze(evidence) as Civ7SetupOptionEvidenceForDescriptors<Descriptors>;
}

function snapshotSetupOptionValue(
  value: unknown,
  descriptor: SetupOptionDescriptor
): Readonly<{ ok: true; value: Civ7SetupOptionValue }> | Readonly<{ ok: false }> {
  if (descriptor.cardinality === "array") {
    if (
      descriptor.valueKind !== "string" ||
      !Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Array.prototype
    ) {
      return { ok: false };
    }
    const snapshot: string[] = [];
    for (let index = 0; index < value.length; index += 1) {
      const element = Object.getOwnPropertyDescriptor(value, String(index));
      if (!element || !("value" in element) || typeof element.value !== "string") {
        return { ok: false };
      }
      snapshot.push(element.value);
    }
    if (Reflect.ownKeys(value).some((key) => key !== "length" && !isArrayIndex(key))) {
      return { ok: false };
    }
    return { ok: true, value: Object.freeze(snapshot) };
  }

  if (descriptor.valueKind === "boolean") {
    return typeof value === "boolean" ? { ok: true, value } : { ok: false };
  }
  if (descriptor.valueKind === "integer") {
    return typeof value === "number" && Number.isSafeInteger(value)
      ? { ok: true, value }
      : { ok: false };
  }
  return typeof value === "string" ? { ok: true, value } : { ok: false };
}

function isArrayIndex(key: PropertyKey): boolean {
  if (typeof key !== "string" || key === "") return false;
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && index < 0xffff_ffff && String(index) === key;
}
