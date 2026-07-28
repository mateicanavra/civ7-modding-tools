import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as resourceDemandPlan } from "./resource-demand-plan.artifact.js";

/** Complete symbolic demand authority before deterministic site selection. */
export const artifacts = defineArtifactCatalog({ resourceDemandPlan });
