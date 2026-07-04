import resources from "@mapgen/domain/resources";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";

/** Support-adjusted resource plan (`artifact:placement.resourcePlanAdjusted`). One artifact per file by repo convention. */

export const Schema = resources.ops.adjustResourceSupport.output;

export const artifact = defineArtifact({
  name: "resourcePlanAdjusted",
  id: "artifact:placement.resourcePlanAdjusted",
  schema: Schema,
});

export const resourcePlanAdjustedArtifact = artifact;
