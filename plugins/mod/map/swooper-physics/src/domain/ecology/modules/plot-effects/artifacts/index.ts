import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";

import { artifact as plotEffectPlan } from "./plot-effect-plan.artifact.js";

/** Immutable plot-effect intent evidence owned by the Ecology plot-effects branch. */
export const artifacts = defineArtifactCatalog({ plotEffectPlan });
