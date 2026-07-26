import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";
import { projectResourceSiteSelectionViz } from "./viz.js";

/**
 * Selects typed resource intents from admitted demand and publishes the immutable plan consumed by
 * start support and engine placement. Demand policy remains owned by the preceding step.
 */
export const SelectResourceSitesStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const demandPlan = deps.artifacts.resourceDemandPlan.read(context);
    const topography = deps.artifacts.topography.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const regionSlots = deps.artifacts.landmassRegionSlotByTile.read(context);
    const demands = demandPlan.candidates.admitted.map((candidate) => ({
      resourceType: candidate.source.resourceType,
      family: candidate.source.family,
      laneId: candidate.source.laneId,
      laneKind: candidate.source.laneKind,
      targetCount: candidate.source.targetIntentCount,
      minCount: candidate.source.expectedCountRange.min,
      maxCount: candidate.source.expectedCountRange.max,
      habitatMask: candidate.source.habitatMask,
      habitatTileCount: candidate.source.habitatTileCount,
      ...candidate.demand,
    }));
    const landmassTileCounts = landmasses.landmasses.map((row) => row.tileCount);
    const plan = ops.selectSites(
      {
        width,
        height,
        seed: deriveStepSeed(context.setup.mapSeed, "resources:selectResourceSites"),
        landMask: topography.landMask,
        lakeMask: lakePlan.lakeMask,
        landmassIdByTile: landmasses.landmassIdByTile,
        landmassTileCounts,
        regionSlotByTile: regionSlots.slotByTile,
        minimumAmountModifier: demandPlan.minimumAmountModifier,
        demands,
      },
      stepConfig.selectSites
    );

    deps.artifacts.resourcePlan.publish(context, plan);

    const excludedCount =
      demandPlan.candidates.excluded.expectationBlocked.length +
      demandPlan.candidates.excluded.ageDeferred.length +
      demandPlan.candidates.excluded.noLegalSites.length;
    context.trace.event(() => ({
      type: "placement.resources.plan",
      plannedCount: plan.plannedCount,
      rotationCount: plan.rotationCount,
      rangeFloorCount: plan.rangeFloorCount,
      regionMinimumCount: plan.regionMinimumCount,
      demandCount: demands.length,
      excludedCount,
      minimumAmountModifier: demandPlan.minimumAmountModifier,
    }));

    return { intents: plan.intents, demands };
  },
  viz: ({ result, dimensions }) => projectResourceSiteSelectionViz({ ...result, dimensions }),
});
