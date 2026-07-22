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

/** Runtime schema for the final engine terrain snapshot captured after river modeling. */
export const Schema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot.",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask after river projection (1=land, 0=water).",
    }),
    terrain: TypedArraySchemas.u8({
      description: "Engine-derived terrain type snapshot after river projection.",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot after river projection.",
    }),
  },
  {
    additionalProperties: false,
    description: "Engine terrain snapshot captured at the map-rivers projection boundary.",
  }
);

/**
 * The post-river terrain snapshot is owned by map-rivers because river
 * modeling and validation are the last engine terrain mutation before ecology
 * and placement consume final topology.
 */
export const artifact = defineArtifact({
  name: "riversEngineTerrainSnapshot",
  id: "artifact:map.riversEngineTerrainSnapshot",
  schema: Schema,
});

/** Validates the post-river engine snapshot's dimensions and typed tile surfaces. */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const candidate = value as Record<string, unknown>;
  const cellCount = artifactCellCount(context);
  appendArtifactTypedArrayIssues(issues, "landMask", candidate.landMask, Uint8Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "terrain", candidate.terrain, Uint8Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "elevation", candidate.elevation, Int16Array, cellCount);
  return Object.freeze(issues);
}

/** Admits map-sized typed terrain readback captured after Civ7 river projection. */
export const validate = defineArtifactValidator(artifact, validateLocal);
