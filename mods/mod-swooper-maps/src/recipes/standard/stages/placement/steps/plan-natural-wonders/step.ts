import {
  buildNaturalWonderBlockedMask,
  CIV7_BROWSER_TABLES_V0,
  NATURAL_WONDER_CATALOG,
  NO_FEATURE_TYPE,
} from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import type { IsEqual } from "type-fest";
import {
  measureStandardNaturalWonderPlanInput,
  STANDARD_NATURAL_WONDER_PLAN_INPUT_METRIC_KEY,
  type StandardNaturalWonderPlannerMeasurementSurface,
} from "../../../../metrics/families/placement/natural-wonder-plan-input.js";
import {
  emitStandardNaturalWonderPlanExactLog,
  emitStandardNaturalWonderPlanInputExactLog,
} from "../../../../parity/placement-exact-log.js";
import {
  definePlacementVizMeta,
  PLACEMENT_TILE_SPACE_ID,
  UNIT_SCORE_VALUE_SPEC,
} from "../../viz.js";
import { config } from "./config.js";

/**
 * Plans natural-wonder intent from immutable physical products, current Civ7
 * identity surfaces, static catalog policy, and active map-size metadata.
 */
export const PlanNaturalWondersStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const topography = deps.artifacts.topography.read();
    const hydrography = deps.artifacts.hydrography.read();
    const riverNetwork = deps.artifacts.riverNetwork.read();
    const lakePlan = deps.artifacts.lakePlan.read();
    const climateIndices = deps.artifacts.climateIndices.read();
    const biomeClassification = deps.artifacts.biomeClassification.read();
    const pedology = deps.artifacts.pedology.read();
    const wondersCount = deps.initialSetup.map.selection.mapInfo.NumNaturalWonders;
    const terrainType = deps.engine.readCurrentMapTerrainTypes(context);
    const biomeType = deps.engine.readCurrentMapBiomeTypes(context);
    const featureType = deps.engine.readCurrentMapFeatureTypes(context);
    const plannerInput = {
      width,
      height,
      wondersCount,
      landMask: topography.landMask,
      elevation: topography.elevation,
      aridityIndex: climateIndices.aridityIndex,
      riverClass: hydrography.riverClass,
      lakeMask: lakePlan.lakeMask,
      vegetationDensity: biomeClassification.vegetationDensity,
      effectiveMoisture: climateIndices.effectiveMoisture,
      surfaceTemperature: climateIndices.surfaceTemperatureC,
      fertility: pedology.fertility,
      discharge: hydrography.discharge,
      slopeClass: riverNetwork.slopeClass,
      coastTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST,
      mountainTerrainType: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_MOUNTAIN,
      iceFeatureType: CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_ICE,
      terrainType,
      biomeType,
      featureType,
      noFeatureType: NO_FEATURE_TYPE,
      naturalWonderBlockedMask: buildNaturalWonderBlockedMask(width, height),
      featureCatalog: NATURAL_WONDER_CATALOG,
    } satisfies StandardNaturalWonderPlannerMeasurementSurface &
      Parameters<typeof ops.naturalWonders>[0];
    const plannerInputEvidenceIsExhaustive: IsEqual<
      keyof StandardNaturalWonderPlannerMeasurementSurface,
      keyof Parameters<typeof ops.naturalWonders>[0]
    > = true;
    void plannerInputEvidenceIsExhaustive;
    const strategySelection = stepConfig.naturalWonders;
    const naturalWonderPlan = ops.naturalWonders(plannerInput, strategySelection);
    deps.artifacts.naturalWonderPlan.publish(naturalWonderPlan);
    const naturalWonderPlanInput = measureStandardNaturalWonderPlanInput({
      plannerInput,
      strategySelection,
      plan: naturalWonderPlan,
    });
    emitStandardNaturalWonderPlanExactLog(naturalWonderPlan);
    emitStandardNaturalWonderPlanInputExactLog(naturalWonderPlanInput);

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
