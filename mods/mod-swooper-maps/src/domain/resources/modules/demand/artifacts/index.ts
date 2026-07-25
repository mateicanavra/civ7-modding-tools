import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as resourceDemandPlan } from "./resource-demand-plan.artifact.js";
import { artifact as resourceEligibility } from "./resource-eligibility.artifact.js";

/** Immutable symbolic demand and its exact habitat/policy eligibility surfaces. */
export const artifacts = defineArtifactCatalog({ resourceDemandPlan, resourceEligibility });
