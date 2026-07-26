import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as naturalWonderPlacement } from "./natural-wonder-placement.artifact.js";
import { artifact as naturalWonderPlan } from "./natural-wonder-plan.artifact.js";

/** Immutable natural-wonder plans and materialization outcomes owned by Placement wonders. */
export const artifacts = defineArtifactCatalog({ naturalWonderPlan, naturalWonderPlacement });
