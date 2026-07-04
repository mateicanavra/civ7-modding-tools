import { artifactContracts as hydrologyHydrographyArtifactContracts } from "./artifacts/index.js";

export { HydrologyHydrographyArtifactSchema } from "./artifacts/hydrography.artifact.js";
export { HydrologyLakePlanArtifactSchema } from "./artifacts/lake-plan.artifact.js";
export { HydrologyRiverNetworkMetricsArtifactSchema } from "./artifacts/river-network-metrics.artifact.js";

export const hydrologyHydrographyArtifacts = {
  hydrography: hydrologyHydrographyArtifactContracts.hydrography.artifact,
  lakePlan: hydrologyHydrographyArtifactContracts.lakePlan.artifact,
  riverNetworkMetrics: hydrologyHydrographyArtifactContracts.riverNetworkMetrics.artifact,
} as const;
