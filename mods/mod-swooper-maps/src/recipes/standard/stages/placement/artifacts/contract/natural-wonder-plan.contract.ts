import { defineArtifact } from "@swooper/mapgen-core/authoring";
import placement from "@mapgen/domain/placement";

/** Natural-wonder plan (`artifact:placement.naturalWonderPlan`). One artifact per file by repo convention. */
export const naturalWonderPlanArtifact = defineArtifact({
  name: "naturalWonderPlan",
  id: "artifact:placement.naturalWonderPlan",
  schema: placement.ops.planNaturalWonders.output,
});
