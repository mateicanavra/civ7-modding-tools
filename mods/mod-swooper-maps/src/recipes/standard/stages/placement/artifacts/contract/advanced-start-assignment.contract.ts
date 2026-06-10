import { Type, defineArtifact } from "@swooper/mapgen-core/authoring";

/** Advanced-start evidence (`artifact:placement.advancedStartAssignment`). One artifact per file by repo convention. */
const AdvancedStartAssignmentArtifactSchema = Type.Object(
  {
    fertilityRecalculated: Type.Boolean(),
    advancedStartsAssigned: Type.Boolean(),
  },
  {
    additionalProperties: false,
    description:
      "Engine-owned advanced-start assignment evidence after all placement products materialize.",
  }
);

export const advancedStartAssignmentArtifact = defineArtifact({
  name: "advancedStartAssignment",
  id: "artifact:placement.advancedStartAssignment",
  schema: AdvancedStartAssignmentArtifactSchema,
});
