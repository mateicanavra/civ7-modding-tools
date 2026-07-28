import {
  type Civ7StandardMapSizeId,
  type Civ7StandardMapSizePreset,
  findCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import { assessCiv7SignedIntSeed } from "@civ7/map-policy/setup";
import {
  createStandardInitialSetupInput,
  createUnavailableStandardInitialOptionEvidence,
} from "@swooper/swooper-physics/standard";
import type { StandardMapConfigEnvelope } from "@swooper/swooper-physics/standard/map-config";

const DEFAULT_TEST_MAP_SIZE_ID = "MAPSIZE_TINY" satisfies Civ7StandardMapSizeId;
const DEFAULT_TEST_MAP_SEED = 1234;
const DEFAULT_TEST_GAME_SEED = -1234;
const DECIMAL_INTEGER_PATTERN = /^-?(?:0|[1-9]\d*)$/;

function resolveTestMapSize(): Civ7StandardMapSizePreset {
  const configuredId = process.env.SWOOPER_TEST_MAP_SIZE;
  if (configuredId === undefined) return getCiv7StandardMapSizePreset(DEFAULT_TEST_MAP_SIZE_ID);

  const preset = findCiv7StandardMapSizePreset(configuredId);
  if (preset) return preset;
  throw new Error(
    `SWOOPER_TEST_MAP_SIZE must name a Civ7 standard map-size preset; received ${JSON.stringify(configuredId)}.`
  );
}

function resolveTestSeed(environmentVariable: string, fallback: number): number {
  const configuredSeed = process.env[environmentVariable];
  if (configuredSeed === undefined) return fallback;
  if (!DECIMAL_INTEGER_PATTERN.test(configuredSeed)) {
    throw new Error(
      `${environmentVariable} must be a base-10 integer without coercion; received ${JSON.stringify(configuredSeed)}.`
    );
  }

  const result = assessCiv7SignedIntSeed(Number(configuredSeed));
  if (result.ok) return result.value;
  throw new Error(
    `${environmentVariable} must be a signed 32-bit Civ7 setup seed between ${result.min} and ${result.max}; received ${JSON.stringify(configuredSeed)}.`
  );
}

export const TEST_MAP_SIZE = resolveTestMapSize();
export const TEST_MAP_SEED = resolveTestSeed("SWOOPER_TEST_MAP_SEED", DEFAULT_TEST_MAP_SEED);
export const TEST_GAME_SEED = resolveTestSeed("SWOOPER_TEST_GAME_SEED", DEFAULT_TEST_GAME_SEED);

/** App-local bootstrap for parity tests that need a complete headless Standard setup. */
export function createStandardRecipeTestInitialSetup(options: {
  preset: Civ7StandardMapSizePreset;
  mapSeed: number;
  gameSeed: number;
  aliveMajorPlayerIds: readonly number[];
  mapConfig: StandardMapConfigEnvelope;
}) {
  const mapInfo = {
    ...options.preset.mapInfo,
    MapSizeType: options.preset.id,
    GridWidth: options.preset.dimensions.width,
    GridHeight: options.preset.dimensions.height,
  };
  const startSlotCapacity = {
    west: mapInfo.PlayersLandmass1,
    east: mapInfo.PlayersLandmass2,
    total: mapInfo.PlayersLandmass1 + mapInfo.PlayersLandmass2,
  } as const;

  return createStandardInitialSetupInput({
    mapSeed: options.mapSeed,
    gameSeed: options.gameSeed,
    latitudeBounds: options.mapConfig.latitudeBounds,
    selection: {
      kind: "civ7-preset",
      id: options.preset.id,
      dimensions: options.preset.dimensions,
      mapInfo,
      startSlotCapacity,
    },
    aliveMajorPlayerIds: options.aliveMajorPlayerIds,
    options: createUnavailableStandardInitialOptionEvidence(
      "configuration-api-unavailable",
      options.aliveMajorPlayerIds
    ),
  });
}
