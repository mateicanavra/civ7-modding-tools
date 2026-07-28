import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeBeltDriversContract from "../../contract.js";
import { deriveBeltDriversFromHistory } from "../../rules/derive-belt-drivers-from-history.js";
import StrategyDefinition from "./config.js";

/** Binds the `history-derived` algorithm to the shared `morphology/compute-belt-drivers` operation contract. */
export default createStrategy(ComputeBeltDriversContract, StrategyDefinition, {
  run: (input) => deriveBeltDriversFromHistory(input),
});
