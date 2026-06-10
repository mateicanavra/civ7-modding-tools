import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import DerivePlacementInputsContract from "./contract.js";
import { buildPlacementInputs } from "./inputs.js";
import {
  buildNaturalWonderPlanInputRuntimeTelemetry,
  logNaturalWonderPlanInputRuntimeTelemetry,
  traceNaturalWonderPlanInputRuntimeTelemetry,
} from "./natural-wonder-plan-input-telemetry.js";
import { logNaturalWonderPlanRuntimeTelemetry } from "./natural-wonder-plan-telemetry.js";
import { placementArtifacts } from "../../artifacts.js";

export default createStep(DerivePlacementInputsContract, {
  artifacts: implementArtifacts(
    [
      placementArtifacts.placementInputs,
      placementArtifacts.naturalWonderPlan,
      placementArtifacts.discoveryPlan,
    ],
    {
      placementInputs: {},
      naturalWonderPlan: {},
      discoveryPlan: {},
    }
  ),
  run: (context, config, ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    // Lake placement constraints use the deterministic Hydrology plan. Engine
    // projection artifacts remain diagnostics for materialization drift.
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);

    const inputs = buildPlacementInputs(context, config, ops, {
      topography,
      hydrography,
      lakePlan,
      biomeClassification,
      pedology,
    });
    const naturalWonderPlanInputTelemetry = buildNaturalWonderPlanInputRuntimeTelemetry({
      context,
      plan: inputs.naturalWonderPlan,
      physical: {
        topography,
        hydrography,
        lakePlan,
        biomeClassification,
      },
    });
    deps.artifacts.placementInputs.publish(context, inputs);
    deps.artifacts.naturalWonderPlan.publish(context, inputs.naturalWonderPlan);
    logNaturalWonderPlanRuntimeTelemetry(inputs.naturalWonderPlan);
    logNaturalWonderPlanInputRuntimeTelemetry(naturalWonderPlanInputTelemetry);
    traceNaturalWonderPlanInputRuntimeTelemetry(context, naturalWonderPlanInputTelemetry);
    deps.artifacts.discoveryPlan.publish(context, inputs.discoveryPlan);
  },
});
