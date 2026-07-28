import latitude from "./latitude/index.js";
import windGyreProjection from "./wind-gyre-projection/index.js";

/** Wind-gyre projection is the product current posture; latitude bands remain the deterministic fallback. */
export default [windGyreProjection, latitude] as const;
