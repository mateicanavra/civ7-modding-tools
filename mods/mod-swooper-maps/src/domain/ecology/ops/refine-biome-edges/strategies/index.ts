import gaussian from "./gaussian/index.js";

/** Smooths land-biome boundaries over the hex grid while retaining the water sentinel unchanged. Implementations available to the recipe's semantic strategy selection. */
export default [gaussian] as const;
