import { createStep } from "@swooper/mapgen-core/authoring";
import {
  definePlacementVizMeta,
  PLACEMENT_TILE_SPACE_ID,
  UNIT_SCORE_VALUE_SPEC,
} from "../../viz.js";
import { DerivePlacementInputsStepContract } from "./config.js";
import { buildPlacementInputs } from "./inputs.js";
import {
  buildNaturalWonderPlanInputRuntimeTelemetry,
  logNaturalWonderPlanInputRuntimeTelemetry,
  traceNaturalWonderPlanInputRuntimeTelemetry,
} from "./natural-wonder-plan-input-telemetry.js";
import { logNaturalWonderPlanRuntimeTelemetry } from "./natural-wonder-plan-telemetry.js";

/**
 * Consolidates artifact evidence and declared engine surfaces into placement
 * inputs, then derives natural-wonder intent without mutating the map.
 */
export const DerivePlacementInputsStep = createStep(DerivePlacementInputsStepContract, {
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    // slopeClass is a Hydrology river-network diagnostic owned by the
    // riverNetworkMetrics artifact, not hydrography. Read it from its canonical
    // source (published by the upstream hydrology-hydrography `lakes` step).
    const riverNetworkMetrics = deps.artifacts.riverNetworkMetrics.read(context);
    // Lake placement constraints use the deterministic Hydrology plan. Engine
    // projection artifacts remain diagnostics for materialization drift.
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    // Engine biome surface: the plot-biomes projection artifact, not a readback.
    const biomeBindings = deps.artifacts.biomeBindings.read(context);
    // Engine feature surface: the validated snapshot published after feature projection.
    const featureEngineSnapshot = deps.artifacts.featureEngineSnapshot.read(context);
    const pedology = deps.artifacts.pedology.read(context);

    const { inputs, naturalWonderPlan, naturalWonderPlanSurfaces } = buildPlacementInputs(
      context,
      config,
      ops,
      {
        topography: {
          landMask: topography.landMask as Uint8Array,
          elevation: topography.elevation as Int16Array,
        },
        hydrography: {
          riverClass: hydrography.riverClass as Uint8Array,
          discharge: hydrography.discharge as Float32Array,
          slopeClass: riverNetworkMetrics.slopeClass as Uint8Array,
        },
        lakePlan: { lakeMask: lakePlan.lakeMask as Uint8Array },
        biomeClassification: {
          effectiveMoisture: biomeClassification.effectiveMoisture as Float32Array,
          surfaceTemperature: biomeClassification.surfaceTemperature as Float32Array,
          aridityIndex: biomeClassification.aridityIndex as Float32Array,
          vegetationDensity: biomeClassification.vegetationDensity as Float32Array,
        },
        biomeBindings: { engineBiomeId: biomeBindings.engineBiomeId as Uint16Array },
        featureEngineSnapshot: {
          width: featureEngineSnapshot.width,
          height: featureEngineSnapshot.height,
          featureType: featureEngineSnapshot.featureType as Int16Array,
        },
        pedology: { fertility: pedology.fertility as Float32Array },
      }
    );
    const naturalWonderPlanInputTelemetry = buildNaturalWonderPlanInputRuntimeTelemetry({
      context,
      plan: naturalWonderPlan,
      physical: {
        topography: {
          landMask: topography.landMask as Uint8Array,
          elevation: topography.elevation as Int16Array,
        },
        hydrography: { riverClass: hydrography.riverClass as Uint8Array },
        lakePlan: { lakeMask: lakePlan.lakeMask as Uint8Array },
        biomeClassification: {
          aridityIndex: biomeClassification.aridityIndex as Float32Array,
        },
        naturalWonderPlanSurfaces,
      },
    });
    deps.artifacts.placementInputs.publish(context, inputs);
    deps.artifacts.naturalWonderPlan.publish(context, naturalWonderPlan);
    logNaturalWonderPlanRuntimeTelemetry(naturalWonderPlan);
    logNaturalWonderPlanInputRuntimeTelemetry(naturalWonderPlanInputTelemetry);
    traceNaturalWonderPlanInputRuntimeTelemetry(context, naturalWonderPlanInputTelemetry);

    return naturalWonderPlan.placements;
  },
  viz: ({ result: placements, dimensions }) => {
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
