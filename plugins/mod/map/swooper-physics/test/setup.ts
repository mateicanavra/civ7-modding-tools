import {
  type Civ7StandardMapSizeId,
  type Civ7StandardMapSizePreset,
  findCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import { assessCiv7SignedIntSeed } from "@civ7/map-policy/setup";
import { createLabelRng } from "@swooper/mapgen-core";

const DEFAULT_TEST_MAP_SIZE_ID = "MAPSIZE_TINY" satisfies Civ7StandardMapSizeId;
const DEFAULT_TEST_MAP_SEED = 1234;
const DEFAULT_TEST_GAME_SEED = -1234;
const DECIMAL_INTEGER_PATTERN = /^-?(?:0|[1-9]\d*)$/;

function resolveTestMapSize(): Civ7StandardMapSizePreset {
  const configuredId = process.env.SWOOPER_TEST_MAP_SIZE;
  if (configuredId === undefined) {
    return getCiv7StandardMapSizePreset(DEFAULT_TEST_MAP_SIZE_ID);
  }

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

/** Civ7 preset selected for map-size-independent Swooper behavior tests. */
export const TEST_MAP_SIZE = resolveTestMapSize();

/** Authored latitude override shared by tests whose behavior does not depend on latitude. */
export const TEST_MAP_LATITUDE_BOUNDS = {
  topLatitude: 60,
  bottomLatitude: -60,
} as const;

/** Map-generation seed shared by tests whose behavior does not depend on a particular seed. */
export const TEST_MAP_SEED = resolveTestSeed("SWOOPER_TEST_MAP_SEED", DEFAULT_TEST_MAP_SEED);

/** Civ7 game seed shared by launch tests whose behavior does not depend on a particular seed. */
export const TEST_GAME_SEED = resolveTestSeed("SWOOPER_TEST_GAME_SEED", DEFAULT_TEST_GAME_SEED);

/**
 * Derives an operation-local fixture seed from the suite map seed and a stable semantic label.
 *
 * This mirrors the first labeled draw made by `ctxStepSeed`: operation tests receive the same
 * nonnegative signed-int seed range as recipe execution without treating the map seed itself as
 * an already-derived operation seed.
 */
export function deriveTestOperationSeed(label: string): number {
  return createLabelRng(TEST_MAP_SEED)(2_147_483_647, label);
}

/**
 * Exact ordered alive-major identities shared by tests that do not exercise player composition.
 *
 * These are explicit player identities, not a count-derived slot synthesis.
 */
export const TEST_ALIVE_MAJOR_PLAYER_IDS = [0, 1] as const;
