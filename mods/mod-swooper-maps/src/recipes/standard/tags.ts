import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DependencyTagDefinition, TagOwner } from "@swooper/mapgen-core/engine";
import { artifacts as placementArtifacts } from "./stages/placement/artifacts/index.js";
import type { PlacementOutputsV1 } from "./stages/placement/artifacts/placement-outputs.artifact.js";
import {
  FIELD_DEPENDENCY_TAGS,
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "./tag-contracts.js";

export {
  FIELD_DEPENDENCY_TAGS,
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "./tag-contracts.js";

/** Canonical field and engine tag identities exposed for dependency-policy comparisons. */
export const CANONICAL_FIELD_AND_ENGINE_TAGS: ReadonlySet<string> = new Set([
  ...Object.values(FIELD_DEPENDENCY_TAGS.field),
  ...Object.values(STANDARD_ENGINE_EFFECT_TAGS.engine),
]);

type EffectTagOwnerProperties = Pick<DependencyTagDefinition<ExtendedMapContext>, "owner">;
type EffectTagSatisfiesProperties = Pick<DependencyTagDefinition<ExtendedMapContext>, "satisfies">;

const VERIFIED_EFFECT_SATISFIES: Partial<Record<string, EffectTagSatisfiesProperties>> = {
  [STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied]: {
    satisfies: (context) =>
      context.adapter.verifyEffect(STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied),
  },
  [STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied]: {
    satisfies: (context, state) => isPlacementOutputSatisfied(context, state),
  },
};

const EFFECT_OWNERS: Partial<Record<string, TagOwner>> = {
  [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted]: {
    pkg: "mod-swooper-maps",
    phase: "morphology",
    stepId: "plot-coasts",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted]: {
    pkg: "mod-swooper-maps",
    phase: "morphology",
    stepId: "plot-continents",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.mountainsPlotted]: {
    pkg: "mod-swooper-maps",
    phase: "morphology",
    stepId: "plot-mountains",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.volcanoesPlotted]: {
    pkg: "mod-swooper-maps",
    phase: "morphology",
    stepId: "plot-volcanoes",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt]: {
    pkg: "mod-swooper-maps",
    phase: "morphology",
    stepId: "build-elevation",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.landmassRegionsPlotted]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "plot-landmass-regions",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.lakesPlotted]: {
    pkg: "mod-swooper-maps",
    phase: "hydrology",
    stepId: "lakes",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.elevationParityCaptured]: {
    pkg: "mod-swooper-maps",
    phase: "morphology",
    stepId: "build-elevation",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.hydrologyLakesParityCaptured]: {
    pkg: "mod-swooper-maps",
    phase: "hydrology",
    stepId: "lakes",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.riversParityCaptured]: {
    pkg: "mod-swooper-maps",
    phase: "hydrology",
    stepId: "plot-rivers",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted]: {
    pkg: "mod-swooper-maps",
    phase: "hydrology",
    stepId: "plot-rivers",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.ecologyBiomesParityCaptured]: {
    pkg: "mod-swooper-maps",
    phase: "ecology",
    stepId: "plot-biomes",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.ecologyFeaturesParityCaptured]: {
    pkg: "mod-swooper-maps",
    phase: "ecology",
    stepId: "features-apply",
  },
  [MAP_PROJECTION_EFFECT_TAGS.map.placementParityCaptured]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "placement",
  },
  [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "place-natural-wonders",
  },
  [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "prepare-placement-surface",
  },
  [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "plan-resources",
  },
  [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesAdjusted]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "adjust-resources",
  },
  [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "place-resources",
  },
  [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "assign-starts",
  },
  [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "place-discoveries",
  },
  [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "assign-advanced-starts",
  },
  [STANDARD_ENGINE_EFFECT_TAGS.engine.riversModeled]: {
    pkg: "mod-swooper-maps",
    phase: "hydrology",
    stepId: "plot-rivers",
  },
  [STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied]: {
    pkg: "mod-swooper-maps",
    phase: "ecology",
    stepId: "plot-biomes",
  },
  [STANDARD_ENGINE_EFFECT_TAGS.engine.featuresApplied]: {
    pkg: "mod-swooper-maps",
    phase: "ecology",
    stepId: "features-apply",
  },
  [STANDARD_ENGINE_EFFECT_TAGS.engine.plotEffectsApplied]: {
    pkg: "mod-swooper-maps",
    phase: "ecology",
    stepId: "plot-effects",
  },
  [STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied]: {
    pkg: "mod-swooper-maps",
    phase: "placement",
    stepId: "placement",
  },
};

const EFFECT_OWNER_PROPERTIES: Partial<Record<string, EffectTagOwnerProperties>> =
  Object.fromEntries(Object.entries(EFFECT_OWNERS).map(([id, owner]) => [id, { owner }]));

type SatisfactionState = {
  satisfied: ReadonlySet<string>;
};

