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

/** Runtime schema for the pre-island carved coastline snapshot. */
const Schema = Type.Object(
  {
    coastalLand: TypedArraySchemas.u8({ description: "Mask (1/0): land tiles adjacent to water." }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): water tiles adjacent to land.",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description:
        "Minimum tile-graph distance to any coastline tile (0=coast), using wrapX=true and wrapY=false.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Pre-island carved coastline product used by later Morphology shaping; final post-island coastline truth belongs to the shelf artifact.",
  }
);

/**
 * Registers the pre-island carved coastline snapshot used by downstream
 * terrain shaping; post-island coastline truth belongs to the shelf artifact.
 */
export const artifact = defineArtifact({
  name: "carvedCoastline",
  id: "artifact:morphology.carvedCoastline",
  schema: Schema,
  refine: validateLocal,
});

/** Validates mask/distance array kinds and their map-sized cardinality when known. */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const errors: ArtifactValidationIssue[] = [];
  const size = artifactCellCount(context);
  const candidate = value as {
    coastalLand?: unknown;
    coastalWater?: unknown;
    distanceToCoast?: unknown;
  };
  appendArtifactTypedArrayIssues(
    errors,
    "carvedCoastline.coastalLand",
    candidate.coastalLand,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "carvedCoastline.coastalWater",
    candidate.coastalWater,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "carvedCoastline.distanceToCoast",
    candidate.distanceToCoast,
    Uint16Array,
    size
  );
  return errors;
}
