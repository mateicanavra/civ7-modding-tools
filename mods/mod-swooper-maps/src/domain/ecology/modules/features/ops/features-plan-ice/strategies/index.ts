import scoreThreshold from "./score-threshold/index.js";

/** Converts freeze suitability into sparse ice intent without claiming an occupied tile. Implementations available to the recipe's semantic strategy selection. */
export default [scoreThreshold] as const;
