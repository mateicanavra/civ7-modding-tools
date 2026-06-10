import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import DerivePlacementInputsContract from "./contract.js";
import { buildPlacementInputs } from "./inputs.js";
import {
  buildNaturalWonderPlanInputRuntimeTelemetry,
  logNaturalWonderPlanInputRuntimeTelemetry,
  traceNaturalWonderPlanInputRuntimeTelemetry,
} from "./natural-wonder-plan-input-telemetry.js";
import { logNaturalWonderPlanRuntimeTelemetry } from "./natural-wonder-plan-telemetry.js";
import {
  validateDiscoveryPlanArtifact,
  validateNaturalWonderPlanArtifact,
  validatePlacementInputsArtifact,
} from "./validate.js";
import { placementArtifacts } from "../../artifacts.js";

export default createStep(DerivePlacementInputsContract, {
  artifacts: implementArtifacts(
    [
      placementArtifacts.placementInputs,
      placementArtifacts.naturalWonderPlan,
      placementArtifacts.discoveryPlan,
    ],
    {
      placementInputs: {
        validate: (value) => validatePlacementInputsArtifact(value),
      },
      naturalWonderPlan: {
        validate: (value) => validateNaturalWonderPlanArtifact(value),
      },
      discoveryPlan: {
        validate: (value) => validateDiscoveryPlanArtifact(value),
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    // Lake placement constraints use the deterministic Hydrology plan. Engine
    // projection artifacts remain diagnostics for materialization drift.
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    // Engine biome surface: the plot-biomes projection artifact, not a readback.
    const biomeBindings = deps.artifacts.biomeBindings.read(context);
    const pedology = deps.artifacts.pedology.read(context);

    const { inputs, naturalWonderPlan, discoveryPlan } = buildPlacementInputs(
      context,
      config,
      ops,
      {
        topography: {
          landMask: topography.landMask as Uint8Array,
          elevation: topography.elevation as Int16Array,
        },
        hydrography: { riverClass: hydrography.riverClass as Uint8Array },
        lakePlan: { lakeMask: lakePlan.lakeMask as Uint8Array },
        biomeClassification: {
          effectiveMoisture: biomeClassification.effectiveMoisture as Float32Array,
          surfaceTemperature: biomeClassification.surfaceTemperature as Float32Array,
          aridityIndex: biomeClassification.aridityIndex as Float32Array,
        },
        biomeBindings: { engineBiomeId: biomeBindings.engineBiomeId as Uint16Array },
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
      },
    });
    deps.artifacts.placementInputs.publish(context, inputs);
    deps.artifacts.naturalWonderPlan.publish(context, naturalWonderPlan);
    logNaturalWonderPlanRuntimeTelemetry(naturalWonderPlan);
    logNaturalWonderPlanInputRuntimeTelemetry(naturalWonderPlanInputTelemetry);
    traceNaturalWonderPlanInputRuntimeTelemetry(context, naturalWonderPlanInputTelemetry);
    deps.artifacts.discoveryPlan.publish(context, discoveryPlan);
  },
});
