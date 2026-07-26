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

const VolcanoKindSchema = Type.Union([
  Type.Literal("subductionArc"),
  Type.Literal("rift"),
  Type.Literal("hotspot"),
]);

/** Runtime schema for immutable volcano vents and their map-tile-sized intent mask. */
const Schema = Type.Object(
  {
    volcanoMask: TypedArraySchemas.u8({
      description: "Mask (1/0): tiles containing a volcano vent.",
    }),
    volcanoes: Type.Immutable(
      Type.Array(
        Type.Object(
          {
            tileIndex: Type.Integer({ minimum: 0, description: "Tile index in row-major order." }),
            kind: VolcanoKindSchema,
            strength01: Type.Number({
              minimum: 0,
              maximum: 1,
              description: "Normalized intensity (0..1) derived from volcanism driver strength.",
            }),
          },
          { additionalProperties: false }
        )
      )
    ),
  },
  {
    additionalProperties: false,
    description: "Volcano intent snapshot (Phase 2 schema; immutable at F2).",
  }
);

/** Registers immutable volcano intent and its tile mask for later Civ7 projection. */
export const artifact = defineArtifact({
  name: "volcanoes",
  id: "artifact:morphology.volcanoes",
  schema: Schema,
  refine: validateLocal,
});

/** Requires the volcano intent mask to use one Uint8 value per map tile. */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  appendArtifactTypedArrayIssues(
    issues,
    "volcanoes.volcanoMask",
    value.volcanoMask,
    Uint8Array,
    artifactCellCount(context)
  );
  return issues;
}
