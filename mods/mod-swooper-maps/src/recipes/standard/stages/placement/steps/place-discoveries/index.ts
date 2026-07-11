import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import {
  artifacts as placementArtifacts,
  validators as placementArtifactValidators,
} from "../../artifacts/index.js";
import { runPlacementProductStep } from "../product-runtime.js";
import PlaceDiscoveriesStepContract from "./contract.js";
import { placeOfficialDiscoveries } from "./materialize.js";

export default createStep(PlaceDiscoveriesStepContract, {
  artifacts: implementArtifacts([placementArtifacts.discoveryPlacementOutcomes], {
    discoveryPlacementOutcomes: {
      validate: (value) => placementArtifactValidators.discoveryPlacementOutcomes(value),
    },
  }),
  run: (context, _config, _ops, deps) => {
    const { width, height } = context.dimensions;
    // Civ7's official generator gates discoveries away from major starts; feed it
    // the seated start plots (drop unseated -1 sentinels) exactly as the base
    // maps pass `startPositions` from assignStartPositions.
    const startAssignment = deps.artifacts.startAssignment.read(context);
    const startPositions = startAssignment.positions.filter((plotIndex) => plotIndex >= 0);
    const polarMargin = Math.max(0, CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows | 0);
    const emit = (payload: Record<string, unknown>): void => {
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
