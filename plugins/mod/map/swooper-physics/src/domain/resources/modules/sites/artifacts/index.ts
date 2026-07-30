import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as resourcePlan } from "./resource-plan.artifact.js";

/** Immutable site-selection plans consumed by resource support and materialization. */
export const artifacts = defineArtifactCatalog({
  resourcePlan,
});
