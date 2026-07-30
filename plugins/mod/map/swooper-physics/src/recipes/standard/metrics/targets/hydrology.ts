import type { MetricTarget } from "@swooper/mapgen-metrics";

import type { StandardMapMetricCohort } from "../sample.js";
import { atLeast, equalTo, summarizeCohort } from "./support.js";

/** Earthlike cohort target for a meaningful river hierarchy and a closed permanence partition. */
export const EARTHLIKE_RIVER_NETWORK_TARGET = {
  id: "swooper-earthlike/river-network",
  description:
    "Earthlike produces hierarchical river networks whose admitted river tiles carry active flow evidence.",
  expectations: [
    atLeast<StandardMapMetricCohort>(
      "stream-order-hierarchy",
      "Every representative map develops at least a second-order river branch.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) => sample.metrics.hydrology.networkSummary.maxStreamOrderProxy
        ).minimum,
      2
    ),
    equalTo<StandardMapMetricCohort>(
      "river-permanence-partition",
      "Every river tile belongs to exactly one ephemeral, intermittent, or perennial class.",
      (samples) =>
        samples.every(({ metrics }) => {
          const summary = metrics.hydrology.networkSummary;
          return (
            summary.riverEphemeralTileCount +
              summary.riverIntermittentTileCount +
              summary.riverPerennialTileCount ===
            summary.riverTileCount
          );
        }),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "river-active-flow",
      "Every classified river tile carries non-dry flow evidence.",
      (samples) =>
        samples.every(({ metrics }) => metrics.hydrology.networkSummary.riverDryTileCount === 0),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "river-flow-mix",
      "Every representative map retains non-perennial rivers within its active flow network.",
      (samples) =>
        samples.every(
          ({ metrics }) => metrics.hydrology.networkSummary.nonPerennialRiverShareOfRiverTiles > 0
        ),
      true
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;
