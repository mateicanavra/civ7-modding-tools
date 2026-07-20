import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as coastClassification from "./coast-classification.artifact.js";
import * as coastEngineTerrainSnapshot from "./coast-engine-terrain-snapshot.artifact.js";
import * as continentValidationTerrainSnapshot from "./continent-validation-terrain-snapshot.artifact.js";

const catalog = defineArtifactCatalog({
  coastClassification,
  coastEngineTerrainSnapshot,
  continentValidationTerrainSnapshot,
});

/** map-morphology artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** map-morphology artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
