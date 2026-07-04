import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MorphologySubstrateArtifactSchema = Type.Object(
  {
    erodibilityK: TypedArraySchemas.f32({
      description: "Erodibility / resistance proxy per tile (higher = easier incision).",
    }),
    sedimentDepth: TypedArraySchemas.f32({
      description: "Loose sediment thickness proxy per tile (higher = deeper deposits).",
    }),
  },
  { description: "Morphology substrate buffer handle (publish once)." }
);

export const Schema = MorphologySubstrateArtifactSchema;

export const artifact = defineArtifact({
  name: "substrate",
  id: "artifact:morphology.substrate",
  schema: Schema,
});
