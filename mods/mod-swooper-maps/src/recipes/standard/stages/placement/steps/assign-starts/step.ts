import { createStep } from "@swooper/mapgen-core/authoring";
import type { TraceJsonObject } from "@swooper/mapgen-core";
import { runPlacementProductStep } from "../../log.js";
import { AssignStartsStepContract } from "./config.js";
import { materializeStartAssignment } from "./materialize.js";
import { projectStartAssignmentViz } from "./viz.js";

/**
 * Assigns player seats against the resource plan and final physical truth,
 * before the support pass adjusts resources and stamping makes them immutable.
 */
export const AssignStartsStep = createStep(AssignStartsStepContract, {
  run: (context, config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    const resourcePlan = deps.artifacts.resourcePlan.read(context);
    const naturalWonderPlacement = deps.artifacts.naturalWonderPlacement.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const topography = deps.artifacts.topography.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const volcanoes = deps.artifacts.volcanoes.read(context);
    const shelf = deps.artifacts.shelf.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const baseStarts = placementInputs.starts;
    const slotByTile = landmassRegionSlotByTile.slotByTile as Uint8Array;
    const { width, height } = context.setup.dimensions;
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
        coastalLand: shelf.coastalLand as Uint8Array,
        distanceToCoast: shelf.distanceToCoast as Uint16Array,
        shelfMask: shelf.shelfMask as Uint8Array,
        elevation: topography.elevation as Int16Array,
        fertility: pedology.fertility as Float32Array,
        effectiveMoisture: biomeClassification.effectiveMoisture as Float32Array,
        surfaceTemperature: biomeClassification.surfaceTemperature as Float32Array,
        aridityIndex: biomeClassification.aridityIndex as Float32Array,
        riverClass: hydrography.riverClass as Uint8Array,
        lakeMask: lakePlan.lakeMask as Uint8Array,
        mountainMask: mountains.mountainMask as Uint8Array,
        volcanoMask: volcanoes.volcanoMask as Uint8Array,
        naturalWonderPlotIndices: [...naturalWonderPlacement.observedNaturalWonderPlotIndices],
        // D3 (S5): resource-support scoring works off PLANNED site intents —
        // stamping runs after the support pass, so placed outcomes do not
        // exist yet when starts are chosen.
        plannedResourcePlotIndices: resourcePlan.intents.map((intent) => intent.plotIndex),
        // seatBiases: per-civ StartBias rows need live player→civ data; the
        // offline default is neutral (Milestone A wires the live half).
      },
      config.starts as Parameters<typeof _ops.starts>[1]
    );
    const emit = (payload: TraceJsonObject): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const assignment = runPlacementProductStep("placement.starts", emit, () =>
      materializeStartAssignment({ context, plan })
    );
    deps.artifacts.startAssignment.publish(context, assignment);
    return { plan, assignment };
  },
  viz: ({ result, dimensions }) => projectStartAssignmentViz({ ...result, dimensions }),
});
