import type {
  Civ7GameOptionDescriptor,
  Civ7MapOptionDescriptor,
  Civ7PlayerOptionDescriptor,
  Civ7SetupOptionEvidence,
  Civ7SetupOptionEvidenceForDescriptors,
  MapInfo,
  MapSizeId,
} from "@civ7/adapter";
import { findCiv7StandardMapSizePreset } from "@civ7/map-policy";
import type { RecipeModule } from "@swooper/mapgen-core/authoring";
import type { PipelineConfig } from "@swooper/mapgen-studio-ui/types";
import standardRecipe, {
  projectStandardInitialSetup,
  STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS,
  STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS,
  STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS,
} from "@swooper/swooper-physics/standard";
import {
  STANDARD_RECIPE_CONFIG_SCHEMA as swooperStandardConfigSchema,
  STANDARD_RECIPE_CONFIG as swooperStandardDefaultConfig,
} from "@swooper/swooper-physics/standard/artifacts";
import type { XSchema } from "typebox/schema";
import type { BrowserRunInitialSetup, BrowserRunSetupOptionValue } from "./protocol";

/** Stable recipe identity accepted by the Studio browser worker. */
export type StudioRecipeId = string;

type BrowserRecipeAdapterSetup = Readonly<{
  mapSeed: number;
  dimensions: Readonly<{ width: number; height: number }>;
  mapSizeId: MapSizeId;
  mapInfo: MapInfo;
  aliveMajorPlayerIds: readonly number[];
}>;

/** Small executable recipe surface required by the browser worker. */
type RecipeRuntimeModule = Readonly<{
  compile: (
    initialSetup: BrowserRunInitialSetup,
    config: PipelineConfig
  ) => ReturnType<RecipeModule<PipelineConfig, unknown>["compile"]>;
  projectAdapterSetup: (
    plan: ReturnType<RecipeModule<PipelineConfig, unknown>["compile"]>
  ) => BrowserRecipeAdapterSetup;
  executeAsync: RecipeModule<PipelineConfig, unknown>["executeAsync"];
}>;

/** Registered browser-worker recipe with its canonical authoring schema and defaults. */
export type RuntimeRecipeEntry = Readonly<{
  id: StudioRecipeId;
  label: string;
  recipe: RecipeRuntimeModule;
  defaultConfig: PipelineConfig;
  configSchema: XSchema;
}>;

function defineRuntimeRecipeEntry<TConfig extends PipelineConfig, TInitialSetupInput>(
  input: Readonly<{
    id: StudioRecipeId;
    label: string;
    recipe: Readonly<{
      compile: (
        initialSetup: TInitialSetupInput,
        config: TConfig
      ) => ReturnType<RecipeModule<TConfig, unknown>["compile"]>;
      executeAsync: RecipeModule<TConfig, unknown>["executeAsync"];
    }>;
    projectInitialSetup: (input: BrowserRunInitialSetup) => TInitialSetupInput;
    projectAdapterSetup: (
      plan: ReturnType<RecipeModule<TConfig, unknown>["compile"]>
    ) => BrowserRecipeAdapterSetup;
    defaultConfig: TConfig;
    configSchema: XSchema;
  }>
): RuntimeRecipeEntry {
  return {
    id: input.id,
    label: input.label,
    defaultConfig: input.defaultConfig,
    configSchema: input.configSchema,
    recipe: {
      compile: (setup, config) =>
        input.recipe.compile(input.projectInitialSetup(setup), config as TConfig),
      projectAdapterSetup: (plan) => input.projectAdapterSetup(plan),
      executeAsync: (context, plan, options) => input.recipe.executeAsync(context, plan, options),
    },
  };
}

type SetupOptionDescriptor =
  | Civ7GameOptionDescriptor
  | Civ7MapOptionDescriptor
  | Civ7PlayerOptionDescriptor;

