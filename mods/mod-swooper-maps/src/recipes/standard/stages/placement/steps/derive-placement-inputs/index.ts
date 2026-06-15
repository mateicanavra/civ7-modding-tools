import { defineVizMeta, type ExtendedMapContext } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { placementArtifacts } from "../../artifacts.js";
import { PLACEMENT_TILE_SPACE_ID, PLACEMENT_VIZ_GROUP, UNIT_SCORE_VALUE_SPEC } from "../../viz.js";
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

    // S7 (E4.2/E4.3): this step's decision products are the wonder and
    // discovery PLANS; emit their anchor sites with planning priority so the
    // step is inspectable in studio before any stamping happens.
    emitPlannedSitesViz(context, {
      dataTypeKey: "placement.wonders.plannedSites",
      label: "Planned Natural Wonder Sites",
      description:
        "Anchor plots the natural-wonder plan selected, colored by planning priority (0..1). Stamping outcomes appear on the place-natural-wonders step.",
      placements: naturalWonderPlan.placements,
    });
    emitPlannedSitesViz(context, {
      dataTypeKey: "placement.discoveries.plannedSites",
      label: "Planned Discovery Sites",
      description:
        "Plots the discovery plan selected, colored by planning priority (0..1). Stamping outcomes appear on the place-discoveries step.",
      placements: discoveryPlan.placements,
    });
  },
});

function emitPlannedSitesViz(
  context: ExtendedMapContext,
  args: {
    dataTypeKey: string;
    label: string;
    description: string;
    placements: ReadonlyArray<{ readonly plotIndex: number; readonly priority: number }>;
  }
): void {
  if (!context.viz) return;
  const { width } = context.dimensions;
  const positions = new Float32Array(args.placements.length * 2);
  const values = new Float32Array(args.placements.length);
  for (let i = 0; i < args.placements.length; i++) {
    const { plotIndex, priority } = args.placements[i]!;
    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    positions[i * 2] = x;
    positions[i * 2 + 1] = y;
    values[i] = priority;
  }
  context.viz.dumpPoints(context.trace, {
    dataTypeKey: args.dataTypeKey,
    spaceId: PLACEMENT_TILE_SPACE_ID,
    positions,
    values,
    valueFormat: "f32",
    valueSpec: UNIT_SCORE_VALUE_SPEC,
    meta: defineVizMeta(args.dataTypeKey, {
      label: args.label,
      group: PLACEMENT_VIZ_GROUP,
      description: args.description,
      palette: "continuous",
    }),
  });
}
