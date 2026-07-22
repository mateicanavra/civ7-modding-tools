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

/** Runtime schema for the engine terrain observed immediately after coast stamping. */
export const Schema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot.",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask at this map-morphology boundary.",
    }),
    terrain: TypedArraySchemas.i32({
      description: "Engine-derived terrain type snapshot at this map-morphology boundary.",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot at this map-morphology boundary.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Engine terrain snapshot captured at a map-morphology boundary for parity diagnostics.",
  }
);

/** Registers engine terrain observed immediately after coast stamping. */
export const artifact = defineArtifact({
  name: "coastEngineTerrainSnapshot",
  id: "artifact:map.morphology.coastEngineTerrainSnapshot",
  schema: Schema,
});

/** Validates the coast-boundary snapshot's dimensions and typed tile surfaces. */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): readonly ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const candidate = value as Record<string, unknown>;
  const cellCount = artifactCellCount(context);
  appendArtifactTypedArrayIssues(issues, "landMask", candidate.landMask, Uint8Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "terrain", candidate.terrain, Int32Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "elevation", candidate.elevation, Int16Array, cellCount);
  return Object.freeze(issues);
}

/** Admits map-sized typed terrain readback captured after coast stamping. */
export const validate = defineArtifactValidator(artifact, validateLocal);
