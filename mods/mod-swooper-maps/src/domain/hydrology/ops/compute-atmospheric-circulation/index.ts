import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeAtmosphericCirculationContract from "./contract.js";
import { geostrophicProxyStrategy, latitudeStrategy } from "./strategies/index.js";

/** Computes atmospheric circulation through the contract-selected geostrophic or latitude model. */
const computeAtmosphericCirculation = createOp(ComputeAtmosphericCirculationContract, {
  strategies: { "geostrophic-proxy": geostrophicProxyStrategy, latitude: latitudeStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeAtmosphericCirculation;
