import cardinal from "./cardinal/contract.js";
import vectorAdvection from "./vector-advection/contract.js";

/** Vector advection is the product moisture posture; cardinal transport remains the deterministic fallback. */
export default [vectorAdvection, cardinal] as const;
