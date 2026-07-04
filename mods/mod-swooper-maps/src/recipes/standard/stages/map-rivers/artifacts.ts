import { artifact as engineProjectionRiversArtifact } from "./artifacts/engine-projection-rivers.artifact.js";
import { artifact as projectedNavigableRiversArtifact } from "./artifacts/projected-navigable-rivers.artifact.js";
import { artifact as riversEngineTerrainSnapshotArtifact } from "./artifacts/rivers-engine-terrain-snapshot.artifact.js";

export const mapRiversArtifacts = {
  projectedNavigableRivers: projectedNavigableRiversArtifact,
  engineProjectionRivers: engineProjectionRiversArtifact,
  riversEngineTerrainSnapshot: riversEngineTerrainSnapshotArtifact,
} as const;
