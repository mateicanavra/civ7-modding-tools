import {
  type Civ7StandardMapSizeId,
  type Civ7StandardMapSizePreset,
  createMockAdapter,
  getCiv7StandardMapSizePreset,
  type MapInfo,
  type MockAdapter,
} from "@civ7/adapter";
import { admitMapSetup, createMapContext, type MapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import {
  admitStandardMapConfig,
  type StandardMapConfigEnvelope,
} from "../../../../src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../../../src/maps/configs/swooper-earthlike.config.json";
import standardRecipe, {
  type StandardRecipeConfig,
} from "../../../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../../../src/recipes/standard/runtime.js";

type StandardRecipeExecutionOptions = NonNullable<Parameters<typeof standardRecipe.run>[2]>;
type StandardRecipeTestMapInfoOverrides = Partial<
  Pick<
    MapInfo,
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
  mapInfo: MapInfo;
  seed: number;
}>;

/** Inputs exposed to narrowly scoped setup performed immediately before recipe execution. */
export type StandardRecipeTestPreparation<TAdapter extends MockAdapter = MockAdapter> = Readonly<{
  preset: Civ7StandardMapSizePreset;
  context: MapContext;
  adapter: TAdapter;
}>;

type StandardRecipeTestBaseOptions = Readonly<{
  presetId?: Civ7StandardMapSizeId;
  seed: number;
  mapConfig?: StandardMapConfigEnvelope;
  recipeConfig?: StandardRecipeConfig;
  mapInfo?: StandardRecipeTestMapInfoOverrides;
  execution?: StandardRecipeExecutionOptions;
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
    createAdapter: ({ preset, mapInfo, seed }) =>
      createMockAdapter({
        ...preset.dimensions,
        mapInfo,
        mapSizeId: preset.id,
        rng: createLabelRng(seed),
      }),
  });
}

function runStandardRecipeTestMapWithAdapter<TAdapter extends MockAdapter>(
  options: StandardRecipeTestOptionsWithAdapter<TAdapter>
): StandardRecipeTestPreparation<TAdapter> {
  const preset = getCiv7StandardMapSizePreset(options.presetId ?? "MAPSIZE_TINY");
  const mapConfig = options.mapConfig ?? standardMapConfig;
  const mapInfo: MapInfo = {
    ...preset.mapInfo,
    ...options.mapInfo,
    GridWidth: preset.dimensions.width,
    GridHeight: preset.dimensions.height,
    MinLatitude: mapConfig.latitudeBounds.bottomLatitude,
    MaxLatitude: mapConfig.latitudeBounds.topLatitude,
  };
  const setup = admitMapSetup({
    mapSeed: options.seed,
    dimensions: preset.dimensions,
    latitudeBounds: mapConfig.latitudeBounds,
  });
  const adapter = options.createAdapter({ preset, mapInfo, seed: options.seed });
  const context = createMapContext({ setup, adapter });
  initializeStandardRuntime(context, {
    mapInfo,
    logPrefix: "[standard-product-test]",
  });
  const preparation = { preset, context, adapter } as const;
  options.prepare?.(preparation);
  standardRecipe.run(context, options.recipeConfig ?? mapConfig.config, {
    log: () => {},
    ...options.execution,
  });
  return preparation;
}
