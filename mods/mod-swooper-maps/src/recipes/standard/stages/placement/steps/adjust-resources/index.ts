import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";

import AdjustResourcesStepContract from "./contract.js";
import { placementArtifacts } from "../../artifacts.js";
import { validateResourcePlanAdjustedArtifact } from "./validate.js";

export default createStep(AdjustResourcesStepContract, {
  artifacts: implementArtifacts([placementArtifacts.resourcePlanAdjusted], {
    resourcePlanAdjusted: {
      validate: (value) => validateResourcePlanAdjustedArtifact(value),
    },
  }),
  run: (context, config, ops, deps) => {
    const plan = deps.artifacts.resourcePlan.read(context);
    const eligibility = deps.artifacts.resourceEligibility.read(context);
    const startAssignment = deps.artifacts.startAssignment.read(context);
    const regionSlots = deps.artifacts.landmassRegionSlotByTile.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);

    const adjusted = ops.support(
      {
        seed: deriveStepSeed(context.env.seed, "resources:adjustResourceSupport"),
        plan,
        eligibility: eligibility.rows,
        starts: startAssignment.seats.map((seat) => ({
          seatIndex: seat.seatIndex,
          playerId: seat.playerId,
          plotIndex: seat.plotIndex,
        })),
        landmassIdByTile: landmasses.landmassIdByTile as Int32Array,
        landmassTileCounts: landmasses.landmasses.map((landmass) => landmass.tileCount),
        regionSlotByTile: regionSlots.slotByTile as Uint8Array,
      } as unknown as Parameters<typeof ops.support>[0],
      config.support
    );

    if (adjusted.shortfalls.length > 0) {
      // Typed shortfalls (S5): adjustments that would violate an S3 plan
      // invariant are recorded loudly, never forced.
      const summary = adjusted.shortfalls
        .map((row) => `seat ${row.seatIndex}: ${row.reason} x${row.missing}`)
        .join("; ");
      console.warn(
        `[Placement] Resource support pass recorded ${adjusted.shortfalls.length} typed shortfall(s): ${summary}.`
      );
      context.trace?.event(() => ({
        type: "placement.resources.supportShortfall",
        level: "warn",
        shortfalls: adjusted.shortfalls,
      }));
    }

    deps.artifacts.resourcePlanAdjusted.publish(context, adjusted);

    context.trace?.event(() => ({
      type: "placement.resources.supportAdjust",
      plannedCount: adjusted.plannedCount,
      moveCount: adjusted.moveCount,
      addCount: adjusted.addCount,
      gapBefore: adjusted.equity.gapBefore,
      gapAfter: adjusted.equity.gapAfter,
      shortfallCount: adjusted.shortfalls.length,
    }));
  },
});
