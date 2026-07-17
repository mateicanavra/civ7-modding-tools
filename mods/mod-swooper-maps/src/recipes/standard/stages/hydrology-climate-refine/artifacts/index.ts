import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as climateDiagnostics from "./climate-diagnostics.artifact.js";
import * as climateIndices from "./climate-indices.artifact.js";
import * as cryosphere from "./cryosphere.artifact.js";

const catalog = defineArtifactCatalog({
  climateDiagnostics,
  climateIndices,
  cryosphere,
});

/** hydrology-climate-refine artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** hydrology-climate-refine artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
