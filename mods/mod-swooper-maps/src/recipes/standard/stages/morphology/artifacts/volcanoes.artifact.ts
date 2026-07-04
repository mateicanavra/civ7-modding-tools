import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const VolcanoKindSchema = Type.Union([
  Type.Literal("subductionArc"),
  Type.Literal("rift"),
  Type.Literal("hotspot"),
]);

const MorphologyVolcanoesArtifactSchema = Type.Object(
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

export const Schema = MorphologyVolcanoesArtifactSchema;

export const artifact = defineArtifact({
  name: "volcanoes",
  id: "artifact:morphology.volcanoes",
  schema: Schema,
});
