import { artifactContracts as mapMorphologyArtifactContracts } from "./artifacts/index.js";

export const mapMorphologyArtifacts = {
  coastClassification: mapMorphologyArtifactContracts.coastClassification.artifact,
  coastEngineTerrainSnapshot: mapMorphologyArtifactContracts.coastEngineTerrainSnapshot.artifact,
  continentValidationTerrainSnapshot:
    mapMorphologyArtifactContracts.continentValidationTerrainSnapshot.artifact,
} as const;
