import resources from "@mapgen/domain/resources/contract";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";

/** Support-adjusted resource plan (`artifact:placement.resourcePlanAdjusted`). One artifact per file by repo convention. */
export const resourcePlanAdjustedArtifact = defineArtifact({
  name: "resourcePlanAdjusted",
  id: "artifact:placement.resourcePlanAdjusted",
  schema: resources.ops.adjustResourceSupport.output,
});
