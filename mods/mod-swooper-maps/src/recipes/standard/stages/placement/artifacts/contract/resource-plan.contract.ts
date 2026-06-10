import { defineArtifact } from "@swooper/mapgen-core/authoring";
import resources from "@mapgen/domain/resources";

/** Site-selection resource plan (`artifact:placement.resourcePlan`). One artifact per file by repo convention. */
export const resourcePlanArtifact = defineArtifact({
  name: "resourcePlan",
  id: "artifact:placement.resourcePlan",
  schema: resources.ops.selectResourceSites.output,
});
