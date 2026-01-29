import { collectCompileOps, createRecipe, type CompiledRecipeConfigOf, type RecipeConfigInputOf } from "@swooper/mapgen-core/authoring";
import foundationDomain from "@mapgen/domain/foundation/ops";

import foundation from "../standard/stages/foundation/index.js";
import { STANDARD_TAG_DEFINITIONS } from "../standard/tags.js";

const NAMESPACE = "mod-swooper-maps";
const stages = [foundation] as const;

export type FoundationRecipeConfig = RecipeConfigInputOf<typeof stages>;
export type FoundationRecipeCompiledConfig = CompiledRecipeConfigOf<typeof stages>;
export type FoundationStageConfig = NonNullable<FoundationRecipeConfig["foundation"]>;
export type FoundationStageKnobsConfig = NonNullable<FoundationStageConfig["knobs"]>;
export type FoundationStageAdvancedConfig = NonNullable<FoundationStageConfig["advanced"]>;

export const compileOpsById = collectCompileOps(foundationDomain);

export const FOUNDATION_STAGE_CONFIG = {
  knobs: {
    plateCount: "normal",
    plateActivity: "normal",
  },
  advanced: {
    mesh: {
      computeMesh: {
        strategy: "default",
        config: {
          plateCount: 8,
          cellsPerPlate: 2,
          referenceArea: 4000,
          plateScalePower: 0.5,
          relaxationSteps: 2,
          cellCount: 16,
        },
      },
    },
    crust: {
      computeCrust: {
        strategy: "default",
        config: {
          continentalRatio: 0.3,
          shelfWidthCells: 6,
          shelfElevationBoost: 0.12,
          marginElevationPenalty: 0.04,
          continentalBaseElevation: 0.78,
          continentalAgeBoost: 0.12,
          oceanicBaseElevation: 0.32,
          oceanicAgeDepth: 0.22,
        },
      },
    },
    "plate-graph": {
      computePlateGraph: {
        strategy: "default",
        config: {
          plateCount: 8,
          referenceArea: 4000,
          plateScalePower: 0.5,
          polarCaps: {
            capFraction: 0.1,
            microplateBandFraction: 0.2,
            microplatesPerPole: 0,
            microplatesMinPlateCount: 14,
            microplateMinAreaCells: 8,
            tangentialSpeed: 0.9,
            tangentialJitterDeg: 12,
          },
        },
      },
    },
    tectonics: {
      computeTectonicSegments: {
        strategy: "default",
        config: {
          intensityScale: 180,
          regimeMinIntensity: 4,
        },
      },
      computeTectonicHistory: {
        strategy: "default",
        config: {
          eraWeights: [0.35, 0.35, 0.3],
          driftStepsByEra: [2, 1, 0],
          beltInfluenceDistance: 8,
          beltDecay: 0.55,
          activityThreshold: 1,
        },
      },
    },
    projection: {
      computePlates: {
        strategy: "default",
        config: {
          boundaryInfluenceDistance: 5,
          boundaryDecay: 0.55,
          movementScale: 100,
          rotationScale: 100,
        },
      },
    },
    "plate-topology": {},
  },
} satisfies FoundationStageConfig;

export const FOUNDATION_RECIPE_CONFIG = {
  foundation: FOUNDATION_STAGE_CONFIG,
} satisfies FoundationRecipeConfig;

export default createRecipe({
  id: "foundation",
  namespace: NAMESPACE,
  tagDefinitions: STANDARD_TAG_DEFINITIONS,
  stages,
  compileOpsById,
} as const);
