import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeEvaporationSourcesContract from "./contract.js";
import { thermalSurfaceStrategy } from "./strategies/index.js";

const computeEvaporationSources = createOp(ComputeEvaporationSourcesContract, {
  strategies: { "thermal-surface": thermalSurfaceStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeEvaporationSources;
