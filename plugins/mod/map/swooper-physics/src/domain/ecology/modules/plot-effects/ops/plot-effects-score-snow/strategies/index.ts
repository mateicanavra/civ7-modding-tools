import coldElevation from "./cold-elevation/index.js";

/** Scores cold land from freeze, elevation, and moisture under authored temperature and aridity limits. Implementations available to the recipe's semantic strategy selection. */
export default [coldElevation] as const;
