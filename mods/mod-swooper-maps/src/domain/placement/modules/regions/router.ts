import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import projectLandmassRegions from "./ops/project-landmass-regions/index.js";

/** Executable Placement regions branch used by region-projection recipe steps. */
const regions = createDomainSubdomainRouter(contract, {
  projectLandmassRegions,
});

export default regions;
