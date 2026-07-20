import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as elevationEngineTerrainSnapshot from "./elevation-engine-terrain-snapshot.artifact.js";

const catalog = defineArtifactCatalog({
  elevationEngineTerrainSnapshot,
});

/** map-elevation artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** map-elevation artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
