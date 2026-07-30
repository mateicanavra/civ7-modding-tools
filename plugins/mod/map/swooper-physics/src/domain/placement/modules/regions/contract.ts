import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ProjectLandmassRegionsContract from "./ops/project-landmass-regions/contract.js";

/** Placement region contract for classifying connected landmasses into gameplay slots. */
const regions = defineDomainSubdomain({
  id: "regions",
  ops: {
    projectLandmassRegions: ProjectLandmassRegionsContract,
  },
});

export default regions;
