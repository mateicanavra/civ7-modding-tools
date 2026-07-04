import { artifact as engineProjectionLakesArtifact } from "./artifacts/engine-projection-lakes.artifact.js";
import { artifact as hydrologyLakesEngineTerrainSnapshotArtifact } from "./artifacts/hydrology-lakes-engine-terrain-snapshot.artifact.js";

export { MapHydrologyEngineProjectionArtifactSchema } from "./artifacts/engine-projection-lakes.artifact.js";

export const mapHydrologyArtifacts = {
  engineProjectionLakes: engineProjectionLakesArtifact,
  hydrologyLakesEngineTerrainSnapshot: hydrologyLakesEngineTerrainSnapshotArtifact,
} as const;
