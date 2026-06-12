import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { runPlacementProductStep } from "../product-runtime.js";
import {
  emitStartPositionsViz,
  emitStartViabilityViz,
  materializeStartAssignment,
} from "./materialize.js";
import { placementArtifacts } from "../../artifacts.js";
import { validateStartAssignmentArtifact } from "./validate.js";
import AssignStartsStepContract from "./contract.js";

export default createStep(AssignStartsStepContract, {
  artifacts: implementArtifacts([placementArtifacts.startAssignment], {
    startAssignment: {
      validate: (value) => validateStartAssignmentArtifact(value),
    },
  }),
  run: (context, config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    const resourcePlan = deps.artifacts.resourcePlan.read(context);
    const naturalWonderPlacement = deps.artifacts.naturalWonderPlacement.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const topography = deps.artifacts.topography.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const volcanoes = deps.artifacts.volcanoes.read(context);
    const coastlineMetrics = deps.artifacts.coastlineMetrics.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const baseStarts = placementInputs.starts;
    const slotByTile = landmassRegionSlotByTile.slotByTile as Uint8Array;
    const { width, height } = context.dimensions;
    const naturalWonderPlotIndices = collectNaturalWonderPlotIndices(
      naturalWonderPlacement.coordinateRows
    );
    const plan = _ops.starts(
      {
        baseStarts: {
          playersLandmass1: baseStarts.playersLandmass1,
          playersLandmass2: baseStarts.playersLandmass2,
        },
        // Alive-majors READ surface; the op owns the slot→player mapping (D3).
        alivePlayerIds: context.adapter.getAliveMajorIds(),
        width,
        height,
        landMask: topography.landMask as Uint8Array,
        slotByTile,
        landmassIdByTile: landmasses.landmassIdByTile as Int32Array,
        landmassTileCounts: landmasses.landmasses.map((landmass) => landmass.tileCount),
        coastalLand: coastlineMetrics.coastalLand as Uint8Array,
        distanceToCoast: coastlineMetrics.distanceToCoast as Uint16Array,
        shelfMask: coastlineMetrics.shelfMask as Uint8Array,
        elevation: topography.elevation as Int16Array,
        fertility: pedology.fertility as Float32Array,
        effectiveMoisture: biomeClassification.effectiveMoisture as Float32Array,
        surfaceTemperature: biomeClassification.surfaceTemperature as Float32Array,
        aridityIndex: biomeClassification.aridityIndex as Float32Array,
        riverClass: hydrography.riverClass as Uint8Array,
        lakeMask: lakePlan.lakeMask as Uint8Array,
        mountainMask: mountains.mountainMask as Uint8Array,
        volcanoMask: volcanoes.volcanoMask as Uint8Array,
        naturalWonderPlotIndices,
        // D3 (S5): resource-support scoring works off PLANNED site intents —
        // stamping runs after the support pass, so placed outcomes do not
        // exist yet when starts are chosen.
        plannedResourcePlotIndices: resourcePlan.intents.map((intent) => intent.plotIndex),
        // seatBiases: per-civ StartBias rows need live player→civ data; the
        // offline default is neutral (Milestone A wires the live half).
      },
      config.starts as Parameters<typeof _ops.starts>[1]
    );
    const emit = (payload: Record<string, unknown>): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const assignment = runPlacementProductStep("placement.starts", emit, () =>
      materializeStartAssignment({ context, plan })
    );
    emitStartViabilityViz(context, plan);
    emitStartPositionsViz(context, assignment.positions);
    deps.artifacts.startAssignment.publish(context, assignment);
  },
});

/**
 * Collects every plot a placed natural wonder occupies: the planned anchor,
 * the observed (possibly relocated) anchor, and the expected footprint tiles.
 */
function collectNaturalWonderPlotIndices(
  coordinateRows: ReadonlyArray<{
    readonly status: "placed" | "rejected";
    readonly plotIndex: number;
    readonly observedPlotIndex?: number;
    readonly expectedFootprintReadback?: ReadonlyArray<{ readonly plotIndex: number }>;
  }>
): number[] {
  const plots = new Set<number>();
  for (const row of coordinateRows) {
    if (row.status !== "placed") continue;
    plots.add(row.plotIndex);
    if (typeof row.observedPlotIndex === "number") plots.add(row.observedPlotIndex);
    for (const footprint of row.expectedFootprintReadback ?? []) {
      plots.add(footprint.plotIndex);
    }
  }
  return Array.from(plots).sort((a, b) => a - b);
}
