import { artifactContracts as mapElevationArtifactContracts } from "./artifacts/index.js";

export const mapElevationArtifacts = {
  elevationEngineTerrainSnapshot:
    mapElevationArtifactContracts.elevationEngineTerrainSnapshot.artifact,
} as const;
