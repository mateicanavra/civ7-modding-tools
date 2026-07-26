import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as resourcePlacementOutcomes } from "./resource-placement-outcomes.artifact.js";
import { artifact as resourcePlan } from "./resource-plan.artifact.js";

/** Immutable site-selection plans and Civ7 materialization outcomes. */
export const artifacts = defineArtifactCatalog({
  resourcePlan,
  resourcePlacementOutcomes,
});
