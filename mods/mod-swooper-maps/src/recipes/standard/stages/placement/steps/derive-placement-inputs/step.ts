import type { MapInfo } from "@civ7/adapter";
import {
  buildNaturalWonderBlockedMask,
  CIV7_BROWSER_TABLES_V0,
  NATURAL_WONDER_CATALOG,
  NO_FEATURE_TYPE,
} from "@civ7/map-policy";
import placement from "@mapgen/domain/placement";
import type { MapContext } from "@swooper/mapgen-core";
import { createStep, type Static, type StepRuntimeOps } from "@swooper/mapgen-core/authoring";
import {
  type CurrentEnginePlacementTypes,
  captureEnginePlacementTypes,
} from "../../../../current-engine-surface.js";
import {
  measureStandardNaturalWonderPlanInput,
  STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY,
  type StandardNaturalWonderPlanInputMeasurementInput,
} from "../../../../metrics/families/placement/natural-wonder-plan-input.js";
import {
  logNaturalWonderPlanInputRuntimeTelemetry,
  logNaturalWonderPlanRuntimeTelemetry,
} from "../../log.js";
import {
  definePlacementVizMeta,
  PLACEMENT_TILE_SPACE_ID,
  UNIT_SCORE_VALUE_SPEC,
} from "../../viz.js";
import { config } from "./config.js";

type DerivePlacementInputsConfig = Static<typeof config.schema>;
type DerivePlacementInputsOps = StepRuntimeOps<NonNullable<typeof config.ops>>;
type PlanNaturalWondersOutput = Static<(typeof placement.wonders.ops.planNaturalWonders)["output"]>;
type PlanNaturalWondersStrategySelection = Parameters<
  DerivePlacementInputsOps["naturalWonders"]
>[1];
type StandardNaturalWonderPlannerInput =
  StandardNaturalWonderPlanInputMeasurementInput["plannerInput"];

type PlacementPhysicalInputs = {
  topography: {
    landMask: Uint8Array;
    elevation: Int16Array;
  };
  hydrography: {
    riverClass: Uint8Array;
    discharge: Float32Array;
    slopeClass: Uint8Array;
  };
  lakePlan: {
    lakeMask: Uint8Array;
  };
  biomeClassification: {
    vegetationDensity: Float32Array;
  };
  climateIndices: {
    effectiveMoisture: Float32Array;
    surfaceTemperature: Float32Array;
    aridityIndex: Float32Array;
  };
  pedology: {
    fertility: Float32Array;
  };
};

type PlacementInputEngineEvidence = Readonly<{
  mapInfo: MapInfo;
  currentPlacementTypes: CurrentEnginePlacementTypes;
}>;

type PlacementInputsBuildResult = {
  naturalWonderPlan: PlanNaturalWondersOutput;
  plannerInput: StandardNaturalWonderPlannerInput;
  strategySelection: PlanNaturalWondersStrategySelection;
};

/**
 * Admits immutable physical products, current Civ7 identity surfaces, and
 * catalog policy exactly once before invoking the pure natural-wonder planner.
 * Unstampable catalog shapes are rejected at this recipe boundary.
 */
function buildPlacementInputs(
  context: MapContext,
  stepConfig: DerivePlacementInputsConfig,
  ops: DerivePlacementInputsOps,
  physical: PlacementPhysicalInputs,
  engineEvidence: PlacementInputEngineEvidence
): PlacementInputsBuildResult {
  const { mapInfo, currentPlacementTypes } = engineEvidence;
  const { width, height } = context.setup.dimensions;
  const wondersPlan = ops.wonders({ mapInfo }, stepConfig.wonders);
  const { terrainType, biomeType, featureType } = currentPlacementTypes;
  const naturalWonderBlockedMask = buildNaturalWonderBlockedMask(width, height);
  const plannerInput = {
    width,
    height,
    wondersCount: wondersPlan.wondersCount,
    landMask: physical.topography.landMask,
    elevation: physical.topography.elevation,
    aridityIndex: physical.climateIndices.aridityIndex,
    riverClass: physical.hydrography.riverClass,
    lakeMask: physical.lakePlan.lakeMask,
    vegetationDensity: physical.biomeClassification.vegetationDensity,
    effectiveMoisture: physical.climateIndices.effectiveMoisture,
    surfaceTemperature: physical.climateIndices.surfaceTemperature,
    fertility: physical.pedology.fertility,
    discharge: physical.hydrography.discharge,
    slopeClass: physical.hydrography.slopeClass,
    coastTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST,
    mountainTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_MOUNTAIN,
    iceFeatureType: CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_ICE,
    terrainType,
    biomeType,
    featureType,
    noFeatureType: NO_FEATURE_TYPE,
    naturalWonderBlockedMask,
    featureCatalog: NATURAL_WONDER_CATALOG,
  } satisfies StandardNaturalWonderPlannerInput;
  const strategySelection = stepConfig.naturalWonders;
  const naturalWonderPlan = ops.naturalWonders(plannerInput, strategySelection);
  return {
    naturalWonderPlan,
    plannerInput,
    strategySelection,
  };
}

