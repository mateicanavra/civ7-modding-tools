import {
  type ArtifactValidationIssue,
  defineArtifact,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime shape for the two Civ7 advanced-start completion flags. */
const Schema = Type.Object(
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

/** Registers terminal evidence whose validator requires both advanced-start passes to complete. */
export const artifact = defineArtifact({
  name: "advancedStartAssignment",
  id: "artifact:placement.advancedStartAssignment",
  schema: Schema,
  refine: validateLocal,
});

/**
 * Validate hook for the advanced-start assignment evidence artifact
 * (placement-realignment S6): the step publishes only after both engine
 * passes ran, so anything other than two `true` flags is a publish-site bug.
 */

/** Rejects publication unless fertility recalculation and advanced-start assignment are true. */
function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  if (value.fertilityRecalculated !== true) {
    issues.push({ message: "fertilityRecalculated must be true at publish time." });
  }
  if (value.advancedStartsAssigned !== true) {
    issues.push({ message: "advancedStartsAssigned must be true at publish time." });
  }
  return issues;
}
