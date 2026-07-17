import type { MetricTarget } from "@swooper/mapgen-metrics";

import type { StandardMapMetricCohort } from "../sample.js";
import { atLeast, equalTo, summarizeCohort } from "./support.js";

/** Standard cohort benchmark for complete player seating from a surplus candidate surface. */
export const STANDARD_PLACEMENT_TARGET = {
  id: "standard/placement-cohort",
  description:
    "Standard maps seat every requested player from a viable candidate surface without fallback loss.",
  expectations: [
    equalTo<StandardMapMetricCohort>(
      "assigned-player-count",
      "Every scenario assigns exactly the player count declared by its selected map size.",
      (samples) =>
        samples.every(
          (sample) => sample.metrics.placement.assigned === sample.metrics.placement.expectedPlayers
        ),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "unseated-player-count",
      "No requested player remains unseated in any representative scenario.",
      (samples) => samples.every((sample) => sample.metrics.placement.unseatedCount === 0),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "unclassified-assignment-count",
      "Every assigned start carries a real placement rung rather than the none sentinel.",
      (samples) => samples.every((sample) => sample.metrics.placement.noneAssigned === 0),
      true
    ),
    equalTo<StandardMapMetricCohort>(
      "candidate-surplus",
      "Every scenario retains more viable start candidates than requested players.",
      (samples) =>
        samples.every(
          (sample) =>
            sample.metrics.placement.candidateCount > sample.metrics.placement.expectedPlayers
        ),
      true
    ),
    atLeast<StandardMapMetricCohort>(
      "strong-assignment-floor",
      "Every scenario seats at least six players on primary or island-cluster starts.",
      (samples) =>
        summarizeCohort(
          samples,
          (sample) =>
            sample.metrics.placement.primaryAssigned +
            sample.metrics.placement.islandClusterAssigned
        ).minimum,
      6
    ),
  ],
} satisfies MetricTarget<StandardMapMetricCohort>;
