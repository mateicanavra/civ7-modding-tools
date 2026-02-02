import { Type, collectCompileOps, createRecipe, type CompiledRecipeConfigOf, type RecipeConfigInputOf } from "@swooper/mapgen-core/authoring";
import foundationDomain from "@mapgen/domain/foundation/ops";

import foundation from "../standard/stages/foundation/index.js";
import { STANDARD_TAG_DEFINITIONS } from "../standard/tags.js";

const NAMESPACE = "mod-swooper-maps";
const stages = [foundation] as const;

export const BROWSER_TEST_STAGES = stages;

export type BrowserTestRecipeConfig = RecipeConfigInputOf<typeof stages>;
export type BrowserTestRecipeCompiledConfig = CompiledRecipeConfigOf<typeof stages>;
export type BrowserTestFoundationStageConfig = NonNullable<BrowserTestRecipeConfig["foundation"]>;
export type BrowserTestFoundationStageKnobsConfig = NonNullable<BrowserTestFoundationStageConfig["knobs"]>;
export type BrowserTestFoundationStageAdvancedConfig = NonNullable<BrowserTestFoundationStageConfig["advanced"]>;

export const compileOpsById = collectCompileOps(foundationDomain);

export const BROWSER_TEST_FOUNDATION_STAGE_CONFIG = {
  knobs: {
    plateCount: "dense",
    plateActivity: "high",
  },
  advanced: {
    mesh: {
      computeMesh: {
        strategy: "default",
        config: {
          plateCount: 28,
          cellsPerPlate: 23,
          referenceArea: 6996,
          plateScalePower: 1,
          relaxationSteps: 2,
          // cellCount: 16,
        },
      },
    },
    crust: {
      computeCrust: {
        strategy: "default",
        config: {
          continentalRatio: 0.3,
          shelfWidthCells: 3,
          shelfElevationBoost: 0.23,
          marginElevationPenalty: 0.04,
          continentalBaseElevation: 0.78,
          continentalAgeBoost: 0.22,
          oceanicBaseElevation: 0.42,
          oceanicAgeDepth: 0.22,
        },
      },
    },
    "plate-graph": {
      computePlateGraph: {
        strategy: "default",
        config: {
          plateCount: 28,
          referenceArea: 6996,
          plateScalePower: 1,
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
          driftStepsByEra: [5, 3, 0],
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
          movementScale: 20,
          rotationScale: 40,
        },
      },
    },
    "plate-topology": {},
  },
} satisfies BrowserTestFoundationStageConfig;

export const BROWSER_TEST_RECIPE_CONFIG = {
  foundation: BROWSER_TEST_FOUNDATION_STAGE_CONFIG,
} satisfies BrowserTestRecipeConfig;

export const BROWSER_TEST_RECIPE_CONFIG_SCHEMA = Type.Object(
  {
    foundation: Type.Optional(foundation.surfaceSchema),
  },
  { additionalProperties: false, default: {} }
);

export default createRecipe({
  id: "browser-test",
  namespace: NAMESPACE,
  tagDefinitions: STANDARD_TAG_DEFINITIONS,
  stages,
  compileOpsById,
} as const);
