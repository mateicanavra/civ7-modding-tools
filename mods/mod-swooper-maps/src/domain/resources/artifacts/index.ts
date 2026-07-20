import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as earthlikeExpectations from "./earthlike-expectations.artifact.js";

const catalog = defineArtifactCatalog({
  earthlikeExpectations,
});

/** Resources artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** Resources artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
