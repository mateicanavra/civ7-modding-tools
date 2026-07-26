import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime schema for the pre-island carved coastline snapshot. */
export const Schema = Type.Object(
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
      "CARVED coastline metrics snapshot (stage morphology-coasts; pre-island). The shelf and the post-island coastline live in artifact:morphology.shelf.",
  }
);

/**
 * Registers the pre-island carved coastline snapshot used by downstream
 * terrain shaping; post-island coastline truth belongs to the shelf artifact.
 */
export const artifact = defineArtifact({
  name: "coastlineMetrics",
  id: "artifact:morphology.coastlineMetrics",
  schema: Schema,
});

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
    "coastlineMetrics.coastalLand",
    candidate.coastalLand,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "coastlineMetrics.coastalWater",
    candidate.coastalWater,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    errors,
    "coastlineMetrics.distanceToCoast",
    candidate.distanceToCoast,
    Uint16Array,
    size
  );
  return errors;
}

/** Validates mask/distance array kinds and their map-sized cardinality when known. */
export const validate = defineArtifactValidator(artifact, validateLocal);
