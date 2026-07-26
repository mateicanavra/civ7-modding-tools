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

/** Runtime contract for the engine terrain snapshot immediately after lake projection. */
const Schema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot.",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask after lake projection (1=land, 0=water).",
    }),
    terrain: TypedArraySchemas.i32({
      description: "Engine-derived terrain type snapshot after lake projection.",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot after lake projection.",
    }),
  },
  {
    additionalProperties: false,
    description: "Engine terrain snapshot captured at the map-hydrology lake projection boundary.",
  }
);

/**
 * The terrain snapshot stays local to lake projection because it is diagnostic
 * evidence for the static water materialization boundary, not a reusable root
 * map product.
 */
export const artifact = defineArtifact({
  name: "hydrologyLakesEngineTerrainSnapshot",
  id: "artifact:map.hydrologyLakesEngineTerrainSnapshot",
  schema: Schema,
  refine: validateLocal,
});

/** Validates the post-lake engine snapshot's dimensions and typed tile surfaces. */
/** Admits map-sized typed terrain readback captured after lake projection. */
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
