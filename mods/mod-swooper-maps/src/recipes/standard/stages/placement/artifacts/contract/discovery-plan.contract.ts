import placement from "@mapgen/domain/placement";
import { defineArtifact } from "@swooper/mapgen-core/authoring";

/** Discovery plan (`artifact:placement.discoveryPlan`). One artifact per file by repo convention. */
export const discoveryPlanArtifact = defineArtifact({
  name: "discoveryPlan",
  id: "artifact:placement.discoveryPlan",
  schema: placement.ops.planDiscoveries.output,
});
