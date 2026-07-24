import cardinal from "./cardinal/index.js";
import vectorAdvection from "./vector-advection/index.js";

/** Vector advection is the product moisture posture; cardinal transport remains the deterministic fallback. */
export default [vectorAdvection, cardinal] as const;
