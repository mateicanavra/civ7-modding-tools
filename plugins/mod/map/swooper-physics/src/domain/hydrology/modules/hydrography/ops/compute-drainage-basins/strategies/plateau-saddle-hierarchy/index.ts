import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeDrainageBasinsContract from "../../contract.js";
import { computeDrainageBasins } from "../../rules/index.js";
import PlateauSaddleHierarchyDefinition from "./config.js";

/** Builds raw catchments and a saddle-sorted containment forest without conditioning terrain. */
export default createStrategy(ComputeDrainageBasinsContract, PlateauSaddleHierarchyDefinition, {
  run: (input, config) => computeDrainageBasins(input, config.allowExternalEdgeOutlets),
});
