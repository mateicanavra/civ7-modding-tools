import geostrophicProxy from "./geostrophic-proxy/contract.js";
import latitude from "./latitude/contract.js";

/** Geostrophic proxy is the product wind posture; latitude bands remain the deterministic low-cost fallback. */
export default [geostrophicProxy, latitude] as const;
