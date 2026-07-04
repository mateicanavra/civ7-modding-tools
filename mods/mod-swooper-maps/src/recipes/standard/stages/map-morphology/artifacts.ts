import { artifact as coastClassificationArtifact } from "./artifacts/coast-classification.artifact.js";
import { artifact as coastEngineTerrainSnapshotArtifact } from "./artifacts/coast-engine-terrain-snapshot.artifact.js";
import { artifact as continentValidationTerrainSnapshotArtifact } from "./artifacts/continent-validation-terrain-snapshot.artifact.js";

export const mapMorphologyArtifacts = {
  coastClassification: coastClassificationArtifact,
  coastEngineTerrainSnapshot: coastEngineTerrainSnapshotArtifact,
  continentValidationTerrainSnapshot: continentValidationTerrainSnapshotArtifact,
} as const;
