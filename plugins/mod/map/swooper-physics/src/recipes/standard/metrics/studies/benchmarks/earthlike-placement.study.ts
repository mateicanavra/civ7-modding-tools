import { STANDARD_INTEGRITY_TARGET } from "../../targets/integrity.js";
import { EARTHLIKE_PLACEMENT_TARGET } from "../../targets/placement.js";
import { EARTHLIKE_RESOURCE_DISTRIBUTION_TARGET } from "../../targets/resources.js";
import {
  defineStandardMetricCohortStudy,
  requireShippedStandardConfig,
  standardMetricScenariosForSeedPairs,
} from "../define.js";
import { STANDARD_METRIC_PRESETS } from "../scenarios.js";

const PLACEMENT_DISTRIBUTION_SEED_PAIRS = [
  [1337, 1337],
  [1338, 1338],
  [1339, 1339],
  [1340, 1340],
  [1341, 1341],
  [1342, 1342],
  [1343, 1343],
  [1344, 1344],
  [1345, 1345],
  [1346, 1346],
  [1347, 1347],
  [1348, 1348],
  [1349, 1349],
  [1350, 1350],
  [1351, 1351],
  [1352, 1352],
  [1353, 1353],
  [1354, 1354],
  [1355, 1355],
  [1356, 1356],
] as const;

/** Proves Earthlike start fairness, support, climate, and resource distribution across twenty seeds. */
export const EARTHLIKE_PLACEMENT_STUDY = defineStandardMetricCohortStudy(
  "earthlike/placement",
  standardMetricScenariosForSeedPairs(
    requireShippedStandardConfig("swooper-earthlike"),
    STANDARD_METRIC_PRESETS.standard,
    PLACEMENT_DISTRIBUTION_SEED_PAIRS
  ),
  [STANDARD_INTEGRITY_TARGET],
  [EARTHLIKE_PLACEMENT_TARGET, EARTHLIKE_RESOURCE_DISTRIBUTION_TARGET]
);
