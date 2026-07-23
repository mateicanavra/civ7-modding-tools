import diagonalStride from "./diagonal-stride/contract.js";
import habitat from "./habitat/contract.js";

/** Chooses reef, cold-reef, atoll, or lake-lotus intent while preserving occupancy and lake habitat laws. Strategy contracts vary authored policy without redefining the operation input or output. */
export default [habitat, diagonalStride] as const;
