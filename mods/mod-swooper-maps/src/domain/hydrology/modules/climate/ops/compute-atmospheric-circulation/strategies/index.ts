import geostrophicProxy from "./geostrophic-proxy/index.js";
import latitude from "./latitude/index.js";

/** Geostrophic proxy is the product wind posture; latitude bands remain the deterministic low-cost fallback. */
export default [geostrophicProxy, latitude] as const;
