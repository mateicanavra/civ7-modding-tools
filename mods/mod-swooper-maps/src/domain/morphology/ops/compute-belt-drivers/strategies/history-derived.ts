import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeBeltDriversContract from "../contract.js";
import { deriveBeltDriversFromHistory } from "../rules/derive-belt-drivers-from-history.js";

export const historyDerivedStrategy = createStrategy(
  ComputeBeltDriversContract,
  "history-derived",
  {
    run: (input) => deriveBeltDriversFromHistory(input),
  }
);
