import thermalElevation from "./thermal-elevation/index.js";

/** Scores sea and alpine ice suitability from temperature, elevation, freeze persistence, and land-water state. Implementations available to the recipe's semantic strategy selection. */
export default [thermalElevation] as const;
