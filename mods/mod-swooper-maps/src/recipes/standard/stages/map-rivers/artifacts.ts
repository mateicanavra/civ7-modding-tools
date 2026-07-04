import { artifactContracts as mapRiversArtifactContracts } from "./artifacts/index.js";

export const mapRiversArtifacts = {
  projectedNavigableRivers: mapRiversArtifactContracts.projectedNavigableRivers.artifact,
  engineProjectionRivers: mapRiversArtifactContracts.engineProjectionRivers.artifact,
  riversEngineTerrainSnapshot: mapRiversArtifactContracts.riversEngineTerrainSnapshot.artifact,
} as const;
