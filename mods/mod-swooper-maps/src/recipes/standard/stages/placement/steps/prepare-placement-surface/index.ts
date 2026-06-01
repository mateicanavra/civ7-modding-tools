import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import { buildPlacementPlanInput } from "../derive-placement-inputs/inputs.js";
import { normalizeNaturalWonderStampingStats } from "../place-natural-wonders/materialize.js";
import { runPlacementProductStep } from "../product-runtime.js";
import { logTerrainStats } from "../terrain-diagnostics.js";
import { applyLandmassRegionSlots } from "./landmass-regions.js";
import { placementArtifacts } from "../../artifacts.js";
import PreparePlacementSurfaceStepContract from "./contract.js";

export default createStep(PreparePlacementSurfaceStepContract, {
  artifacts: implementArtifacts([placementArtifacts.placementSurfacePreparation], {
    placementSurfacePreparation: {},
  }),
  run: (context, _config, _ops, deps) => {
    const placementInputs = deps.artifacts.placementInputs.read(context);
    const naturalWonderPlacement = deps.artifacts.naturalWonderPlacement.read(context);
    const landmassRegionSlotByTile = deps.artifacts.landmassRegionSlotByTile.read(context);
    const { floodplains } = buildPlacementPlanInput(placementInputs);
    const { adapter, trace } = context;
    const { width, height } = context.dimensions;
    const slotByTile = landmassRegionSlotByTile.slotByTile as Uint8Array;
    const emit = (payload: Record<string, unknown>): void => {
      if (!trace?.isVerbose) return;
      trace.event(() => payload);
    };

    // Natural wonder evidence is required before maintenance runs so this step
    // cannot become a hidden second chance to stamp product intent.
    normalizeNaturalWonderStampingStats(naturalWonderPlacement);
    logTerrainStats(trace, adapter, width, height, "Initial");

    runPlacementProductStep("placement.floodplains", emit, () => {
      adapter.addFloodplains(floodplains.minLength, floodplains.maxLength);
    });
    runPlacementProductStep("placement.terrain.validate", emit, () => {
      adapter.validateAndFixTerrain();
      emit({ type: "placement.terrain.validated" });
      logTerrainStats(trace, adapter, width, height, "After validateAndFixTerrain");
    });
    runPlacementProductStep("placement.areas.recalculate", emit, () => {
      adapter.recalculateAreas();
      emit({ type: "placement.areas.recalculated" });
    });
    runPlacementProductStep("placement.water.store", emit, () => {
      adapter.storeWaterData();
      emit({ type: "placement.water.stored" });
    });
    runPlacementProductStep("placement.landmassRegion.restamp", emit, () => {
      applyLandmassRegionSlots(adapter, width, height, slotByTile);
      emit({ type: "placement.landmassRegion.restamped" });
    });

    const slotCounts = { none: 0, west: 0, east: 0 };
    for (let i = 0; i < slotByTile.length; i++) {
      const slot = slotByTile[i] ?? 0;
      if (slot === 1) slotCounts.west += 1;
      else if (slot === 2) slotCounts.east += 1;
      else slotCounts.none += 1;
    }

    deps.artifacts.placementSurfacePreparation.publish(context, { width, height, slotCounts });
  },
});
