import type { MapContext } from "@swooper/mapgen-core";
import type { DependencyTagDefinition, TagOwner } from "@swooper/mapgen-core/engine";
import {
  artifactModules as placementArtifactModules,
  artifacts as placementArtifacts,
} from "./stages/placement/artifacts/index.js";
import type { PlacementOutputsV1 } from "./stages/placement/artifacts/placement-outputs.artifact.js";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "./tag-contracts.js";

export {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "./tag-contracts.js";

type EffectTagOwnerProperties = Pick<DependencyTagDefinition, "owner">;
type EffectTagSatisfiesProperties = Pick<DependencyTagDefinition, "satisfies">;

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
  [MAP_PROJECTION_EFFECT_TAGS.map.rainfallProjected]: {
    pkg: "mod-swooper-maps",
    phase: "hydrology",
    stepId: "project-rainfall",
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

function isCompleteStartAssignment(
  value: unknown
): value is Readonly<{ seats: readonly unknown[]; assigned: number; unseatedCount: number }> {
  return (
    isRecord(value) &&
    Array.isArray(value.seats) &&
    isNonNegativeInteger(value.assigned) &&
    isNonNegativeInteger(value.unseatedCount)
  );
}

/**
 * Runtime definitions for every Standard effect tag. Effects carry declared owners and use
 * adapter/artifact verification where completion cannot be trusted by name; data dependencies
 * are registered by their step-owned artifact modules instead of this catalog.
 */
export const STANDARD_TAG_DEFINITIONS: readonly DependencyTagDefinition[] = [
  ...Object.values(MAP_PROJECTION_EFFECT_TAGS.map).map(effectTagDefinition),
  ...Object.values(PLACEMENT_PRODUCT_EFFECT_TAGS.placement).map(effectTagDefinition),
  ...Object.values(STANDARD_ENGINE_EFFECT_TAGS.engine).map(standardEngineEffectTagDefinition),
];

/** Registers the complete Standard dependency-tag vocabulary with the supplied recipe registry. */
export function registerStandardTags(registry: {
  registerTags: (definitions: readonly DependencyTagDefinition[]) => void;
}): void {
  registry.registerTags(STANDARD_TAG_DEFINITIONS);
}

function isPlacementOutputSatisfied(context: MapContext, state: SatisfactionState): boolean {
  if (!state.satisfied.has(STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied)) return false;

  const outputs = context.artifacts.get(placementArtifacts.placementOutputs.id);
  if (!isPlacementOutputsV1(outputs)) return false;
  const candidate = outputs;

  const assignment = context.artifacts.get(placementArtifacts.startAssignment.id);
  if (placementArtifactModules.startAssignment.validate(assignment).length > 0) return false;
  if (!isCompleteStartAssignment(assignment)) return false;
  return (
    assignment.assigned === assignment.seats.length &&
    assignment.unseatedCount === 0 &&
    candidate.startsAssigned === assignment.assigned
  );
}

function effectTagDefinition(id: string): DependencyTagDefinition {
  return {
    id,
    kind: "effect",
    ...EFFECT_OWNER_PROPERTIES[id],
  };
}

function standardEngineEffectTagDefinition(id: string): DependencyTagDefinition {
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

function isNonNegativeInteger(value: unknown): value is number {
  if (typeof value !== "number") return false;
  if (!Number.isInteger(value) || value < 0) return false;
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
