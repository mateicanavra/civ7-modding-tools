import { createMockAdapter, type MockAdapter } from "@civ7/adapter";
import {
  type Civ7MapInfo,
  type Civ7StandardMapInfo,
  type Civ7StandardMapSizeId,
  type Civ7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
} from "@civ7/map-policy";
import { createMapContext, type MapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import {
  admitStandardMapConfig,
  type StandardMapConfigEnvelope,
} from "../../../../src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../../../src/maps/configs/swooper-earthlike.config.json";
import {
  createStandardInitialSetupInput,
  createUnavailableStandardInitialOptionEvidence,
  type StandardInitialSetupInput,
} from "../../../../src/recipes/standard/initial-setup.js";
import standardRecipe, {
  type StandardRecipeConfig,
} from "../../../../src/recipes/standard/recipe.js";
import {
  TEST_ALIVE_MAJOR_PLAYER_IDS,
  TEST_GAME_SEED,
  TEST_MAP_SEED,
  TEST_MAP_SIZE,
} from "../../../setup.js";

type StandardRecipeExecutionOptions = NonNullable<Parameters<typeof standardRecipe.execute>[2]>;
type StandardRecipeTestMapInfoOverrides = Partial<
  Pick<
    Civ7MapInfo,
    | "NumNaturalWonders"
    | "LakeGenerationFrequency"
    | "PlayersLandmass1"
    | "PlayersLandmass2"
    | "StartSectorRows"
    | "StartSectorCols"
  >
>;

/** Canonical admitted Earthlike configuration shared by Standard recipe product tests. */
export const standardMapConfig = admitStandardMapConfig(swooperEarthlikeConfigRaw);

/** Fresh mutable recipe configuration for tests that exercise one authored Standard knob. */
export function createStandardRecipeTestConfig(): StandardRecipeConfig {
  return structuredClone(standardMapConfig.config) as StandardRecipeConfig;
}

/** Inputs exposed to a product test that needs a specialized Civ7 adapter double. */
export type StandardRecipeTestAdapterInput = Readonly<{
  preset: Civ7StandardMapSizePreset;
  mapInfo: Civ7MapInfo;
  mapSeed: number;
  gameSeed: number;
  aliveMajorPlayerIds: readonly number[];
}>;

/** Inputs exposed to narrowly scoped setup performed immediately before recipe execution. */
export type StandardRecipeTestPreparation<TAdapter extends MockAdapter = MockAdapter> = Readonly<{
  preset: Civ7StandardMapSizePreset;
  context: MapContext;
  adapter: TAdapter;
}>;

type StandardRecipeTestBaseOptions = Readonly<{
  presetId?: Civ7StandardMapSizeId;
  mapSeed?: number;
  gameSeed?: number;
  aliveMajorPlayerIds?: readonly number[];
  mapConfig?: StandardMapConfigEnvelope;
  recipeConfig?: StandardRecipeConfig;
  mapInfo?: StandardRecipeTestMapInfoOverrides;
  execution?: StandardRecipeExecutionOptions;
}>;

/** Explicit axes accepted by the shared Standard test setup producer. */
export type StandardRecipeTestInitialSetupOptions = Readonly<{
  preset?: Civ7StandardMapSizePreset;
  mapSeed?: number;
  gameSeed?: number;
  aliveMajorPlayerIds?: readonly number[];
  mapConfig?: StandardMapConfigEnvelope;
  mapInfo?: StandardRecipeTestMapInfoOverrides;
}>;

/**
 * One canonical Standard recipe test run using the ordinary mock adapter.
 *
 * `mapConfig` owns the complete admitted map identity and latitude bounds. `recipeConfig` is an
 * explicit causal override of recipe knobs for a focused product test; it never replaces setup.
 */
export type StandardRecipeTestOptions = StandardRecipeTestBaseOptions &
  Readonly<{
    createAdapter?: never;
    prepare?: (input: StandardRecipeTestPreparation) => void;
  }>;

/** A Standard recipe test run whose required factory preserves a specialized adapter subtype. */
export type StandardRecipeTestOptionsWithAdapter<TAdapter extends MockAdapter> =
  StandardRecipeTestBaseOptions &
    Readonly<{
      createAdapter: (input: StandardRecipeTestAdapterInput) => TAdapter;
      prepare?: (input: StandardRecipeTestPreparation<TAdapter>) => void;
    }>;

/**
 * Runs one Standard recipe product case against a canonical Civ7 map-size preset.
 *
 * The helper owns setup admission, adapter defaults, runtime initialization, and the single recipe
 * invocation so whole-recipe tests cannot accidentally certify map dimensions Civ7 never ships.
 * Specialized adapters and pre-run preparation remain explicit escape hatches for observable engine
 * behavior such as cache invalidation; operation, step, and artifact tests should not use this helper.
 */
export function runStandardRecipeTestMap(
  options: StandardRecipeTestOptions
): StandardRecipeTestPreparation;
export function runStandardRecipeTestMap<TAdapter extends MockAdapter>(
  options: StandardRecipeTestOptionsWithAdapter<TAdapter>
): StandardRecipeTestPreparation<TAdapter>;
export function runStandardRecipeTestMap<TAdapter extends MockAdapter>(
  options: StandardRecipeTestOptions | StandardRecipeTestOptionsWithAdapter<TAdapter>
): StandardRecipeTestPreparation | StandardRecipeTestPreparation<TAdapter> {
  if (options.createAdapter) return runStandardRecipeTestMapWithAdapter(options);
  return runStandardRecipeTestMapWithAdapter({
    ...options,
    createAdapter: ({ preset, mapInfo, mapSeed, aliveMajorPlayerIds }) =>
      createMockAdapter({
        ...preset.dimensions,
        mapInfo,
        mapSizeId: preset.id,
        aliveMajorPlayerIds,
        rng: createLabelRng(mapSeed),
      }),
  });
}

function runStandardRecipeTestMapWithAdapter<TAdapter extends MockAdapter>(
  options: StandardRecipeTestOptionsWithAdapter<TAdapter>
): StandardRecipeTestPreparation<TAdapter> {
  const preset = getCiv7StandardMapSizePreset(options.presetId ?? TEST_MAP_SIZE.id);
  const resolved = resolveStandardRecipeTestSetup({
    preset,
    mapSeed: options.mapSeed,
    gameSeed: options.gameSeed,
    aliveMajorPlayerIds: options.aliveMajorPlayerIds,
    mapConfig: options.mapConfig,
    mapInfo: options.mapInfo,
  });
  const recipeConfig = options.recipeConfig ?? resolved.mapConfig.config;
  const plan = standardRecipe.compile(resolved.initialSetup, recipeConfig);
  const adapter = options.createAdapter({
    preset,
    mapInfo: resolved.mapInfo,
    mapSeed: resolved.mapSeed,
    gameSeed: resolved.gameSeed,
    aliveMajorPlayerIds: resolved.aliveMajorPlayerIds,
  });
  const context = createMapContext({ setup: plan.setup, adapter });
  const preparation = { preset, context, adapter } as const;
  options.prepare?.(preparation);
  standardRecipe.execute(context, plan, {
    log: () => {},
    ...options.execution,
  });
  return preparation;
}

/**
 * Constructs explicit Standard setup evidence for focused tests without duplicating admission.
 *
 * A map-info override intentionally selects Standard's custom-map branch while retaining a real
 * Civ7 preset's physical dimensions. `STANDARD_INITIAL_SETUP` remains the sole authority that
 * admits dimensions, seeds, player identities, map facts, and capacity relationships.
 */
export function createStandardRecipeTestInitialSetup(
  options: StandardRecipeTestInitialSetupOptions = {}
): StandardInitialSetupInput {
  return resolveStandardRecipeTestSetup(options).initialSetup;
}

function resolveStandardRecipeTestSetup(options: StandardRecipeTestInitialSetupOptions) {
  const preset = options.preset ?? TEST_MAP_SIZE;
  const mapSeed = options.mapSeed ?? TEST_MAP_SEED;
  const gameSeed = options.gameSeed ?? TEST_GAME_SEED;
  const aliveMajorPlayerIds = options.aliveMajorPlayerIds ?? TEST_ALIVE_MAJOR_PLAYER_IDS;
  const mapConfig = options.mapConfig ?? standardMapConfig;
  const mapInfo = resolveStandardRecipeTestMapInfo(preset, options.mapInfo);
  const startSlotCapacity = {
    west: mapInfo.PlayersLandmass1,
    east: mapInfo.PlayersLandmass2,
    total: mapInfo.PlayersLandmass1 + mapInfo.PlayersLandmass2,
  } as const;
  const selection =
    options.mapInfo === undefined
      ? ({
          kind: "civ7-preset",
          id: preset.id,
          dimensions: preset.dimensions,
          mapInfo,
          startSlotCapacity,
        } as const)
      : ({
          kind: "custom",
          id: `test-custom:${preset.id}`,
          dimensions: preset.dimensions,
          mapInfo,
          startSlotCapacity,
        } as const);
  const initialSetup = createStandardInitialSetupInput({
    mapSeed,
    gameSeed,
    latitudeBounds: mapConfig.latitudeBounds,
    selection,
    aliveMajorPlayerIds,
    options: createUnavailableStandardInitialOptionEvidence(
      "configuration-api-unavailable",
      aliveMajorPlayerIds
    ),
  });
  return {
    initialSetup,
    preset,
    mapSeed,
    gameSeed,
    aliveMajorPlayerIds,
    mapConfig,
    mapInfo,
  } as const;
}

function resolveStandardRecipeTestMapInfo(
  preset: Civ7StandardMapSizePreset,
  overrides: StandardRecipeTestMapInfoOverrides | undefined
): Civ7StandardMapInfo {
  return {
    ...preset.mapInfo,
    MapSizeType: preset.id,
    GridWidth: preset.dimensions.width,
    GridHeight: preset.dimensions.height,
    NumNaturalWonders: overrides?.NumNaturalWonders ?? preset.mapInfo.NumNaturalWonders,
    LakeGenerationFrequency:
      overrides?.LakeGenerationFrequency ?? preset.mapInfo.LakeGenerationFrequency,
    PlayersLandmass1: overrides?.PlayersLandmass1 ?? preset.mapInfo.PlayersLandmass1,
    PlayersLandmass2: overrides?.PlayersLandmass2 ?? preset.mapInfo.PlayersLandmass2,
    StartSectorRows: overrides?.StartSectorRows ?? preset.mapInfo.StartSectorRows,
    StartSectorCols: overrides?.StartSectorCols ?? preset.mapInfo.StartSectorCols,
  };
}
