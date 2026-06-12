import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeDrainageRoutingContract from "../contract.js";
import { computeDrainageRouting } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeDrainageRoutingContract, "default", {
  run: (input, config) =>
    computeDrainageRouting({
      width: input.width | 0,
      height: input.height | 0,
      elevation: input.elevation,
      landMask: input.landMask,
      allowExternalEdgeOutlets: config.allowExternalEdgeOutlets,
    }),
});
