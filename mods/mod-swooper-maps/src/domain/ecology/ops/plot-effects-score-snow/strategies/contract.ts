import coldElevation from "./cold-elevation/contract.js";

/** Scores cold land from freeze, elevation, and moisture under authored temperature and aridity limits. Strategy contracts vary authored policy without redefining the operation input or output. */
export default [coldElevation] as const;
