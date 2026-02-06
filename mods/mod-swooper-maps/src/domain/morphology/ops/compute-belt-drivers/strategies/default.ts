import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeBeltDriversContract from "../contract.js";
import { deriveBeltDriversFromHistory } from "../deriveFromHistory.js";

export const defaultStrategy = createStrategy(ComputeBeltDriversContract, "default", {
  run: (input) => deriveBeltDriversFromHistory(input),
});

