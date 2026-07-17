import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as hydrography from "./hydrography.artifact.js";
import * as lakePlan from "./lake-plan.artifact.js";
import * as riverNetworkMetrics from "./river-network-metrics.artifact.js";

const catalog = defineArtifactCatalog({
  hydrography,
  lakePlan,
  riverNetworkMetrics,
});

/** hydrology-hydrography artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** hydrology-hydrography artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
