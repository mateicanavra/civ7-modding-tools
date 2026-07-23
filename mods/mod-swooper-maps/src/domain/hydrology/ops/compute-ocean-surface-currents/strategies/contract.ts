import latitude from "./latitude/contract.js";
import windGyreProjection from "./wind-gyre-projection/contract.js";

/** Wind-gyre projection is the product current posture; latitude bands remain the deterministic fallback. */
export default [windGyreProjection, latitude] as const;
