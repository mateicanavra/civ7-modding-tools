import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as biomeBindings } from "./biome-bindings.artifact.js";
import { artifact as featureApplyDiagnostics } from "./feature-apply-diagnostics.artifact.js";
import { artifact as featureEngineSnapshot } from "./feature-engine-snapshot.artifact.js";

/** Map-Ecology artifact authorities keyed for contracts and consumers. */
export const artifacts = defineArtifactCatalog({
  biomeBindings,
  featureApplyDiagnostics,
  featureEngineSnapshot,
});
