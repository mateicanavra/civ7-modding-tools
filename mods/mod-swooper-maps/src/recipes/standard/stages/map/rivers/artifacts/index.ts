import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as projectedNavigableRivers } from "./projected-navigable-rivers.artifact.js";

/** map-rivers artifact authorities keyed for contracts and consumers. */
export const artifacts = defineArtifactCatalog({
  projectedNavigableRivers,
});
