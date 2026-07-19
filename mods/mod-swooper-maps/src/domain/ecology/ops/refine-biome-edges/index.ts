import { createOp } from "@swooper/mapgen-core/authoring";
import RefineBiomeEdgesContract from "./contract.js";
import { gaussianStrategy } from "./strategies/index.js";

/** Biome-edge refinement operation with Gaussian smoothing as its sole admitted strategy. */
const refineBiomeEdges = createOp(RefineBiomeEdgesContract, {
  strategies: {
    gaussian: gaussianStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default refineBiomeEdges;