/**
 * Runtime definitions for every Standard field and effect tag. Field tags
 * verify map-tile-sized typed arrays; effect tags carry declared owners and use
 * adapter/artifact verification where completion cannot be trusted by name.
 */
export const STANDARD_TAG_DEFINITIONS: readonly DependencyTagDefinition<ExtendedMapContext>[] = [
  {
    id: FIELD_DEPENDENCY_TAGS.field.terrainType,
    kind: "field",
    satisfies: (context) => isUint8Array(context.fields?.terrainType, getExpectedSize(context)),
    demo: new Uint8Array(0),
    validateDemo: (demo) => isUint8Array(demo),
  },
  {
    id: FIELD_DEPENDENCY_TAGS.field.elevation,
    kind: "field",
    satisfies: (context) => isInt16Array(context.fields?.elevation, getExpectedSize(context)),
    demo: new Int16Array(0),
    validateDemo: (demo) => isInt16Array(demo),
  },
  {
    id: FIELD_DEPENDENCY_TAGS.field.rainfall,
    kind: "field",
    satisfies: (context) => isUint8Array(context.fields?.rainfall, getExpectedSize(context)),
    demo: new Uint8Array(0),
    validateDemo: (demo) => isUint8Array(demo),
  },
  {
    id: FIELD_DEPENDENCY_TAGS.field.biomeId,
    kind: "field",
    satisfies: (context) => isUint8Array(context.fields?.biomeId, getExpectedSize(context)),
    demo: new Uint8Array(0),
    validateDemo: (demo) => isUint8Array(demo),
  },
  {
    id: FIELD_DEPENDENCY_TAGS.field.featureType,
    kind: "field",
    satisfies: (context) => isInt16Array(context.fields?.featureType, getExpectedSize(context)),
    demo: new Int16Array(0),
    validateDemo: (demo) => isInt16Array(demo),
  },
  ...Object.values(MAP_PROJECTION_EFFECT_TAGS.map).map(effectTagDefinition),
  ...Object.values(PLACEMENT_PRODUCT_EFFECT_TAGS.placement).map(effectTagDefinition),
  ...Object.values(STANDARD_ENGINE_EFFECT_TAGS.engine).map(standardEngineEffectTagDefinition),
];

/** Registers the complete Standard dependency-tag vocabulary with the supplied recipe registry. */
export function registerStandardTags(registry: {
  registerTags: (definitions: readonly DependencyTagDefinition<ExtendedMapContext>[]) => void;
}): void {
  registry.registerTags(STANDARD_TAG_DEFINITIONS);
}

function isPlacementOutputSatisfied(
  context: ExtendedMapContext,
  state: SatisfactionState
): boolean {
  if (!state.satisfied.has(STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied)) return false;

  const outputs = context.artifacts.get(placementArtifacts.placementOutputs.id);
  if (!isPlacementOutputsV1(outputs)) return false;
  const candidate = outputs;

  const inputs = context.artifacts.get(placementArtifacts.placementInputs.id);
  const expectedPlayers = getExpectedPlayers(inputs);
  if (expectedPlayers > 0 && candidate.startsAssigned < expectedPlayers) return false;

  return true;
}

function effectTagDefinition(id: string): DependencyTagDefinition<ExtendedMapContext> {
  return {
    id,
    kind: "effect",
    ...EFFECT_OWNER_PROPERTIES[id],
  };
}

function standardEngineEffectTagDefinition(
  id: string
): DependencyTagDefinition<ExtendedMapContext> {
  return {
    ...effectTagDefinition(id),
    ...VERIFIED_EFFECT_SATISFIES[id],
  };
}

function isPlacementOutputsV1(value: unknown): value is PlacementOutputsV1 {
  return (
    isRecord(value) &&
    isNonNegativeInteger(value.naturalWondersCount) &&
    isNonNegativeInteger(value.resourcesCount) &&
    isNonNegativeInteger(value.startsAssigned) &&
    isNonNegativeInteger(value.discoveriesCount)
  );
}

function getExpectedPlayers(value: unknown): number {
  if (!isRecord(value) || !isRecord(value.starts)) return 0;
  return countOrZero(value.starts.playersLandmass1) + countOrZero(value.starts.playersLandmass2);
}

function countOrZero(value: unknown): number {
  if (typeof value !== "number") return 0;
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

function isNonNegativeInteger(value: unknown): value is number {
  if (typeof value !== "number") return false;
  if (!Number.isInteger(value) || value < 0) return false;
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getExpectedSize(context: ExtendedMapContext): number {
  return context.dimensions.width * context.dimensions.height;
}

function isUint8Array(value: unknown, expectedSize?: number): value is Uint8Array {
  if (!(value instanceof Uint8Array)) return false;
  if (expectedSize == null) return true;
  return value.length === expectedSize;
}

function isInt16Array(value: unknown, expectedSize?: number): value is Int16Array {
  if (!(value instanceof Int16Array)) return false;
  if (expectedSize == null) return true;
  return value.length === expectedSize;
}
