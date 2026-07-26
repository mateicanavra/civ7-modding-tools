import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers post-island coastline and gradient-break shelf truth consumed by
 * coast projection. Membership is gentle pre-break water connected to shore,
 * and every persistent mask or distance field is admitted at map cardinality.
 */
export const artifact = defineArtifact({
  name: "shelf",
  id: "artifact:morphology.shelf",
  schema: Type.Object(
    {
      shelfMask: TypedArraySchemas.u8({
        description:
          "Mask (1/0): post-island water admitted by the gentle local-gradient gate and connected to a shoreline seed; eligible for TERRAIN_COAST projection.",
      }),
      coastalLand: TypedArraySchemas.u8({
        description: "Mask (1/0): POST-island land tiles adjacent to water.",
      }),
      coastalWater: TypedArraySchemas.u8({
        description: "Mask (1/0): POST-island water tiles adjacent to land.",
      }),
      distanceToCoast: TypedArraySchemas.u16({
        description: "POST-island minimum hex distance to the nearest coastline tile (0=coast).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Post-island continental-shelf and coastline product consumed by terrain projection and downstream map policy.",
    }
  ),
  refine: (input: unknown, context?: ArtifactValidationContext): ArtifactValidationIssue[] => {
    const value = input as Static<typeof artifact.schema>;
    const errors: ArtifactValidationIssue[] = [];
    const size = artifactCellCount(context);
    const c = value as Record<string, unknown>;
    appendArtifactTypedArrayIssues(errors, "shelf.shelfMask", c.shelfMask, Uint8Array, size);
    appendArtifactTypedArrayIssues(errors, "shelf.coastalLand", c.coastalLand, Uint8Array, size);
    appendArtifactTypedArrayIssues(errors, "shelf.coastalWater", c.coastalWater, Uint8Array, size);
    appendArtifactTypedArrayIssues(
      errors,
      "shelf.distanceToCoast",
      c.distanceToCoast,
      Uint16Array,
      size
    );
    return errors;
  },
});