function projectOptionEvidence<const Descriptors extends readonly SetupOptionDescriptor[]>(
  descriptors: Descriptors,
  values: Readonly<Record<string, BrowserRunSetupOptionValue>>
): Civ7SetupOptionEvidenceForDescriptors<Descriptors> {
  const evidence = descriptors.map((descriptor): Civ7SetupOptionEvidence => {
    const { parameterId } = descriptor;
    if (!Object.hasOwn(values, parameterId)) {
      return Object.freeze({
        status: "unavailable",
        key: parameterId,
        reason: "value-unavailable",
      });
    }
    const value = values[parameterId]!;
    return isSetupOptionValueForDescriptor(value, descriptor)
      ? Object.freeze({ status: "available", key: parameterId, value })
      : Object.freeze({
          status: "unavailable",
          key: parameterId,
          reason: "value-not-snapshotable",
        });
  });
  // Array.map preserves the generated descriptor tuple's order and cardinality.
  return Object.freeze(evidence) as Civ7SetupOptionEvidenceForDescriptors<Descriptors>;
}

function isSetupOptionValueForDescriptor(
  value: BrowserRunSetupOptionValue,
  descriptor: SetupOptionDescriptor
): boolean {
  if (descriptor.cardinality === "array") {
    return Array.isArray(value) && value.every((entry) => typeof entry === "string");
  }
  if (descriptor.valueKind === "boolean") return typeof value === "boolean";
  if (descriptor.valueKind === "integer")
    return typeof value === "number" && Number.isSafeInteger(value);
  return typeof value === "string";
}

function projectStandardBrowserInitialSetup(input: BrowserRunInitialSetup) {
  const preset = findCiv7StandardMapSizePreset(input.mapSizeId);
  if (!preset) {
    throw new TypeError(
      `Standard browser setup requires an official Civ7 map-size id; received ${JSON.stringify(input.mapSizeId)}.`
    );
  }
  return projectStandardInitialSetup({
    mapSeed: input.mapSeed,
    gameSeed: input.gameSeed,
    mapSizeId: input.mapSizeId,
    dimensions: input.dimensions,
    latitudeBounds: input.latitudeBounds,
    mapInfo: preset.mapInfo,
    startSlotCapacity: {
      west: preset.mapInfo.PlayersLandmass1,
      east: preset.mapInfo.PlayersLandmass2,
      total: preset.mapInfo.PlayersLandmass1 + preset.mapInfo.PlayersLandmass2,
    },
    aliveMajorPlayerIds: input.aliveMajorPlayerIds,
    options: {
      map: projectOptionEvidence(STANDARD_INITIAL_MAP_OPTION_DESCRIPTORS, input.options.map),
      game: projectOptionEvidence(STANDARD_INITIAL_GAME_OPTION_DESCRIPTORS, input.options.game),
      player: input.options.player.map(({ playerId, options }) =>
        Object.freeze({
          playerId,
          options: projectOptionEvidence(STANDARD_INITIAL_PLAYER_OPTION_DESCRIPTORS, options),
        })
      ),
    },
  });
}

function projectStandardBrowserAdapterSetup(
  plan: ReturnType<typeof standardRecipe.compile>
): BrowserRecipeAdapterSetup {
  const setup = standardRecipe.inspectPlan(plan).initialSetup.value;
  return Object.freeze({
    mapSeed: setup.map.mapSeed,
    dimensions: setup.map.selection.dimensions,
    mapSizeId: setup.map.selection.id,
    mapInfo: setup.map.selection.mapInfo,
    aliveMajorPlayerIds: setup.aliveMajorPlayerIds,
  });
}

const RUNTIME_RECIPES: readonly RuntimeRecipeEntry[] = [
  defineRuntimeRecipeEntry({
    id: "standard",
    label: "Swooper Maps / Standard",
    recipe: standardRecipe,
    projectInitialSetup: projectStandardBrowserInitialSetup,
    projectAdapterSetup: projectStandardBrowserAdapterSetup,
    defaultConfig: swooperStandardDefaultConfig,
    configSchema: swooperStandardConfigSchema,
  }),
] as const;

/** Resolves the executable browser-worker recipe registered for a Studio recipe identity. */
export function getRuntimeRecipe(recipeId: StudioRecipeId): RuntimeRecipeEntry {
  const entry = RUNTIME_RECIPES.find((r) => r.id === recipeId);
  if (!entry) throw new Error(`Unknown recipeId: ${recipeId}`);
  return entry;
}
