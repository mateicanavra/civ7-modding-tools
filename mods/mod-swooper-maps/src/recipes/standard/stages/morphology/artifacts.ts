import { artifact as beltDriversArtifact } from "./artifacts/belt-drivers.artifact.js";
import { artifact as coastlineMetricsArtifact } from "./artifacts/coastline-metrics.artifact.js";
import { artifact as landmassesArtifact } from "./artifacts/landmasses.artifact.js";
import { artifact as mountainsArtifact } from "./artifacts/mountains.artifact.js";
import { artifact as routingArtifact } from "./artifacts/routing.artifact.js";
import { artifact as shelfArtifact } from "./artifacts/shelf.artifact.js";
import { artifact as substrateArtifact } from "./artifacts/substrate.artifact.js";
import { artifact as topographyArtifact } from "./artifacts/topography.artifact.js";
import { artifact as volcanoesArtifact } from "./artifacts/volcanoes.artifact.js";

export const morphologyArtifacts = {
  topography: topographyArtifact,
  routing: routingArtifact,
  substrate: substrateArtifact,
  coastlineMetrics: coastlineMetricsArtifact,
  shelf: shelfArtifact,
  landmasses: landmassesArtifact,
  volcanoes: volcanoesArtifact,
  mountains: mountainsArtifact,
  beltDrivers: beltDriversArtifact,
} as const;
