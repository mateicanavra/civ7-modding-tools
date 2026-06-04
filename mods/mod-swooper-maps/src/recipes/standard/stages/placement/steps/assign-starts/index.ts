import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { buildPlacementPlanInput } from "../derive-placement-inputs/inputs.js";
import { runPlacementProductStep } from "../product-runtime.js";
import {
  assignStartPositions,
  emitStartPositionsViz,
  emitStartSectorViz,
  emitStartViabilityViz,
} from "./materialize.js";
import { placementArtifacts } from "../../artifacts.js";
import AssignStartsStepContract from "./contract.js";

export default createStep(AssignStartsStepContract, {
  artifacts: implementArtifacts([placementArtifacts.startAssignment], {
    startAssignment: {},
  }),
  run: (context, config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    deps.artifacts.placementSurfacePreparation.read(context);
    const resourcePlacement = deps.artifacts.resourcePlacementOutcomes.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const topography = deps.artifacts.topography.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);
    const coastlineMetrics = deps.artifacts.coastlineMetrics.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const { starts: baseStarts } = buildPlacementPlanInput(placementInputs);
    const slotByTile = landmassRegionSlotByTile.slotByTile as Uint8Array;
    const { width, height } = context.dimensions;
    const startsConfig = cloneStartsConfig(config.starts);
    const starts = _ops.starts(
      {
        baseStarts: {
          playersLandmass1: baseStarts.playersLandmass1,
          playersLandmass2: baseStarts.playersLandmass2,
          startSectorRows: baseStarts.startSectorRows,
          startSectorCols: baseStarts.startSectorCols,
          startSectors: [...baseStarts.startSectors],
        },
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
        placedResourcePlotIndices: resourcePlacement.outcomes
          .filter((outcome) => outcome.status === "placed")
          .map((outcome) => outcome.plotIndex),
      },
      startsConfig as Parameters<typeof _ops.starts>[1]
    );
    const emit = (payload: Record<string, unknown>): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const assignment = runPlacementProductStep("placement.starts", emit, () =>
      assignStartPositions({ context, starts, slotByTile })
    );
    emitStartViabilityViz(context, starts);
    emitStartSectorViz(context, slotByTile, starts);
    emitStartPositionsViz(context, assignment.positions);
    deps.artifacts.startAssignment.publish(context, assignment);
  },
});

function cloneStartsConfig(
  envelope: Readonly<{
    strategy: "default";
    config: Readonly<{
      overrides?: Readonly<{
        playersLandmass1?: number;
        playersLandmass2?: number;
        startSectorRows?: number;
        startSectorCols?: number;
        startSectors?: readonly unknown[];
      }>;
      [key: string]: unknown;
    }>;
  }>
) {
  const overrides = envelope.config.overrides;
  return {
    strategy: envelope.strategy,
    config: {
      ...envelope.config,
      overrides: overrides
        ? {
            ...overrides,
            startSectors: [...(overrides.startSectors ?? [])],
          }
        : undefined,
    },
  };
}
