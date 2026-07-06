import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DependencyTagDefinition, TagOwner } from "@swooper/mapgen-core/engine";
import { artifacts as placementArtifacts } from "./stages/placement/artifacts/index.js";
import type { PlacementInputsV1 } from "./stages/placement/artifacts/placement-inputs.artifact.js";
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

export const CANONICAL_FIELD_AND_ENGINE_TAGS: ReadonlySet<string> = new Set([
  ...Object.values(FIELD_DEPENDENCY_TAGS.field),
  ...Object.values(STANDARD_ENGINE_EFFECT_TAGS.engine),
]);

const VERIFIED_EFFECT_TAGS = new Set<string>([
  STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied,
  STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied,
]);

const EFFECT_OWNERS: Record<string, TagOwner> = {
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

type SatisfactionState = {
  satisfied: ReadonlySet<string>;
};

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
  ...Object.values(MAP_PROJECTION_EFFECT_TAGS.map).map((id) => {
    const definition: DependencyTagDefinition<ExtendedMapContext> = {
      id,
      kind: "effect",
    };
    const owner = EFFECT_OWNERS[id];
    if (owner) {
      definition.owner = owner;
    }
    return definition;
  }),
  ...Object.values(PLACEMENT_PRODUCT_EFFECT_TAGS.placement).map((id) => {
    const definition: DependencyTagDefinition<ExtendedMapContext> = {
      id,
      kind: "effect",
    };
    const owner = EFFECT_OWNERS[id];
    if (owner) {
      definition.owner = owner;
    }
    return definition;
  }),
  ...Object.values(STANDARD_ENGINE_EFFECT_TAGS.engine).map((id) => {
    const definition: DependencyTagDefinition<ExtendedMapContext> = {
      id,
      kind: "effect",
    };
    const owner = EFFECT_OWNERS[id];
    if (owner) {
      definition.owner = owner;
    }
    if (VERIFIED_EFFECT_TAGS.has(id)) {
      if (id === STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied) {
        definition.satisfies = (context, state) => isPlacementOutputSatisfied(context, state);
      } else {
        definition.satisfies = (context) => context.adapter.verifyEffect(id);
      }
    }
    return definition;
  }),
];

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
  if (!outputs || typeof outputs !== "object") return false;
  const candidate = outputs as PlacementOutputsV1;

  const counts = [
    candidate.naturalWondersCount,
    candidate.resourcesCount,
    candidate.startsAssigned,
    candidate.discoveriesCount,
  ];
  if (!counts.every((value) => Number.isFinite(value) && value >= 0)) return false;
  if (!Number.isInteger(candidate.startsAssigned)) return false;

  const inputs = context.artifacts.get(placementArtifacts.placementInputs.id);
  if (inputs && typeof inputs === "object") {
    const candidates = inputs as PlacementInputsV1;
    const expectedPlayers =
      (candidates.starts?.playersLandmass1 ?? 0) + (candidates.starts?.playersLandmass2 ?? 0);
    if (expectedPlayers > 0 && candidate.startsAssigned < expectedPlayers) return false;
  }

  return true;
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
