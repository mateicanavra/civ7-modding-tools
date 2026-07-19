import { createOp, createStrategy } from "@swooper/mapgen-core/authoring";
import RefineBiomeEdgesContract from "./contract.js";
import { gaussianStrategy, runGaussianBiomeRefinement } from "./strategies/index.js";

const defaultStrategy = createStrategy(RefineBiomeEdgesContract, "default", {
  run: runGaussianBiomeRefinement,
});
const morphologicalStrategy = createStrategy(RefineBiomeEdgesContract, "morphological", {
  run: runGaussianBiomeRefinement,
});

const refineBiomeEdges = createOp(RefineBiomeEdgesContract, {
  strategies: {
    default: defaultStrategy,
    morphological: morphologicalStrategy,
    gaussian: gaussianStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default refineBiomeEdges;
