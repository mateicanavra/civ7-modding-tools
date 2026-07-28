import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import { measureStandardDiscoveryPlacement } from "../../../../metrics/families/discovery-placement.js";
import { config } from "./config.js";

/**
 * Runs Civ7 discovery generation only after resources and starts are stamped,
 * feeding seated starts as exclusions and returning the observed counts.
 */
export const PlaceDiscoveriesStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    // Civ7's official generator gates discoveries away from major starts; feed it
    // the seated start plots (drop unseated -1 sentinels) exactly as the base
    // maps pass `startPositions` from assignStartPositions.
    const startAssignment = deps.artifacts.startAssignment.read();
    const startPositions = startAssignment.positions.filter((plotIndex) => plotIndex >= 0);
    const polarMargin = Math.max(0, CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows | 0);

    // Discovery identity and availability are live narrative-system products,
    // so the official generator remains the sole placement authority. This
    // step projects the adapter's typed observations into metrics and logging.
    const outcomes = {
      summary: deps.engine.generateOfficialDiscoveries(context, startPositions, polarMargin),
    };

    // Unconditional engine-safe telemetry (`console.log` is the only console
    // method available in the Civ7 MapGeneration context) so the live
    // Scripting.log is no longer silent on discoveries — this line is the
    // primary in-game evidence of the placement count.
    console.log(
      `[SWOOPER_MOD] DISCOVERY_PLACEMENT_V1 ${JSON.stringify({
        version: 1,
        startPositions: startPositions.length,
        polarMargin,
        attemptedCount: outcomes.summary.attemptedCount,
        placedCount: outcomes.summary.placedCount,
        rejectedCount: outcomes.summary.attemptedCount - outcomes.summary.placedCount,
      })}`
    );

    return outcomes;
  },
  metrics: ({ observation }) => ({
    "placement.discoveryGeneration": measureStandardDiscoveryPlacement(observation.summary),
  }),
});
