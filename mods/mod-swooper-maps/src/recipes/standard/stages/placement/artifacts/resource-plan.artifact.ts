import resources from "@mapgen/domain/resources";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";

/** Site-selection resource plan (`artifact:placement.resourcePlan`). One artifact per file by repo convention. */

export const Schema = resources.ops.selectResourceSites.output;

export const artifact = defineArtifact({
  name: "resourcePlan",
  id: "artifact:placement.resourcePlan",
  schema: Schema,
});

export const resourcePlanArtifact = artifact;
