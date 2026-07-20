import { OFFICIAL_RESOURCE_BY_TYPE, type OfficialResourceType } from "@civ7/map-policy";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { warnLog } from "../../log.js";
import { AdjustResourcesStepContract } from "./config.js";
import { projectResourceSupportViz } from "./viz.js";

/**
 * Performs the bounded post-start support pass, moving or adding planned sites
 * before stamping while preserving typed provenance and explicit shortfalls.
 */
export const AdjustResourcesStep = createStep(AdjustResourcesStepContract, {
  run: (context, config, ops, deps) => {
    const plan = deps.artifacts.resourcePlan.read(context);
    const eligibility = deps.artifacts.resourceEligibility.read(context);
    const startAssignment = deps.artifacts.startAssignment.read(context);
    const regionSlots = deps.artifacts.landmassRegionSlotByTile.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);

    const supportInput: Parameters<typeof ops.support>[0] = {
      seed: deriveStepSeed(context.env.seed, "resources:adjustResourceSupport"),
      plan: {
        ...plan,
        intents: plan.intents.map((intent) => ({ ...intent })),
        perType: plan.perType.map((row) => ({
          ...row,
          shortfalls: row.shortfalls.map((shortfall) => ({ ...shortfall })),
        })),
        regionMinimums: plan.regionMinimums.map((row) => ({ ...row })),
        settings: {
          ...plan.settings,
          affinityRules: plan.settings.affinityRules.map((rule) => ({ ...rule })),
        },
      },
      eligibility: eligibility.rows.map((row) => {
        const resourceType = row.resourceType as OfficialResourceType;
        if (!Object.hasOwn(OFFICIAL_RESOURCE_BY_TYPE, resourceType)) {
          throw new Error(
            `[Placement] Unsupported resource eligibility type ${row.resourceType}; adjust-resource-support only accepts official resource types.`
          );
        }
        return {
          resourceType,
          habitatMask: row.habitatMask as Uint8Array,
          legalMask: row.legalMask as Uint8Array,
          intensity: row.intensity as Float32Array,
        };
      }),
      starts: startAssignment.seats.map((seat) => ({
        seatIndex: seat.seatIndex,
        playerId: seat.playerId,
        plotIndex: seat.plotIndex,
      })),
      landmassIdByTile: landmasses.landmassIdByTile as Int32Array,
      landmassTileCounts: landmasses.landmasses.map((landmass) => landmass.tileCount),
      regionSlotByTile: regionSlots.slotByTile as Uint8Array,
    };
    const adjusted = ops.support(supportInput, config.support);

    if (adjusted.shortfalls.length > 0) {
      // Typed shortfalls (S5): adjustments that would violate an S3 plan
      // invariant are recorded loudly, never forced.
      const summary = adjusted.shortfalls
        .map((row) => `seat ${row.seatIndex}: ${row.reason} x${row.missing}`)
        .join("; ");
      warnLog(
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

    return {
      adjustments: adjusted.adjustments,
      seats: startAssignment.seats,
      supportRadiusTiles: adjusted.settings.supportRadiusTiles,
    };
  },
  viz: ({ result, dimensions }) => projectResourceSupportViz({ ...result, dimensions }),
});
