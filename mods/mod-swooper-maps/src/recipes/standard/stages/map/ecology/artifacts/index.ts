import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as biomeBindings from "./biome-bindings.artifact.js";
import * as featureApplyDiagnostics from "./feature-apply-diagnostics.artifact.js";
import * as featureEngineSnapshot from "./feature-engine-snapshot.artifact.js";

const catalog = defineArtifactCatalog({
  biomeBindings,
  featureApplyDiagnostics,
  featureEngineSnapshot,
});

/** Map-Ecology artifact modules pairing projection evidence with its admission validator. */
export const artifactModules = catalog.modules;

/** Map-Ecology artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
