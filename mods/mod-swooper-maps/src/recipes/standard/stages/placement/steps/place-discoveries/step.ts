import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import type { TraceJsonObject } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { runPlacementProductStep } from "../../log.js";
import { PlaceDiscoveriesStepContract } from "./config.js";
import { placeOfficialDiscoveries } from "./materialize.js";

/**
 * Runs Civ7 discovery generation only after resources and starts are stamped,
 * feeding seated starts as exclusions and publishing observed outcomes.
 */
export const PlaceDiscoveriesStep = createStep(PlaceDiscoveriesStepContract, {
  run: (context, _config, _ops, deps) => {
    const { width, height } = context.setup.dimensions;
    // Civ7's official generator gates discoveries away from major starts; feed it
    // the seated start plots (drop unseated -1 sentinels) exactly as the base
    // maps pass `startPositions` from assignStartPositions.
    const startAssignment = deps.artifacts.startAssignment.read(context);
    const startPositions = startAssignment.positions.filter((plotIndex) => plotIndex >= 0);
    const polarMargin = Math.max(0, CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows | 0);
    const emit = (payload: TraceJsonObject): void => {
      if (!context.trace?.isVerbose) return;
      context.trace.event(() => payload);
    };

    const outcomes = runPlacementProductStep("placement.discoveries", emit, () =>
      placeOfficialDiscoveries({
        adapter: context.adapter,
        width,
        height,
        startPositions,
        polarMargin,
      })
    );

    // Unconditional engine-safe telemetry (`console.log` is the only console
    // method available in the Civ7 MapGeneration context) so the live
    // Scripting.log is no longer silent on discoveries — this line is the
    // primary in-game evidence of the placement count.
    console.log(
      `[SWOOPER_MOD] DISCOVERY_PLACEMENT_V1 ${JSON.stringify({
        version: 1,
        startPositions: startPositions.length,
        polarMargin,
        plannedCount: outcomes.summary.plannedCount,
        placedCount: outcomes.summary.placedCount,
        rejectedCount: outcomes.summary.rejectedCount,
      })}`
    );

    deps.artifacts.discoveryPlacementOutcomes.publish(context, outcomes);
  },
});
