import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as naturalWonderPlan } from "./natural-wonder-plan.artifact.js";

/** Immutable natural-wonder plan owned by the Placement wonders module. */
export const artifacts = defineArtifactCatalog({ naturalWonderPlan });
