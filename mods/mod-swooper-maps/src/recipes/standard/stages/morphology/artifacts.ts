import { artifactContracts as morphologyArtifactContracts } from "./artifacts/index.js";

export const morphologyArtifacts = {
  topography: morphologyArtifactContracts.topography.artifact,
  routing: morphologyArtifactContracts.routing.artifact,
  substrate: morphologyArtifactContracts.substrate.artifact,
  coastlineMetrics: morphologyArtifactContracts.coastlineMetrics.artifact,
  shelf: morphologyArtifactContracts.shelf.artifact,
  landmasses: morphologyArtifactContracts.landmasses.artifact,
  volcanoes: morphologyArtifactContracts.volcanoes.artifact,
  mountains: morphologyArtifactContracts.mountains.artifact,
  beltDrivers: morphologyArtifactContracts.beltDrivers.artifact,
} as const;
