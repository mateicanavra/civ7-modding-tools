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

const MorphologyLandmassArtifactSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0, description: "Stable index within this snapshot (0..n-1)." }),
    tileCount: Type.Integer({ minimum: 0, description: "Number of land tiles in this landmass." }),
    coastlineLength: Type.Integer({
      minimum: 0,
      description:
        "Count of land↔water adjacency edges along the coastline (canonical hex neighbor graph; wrapX=true).",
    }),
    bbox: Type.Object(
      {
        west: Type.Integer({
          minimum: 0,
          description: "West bound (inclusive) in tile x-coordinates.",
        }),
        east: Type.Integer({
          minimum: 0,
          description: "East bound (inclusive) in tile x-coordinates.",
        }),
        south: Type.Integer({
          minimum: 0,
          description: "South bound (inclusive) in tile y-coordinates.",
        }),
        north: Type.Integer({
          minimum: 0,
          description: "North bound (inclusive) in tile y-coordinates.",
        }),
      },
      {
        additionalProperties: false,
        description:
          "Axis-aligned bounds in tile coordinates. Note: west/east may wrap if a landmass crosses the map seam.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "One connected land component derived from the landMask (Phase 2 schema).",
  }
);

/** Runtime schema for connected land components and the per-tile component lookup. */
const Schema = Type.Object(
  {
    landmasses: Type.Immutable(Type.Array(MorphologyLandmassArtifactSchema)),
    landmassIdByTile: TypedArraySchemas.i32({
      description:
        "Per-tile landmass component id (-1 for water). Values map to the landmasses[] entries.",
    }),
  },
  {
    additionalProperties: false,
    description: "Landmass decomposition snapshot (Phase 2 schema; immutable at F2).",
  }
);

/**
 * Registers connected land components and the per-tile component lookup used
 * by region projection, placement, and landmass-aware policy.
 */
export const artifact = defineArtifact({
  name: "landmasses",
  id: "artifact:morphology.landmasses",
  schema: Schema,
  refine: validateLocal,
});

/**
 * Requires the per-tile component lookup to be an Int32 map-sized surface;
 * water remains represented by the schema's `-1` sentinel.
 */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const errors: ArtifactValidationIssue[] = [];
  appendArtifactTypedArrayIssues(
    errors,
    "landmasses.landmassIdByTile",
    value.landmassIdByTile,
    Int32Array,
    artifactCellCount(context)
  );

  return errors;
}
