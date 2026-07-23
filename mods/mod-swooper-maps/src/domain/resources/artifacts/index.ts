import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as earthlikeExpectations } from "./earthlike-expectations.artifact.js";

/** Resources artifact authorities keyed for contracts and consumers. */
export const artifacts = defineArtifactCatalog({
  earthlikeExpectations,
});
