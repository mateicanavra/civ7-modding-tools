import diagonalStride from "./diagonal-stride/index.js";
import habitat from "./habitat/index.js";

/** Chooses reef, cold-reef, atoll, or lake-lotus intent while preserving occupancy and lake habitat laws. Implementations available to the recipe's semantic strategy selection. */
export default [habitat, diagonalStride] as const;
