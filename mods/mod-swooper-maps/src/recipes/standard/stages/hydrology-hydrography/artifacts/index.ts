import * as hydrography from "./hydrography.artifact.js";
import * as lakePlan from "./lake-plan.artifact.js";
import * as riverNetworkMetrics from "./river-network-metrics.artifact.js";

export { hydrography, lakePlan, riverNetworkMetrics };

/** Full hydrography modules exposing schemas, artifact handles, and validators. */
export const artifactContracts = {
  hydrography,
  lakePlan,
  riverNetworkMetrics,
} as const;

/**
 * Hydrography artifact handles shared by downstream Ecology, map projection, and diagnostics.
 * The catalog keeps routing truth, lake intent, and network evidence on registered identities.
 */
export const artifacts = {
  hydrography: hydrography.artifact,
  lakePlan: lakePlan.artifact,
  riverNetworkMetrics: riverNetworkMetrics.artifact,
} as const;

/**
 * Hydrography validators keyed exactly like the artifact catalog. Tests and runtime admission
 * use this map to validate each payload without selecting validators by string convention.
 */
export const validators = {
  hydrography: hydrography.validate,
  lakePlan: lakePlan.validate,
  riverNetworkMetrics: riverNetworkMetrics.validate,
} as const;
