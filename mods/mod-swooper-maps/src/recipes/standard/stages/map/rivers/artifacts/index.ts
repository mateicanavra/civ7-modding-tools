import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as projectedNavigableRivers from "./projected-navigable-rivers.artifact.js";

const catalog = defineArtifactCatalog({
  projectedNavigableRivers,
});

/** map-rivers artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** map-rivers artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
