import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeDrainageRoutingContract from "../../contract.js";
import { computeDrainageRouting } from "../../rules/index.js";
import PriorityFloodContract from "./contract.js";

/** Depression-aware priority flooding assigns receivers, basins, sinks, outlets, and terminal types together. */
const priorityFloodStrategy = createStrategy(
  ComputeDrainageRoutingContract,
  PriorityFloodContract,
  {
    run: (input, config) =>
      computeDrainageRouting({
        width: input.width,
        height: input.height,
        elevation: input.elevation,
        landMask: input.landMask,
        allowExternalEdgeOutlets: config.allowExternalEdgeOutlets,
      }),
  }
);

export default priorityFloodStrategy;
