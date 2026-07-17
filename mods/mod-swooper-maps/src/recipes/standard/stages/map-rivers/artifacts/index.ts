import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as engineProjectionRivers from "./engine-projection-rivers.artifact.js";
import * as projectedNavigableRivers from "./projected-navigable-rivers.artifact.js";
import * as riversEngineTerrainSnapshot from "./rivers-engine-terrain-snapshot.artifact.js";

const catalog = defineArtifactCatalog({
  engineProjectionRivers,
  projectedNavigableRivers,
  riversEngineTerrainSnapshot,
});

/** map-rivers artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** map-rivers artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
