import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeBeltDriversContract from "../../contract.js";
import { deriveBeltDriversFromHistory } from "../../rules/derive-belt-drivers-from-history.js";
import StrategyContract from "./contract.js";

/** Binds the `history-derived` algorithm to the shared `morphology/compute-belt-drivers` operation contract. */
export default createStrategy(ComputeBeltDriversContract, StrategyContract, {
  run: (input) => deriveBeltDriversFromHistory(input),
});
