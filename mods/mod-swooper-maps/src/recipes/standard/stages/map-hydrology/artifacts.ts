import { artifactContracts as mapHydrologyArtifactContracts } from "./artifacts/index.js";

export { MapHydrologyEngineProjectionArtifactSchema } from "./artifacts/engine-projection-lakes.artifact.js";

export const mapHydrologyArtifacts = {
  engineProjectionLakes: mapHydrologyArtifactContracts.engineProjectionLakes.artifact,
  hydrologyLakesEngineTerrainSnapshot:
    mapHydrologyArtifactContracts.hydrologyLakesEngineTerrainSnapshot.artifact,
} as const;