/**
 * Consolidates immutable domain products and current adapter observations into placement
 * inputs, then derives natural-wonder intent without mutating the map.
 */
export const DerivePlacementInputsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const riverNetwork = deps.artifacts.riverNetwork.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const climateIndices = deps.artifacts.climateIndices.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const mapSizeId = deps.engine.getMapSizeId(context);
    const mapInfo = deps.engine.lookupMapInfo(context, mapSizeId);
    if (!mapInfo) {
      throw new Error("[Placement] Civ7 map metadata is unavailable for the active map size.");
    }

    const physical: PlacementPhysicalInputs = {
      topography: {
        landMask: topography.landMask as Uint8Array,
        elevation: topography.elevation as Int16Array,
      },
      hydrography: {
        riverClass: hydrography.riverClass as Uint8Array,
        discharge: hydrography.discharge as Float32Array,
        slopeClass: riverNetwork.slopeClass as Uint8Array,
      },
      lakePlan: { lakeMask: lakePlan.lakeMask as Uint8Array },
      biomeClassification: {
        vegetationDensity: biomeClassification.vegetationDensity as Float32Array,
      },
      climateIndices: {
        effectiveMoisture: climateIndices.effectiveMoisture as Float32Array,
        surfaceTemperature: climateIndices.surfaceTemperatureC as Float32Array,
        aridityIndex: climateIndices.aridityIndex as Float32Array,
      },
      pedology: { fertility: pedology.fertility as Float32Array },
    };
    const { naturalWonderPlan, plannerInput, strategySelection } = buildPlacementInputs(
      context,
      stepConfig,
      ops,
      physical,
      {
        mapInfo,
        currentPlacementTypes: captureEnginePlacementTypes(context.setup.dimensions, {
          getTerrainType: (x, y) => deps.engine.getTerrainType(context, x, y),
          getBiomeType: (x, y) => deps.engine.getBiomeType(context, x, y),
          getFeatureType: (x, y) => deps.engine.getFeatureType(context, x, y),
        }),
      }
    );
    deps.artifacts.naturalWonderPlan.publish(context, naturalWonderPlan);
    const naturalWonderPlanInput = measureStandardNaturalWonderPlanInput({
      plannerInput,
      strategySelection,
      plan: naturalWonderPlan,
    });
    logNaturalWonderPlanRuntimeTelemetry(naturalWonderPlan);
    logNaturalWonderPlanInputRuntimeTelemetry(naturalWonderPlanInput);

    return {
      placements: naturalWonderPlan.placements,
      naturalWonderPlanInput,
    };
  },
  metrics: ({ result }) => ({
    [STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY]: result.naturalWonderPlanInput,
  }),
  viz: ({ result, dimensions }) => {
    const { placements } = result;
    const positions = new Float32Array(placements.length * 2);
    const values = new Float32Array(placements.length);
    for (let i = 0; i < placements.length; i++) {
      const { plotIndex, priority } = placements[i]!;
      const y = (plotIndex / dimensions.width) | 0;
      const x = plotIndex - y * dimensions.width;
      positions[i * 2] = x;
      positions[i * 2 + 1] = y;
      values[i] = priority;
    }
    return [
      {
        kind: "points",
        dataTypeKey: "placement.wonders.plannedSites",
        spaceId: PLACEMENT_TILE_SPACE_ID,
        positions,
        values: { format: "f32", values, valueSpec: UNIT_SCORE_VALUE_SPEC },
        meta: definePlacementVizMeta("placement.wonders.plannedSites", "field.intensity", {
          label: "Planned Natural Wonder Sites",
          description:
            "Anchor plots the natural-wonder plan selected, colored by planning priority (0..1). Stamping outcomes appear on the place-natural-wonders step.",
        }),
      },
    ];
  },
});
