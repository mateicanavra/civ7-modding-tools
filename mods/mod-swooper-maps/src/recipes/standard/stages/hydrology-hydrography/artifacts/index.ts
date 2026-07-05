import * as hydrography from "./hydrography.artifact.js";
import * as lakePlan from "./lake-plan.artifact.js";
import * as riverNetworkMetrics from "./river-network-metrics.artifact.js";

export { hydrography, lakePlan, riverNetworkMetrics };

export const artifactContracts = {
  hydrography,
  lakePlan,
  riverNetworkMetrics,
} as const;

export const artifacts = {
  hydrography: hydrography.artifact,
  lakePlan: lakePlan.artifact,
  riverNetworkMetrics: riverNetworkMetrics.artifact,
} as const;

export const validators = {
  hydrography: hydrography.validate,
  lakePlan: lakePlan.validate,
  riverNetworkMetrics: riverNetworkMetrics.validate,
} as const;
