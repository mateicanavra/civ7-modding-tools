import { defineArtifact } from "@swooper/mapgen-core/authoring";
import placement from "@mapgen/domain/placement";

/** Discovery plan (`artifact:placement.discoveryPlan`). One artifact per file by repo convention. */
export const discoveryPlanArtifact = defineArtifact({
  name: "discoveryPlan",
  id: "artifact:placement.discoveryPlan",
  schema: placement.ops.planDiscoveries.output,
});
