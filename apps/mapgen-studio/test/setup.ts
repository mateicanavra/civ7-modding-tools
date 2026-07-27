import {
  type Civ7StandardMapSizePreset,
  findCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import type { BrowserRunInitialSetup } from "../src/browser-runner/protocol";

const DEFAULT_TEST_MAP_SIZE_ID = "MAPSIZE_TINY";

function resolveTestMapSize(): Civ7StandardMapSizePreset {
  const configuredId = process.env.MAPGEN_STUDIO_TEST_MAP_SIZE;
  if (configuredId === undefined) {
    return getCiv7StandardMapSizePreset(DEFAULT_TEST_MAP_SIZE_ID);
  }

  const preset = findCiv7StandardMapSizePreset(configuredId);
  if (preset) return preset;

  throw new Error(
    `MAPGEN_STUDIO_TEST_MAP_SIZE must name a Civ7 standard map-size preset; received ${JSON.stringify(configuredId)}.`
  );
}

/** Civ7 preset selected for Studio tests whose behavior is map-size-independent. */
export const TEST_MAP_SIZE = resolveTestMapSize();

/** Map-generation seed shared by Studio tests whose behavior is seed-independent. */
export const TEST_MAP_SEED = 1_780_185_340;

/** Gameplay seed shared by Studio tests whose behavior is seed-independent. */
export const TEST_GAME_SEED = 1_780_185_341;

/** Authored latitude bounds shared by Studio tests whose behavior is latitude-independent. */
const TEST_MAP_LATITUDE_BOUNDS = {
  topLatitude: 80,
  bottomLatitude: -80,
} as const;

/** Exact alive-major identities shared by Studio tests that do not exercise player composition. */
const TEST_ALIVE_MAJOR_PLAYER_IDS = [0, 1] as const;

/**
 * Complete portable setup supplied to Standard browser-runner tests.
 *
 * Latitude is explicit authored setup policy rather than a field reconstructed from the official
 * `GameInfo.Maps` row.
 */
export const TEST_BROWSER_RUN_INITIAL_SETUP = {
  mapSeed: TEST_MAP_SEED,
  gameSeed: TEST_GAME_SEED,
  mapSizeId: TEST_MAP_SIZE.id,
  dimensions: TEST_MAP_SIZE.dimensions,
  latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
  aliveMajorPlayerIds: TEST_ALIVE_MAJOR_PLAYER_IDS,
  options: {
    map: {},
    game: {},
    player: TEST_ALIVE_MAJOR_PLAYER_IDS.map((playerId) => ({ playerId, options: {} })),
  },
} as const satisfies BrowserRunInitialSetup;
