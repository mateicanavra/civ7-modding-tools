import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as resourcePlanAdjusted } from "./resource-plan-adjusted.artifact.js";

/** Immutable post-start resource support plan owned by the Resources support module. */
export const artifacts = defineArtifactCatalog({ resourcePlanAdjusted });
