import { artifact as hydrographyArtifact } from "./artifacts/hydrography.artifact.js";
import { artifact as lakePlanArtifact } from "./artifacts/lake-plan.artifact.js";
import { artifact as riverNetworkMetricsArtifact } from "./artifacts/river-network-metrics.artifact.js";

export { HydrologyHydrographyArtifactSchema } from "./artifacts/hydrography.artifact.js";
export { HydrologyLakePlanArtifactSchema } from "./artifacts/lake-plan.artifact.js";
export { HydrologyRiverNetworkMetricsArtifactSchema } from "./artifacts/river-network-metrics.artifact.js";

export const hydrologyHydrographyArtifacts = {
  hydrography: hydrographyArtifact,
  lakePlan: lakePlanArtifact,
  riverNetworkMetrics: riverNetworkMetricsArtifact,
} as const;
