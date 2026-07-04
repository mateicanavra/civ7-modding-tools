import placement from "@mapgen/domain/placement";
import { defineArtifact } from "@swooper/mapgen-core/authoring/contracts";

/** Natural-wonder plan (`artifact:placement.naturalWonderPlan`). One artifact per file by repo convention. */

export const Schema = placement.ops.planNaturalWonders.output;

export const artifact = defineArtifact({
  name: "naturalWonderPlan",
  id: "artifact:placement.naturalWonderPlan",
  schema: Schema,
});

export const naturalWonderPlanArtifact = artifact;
