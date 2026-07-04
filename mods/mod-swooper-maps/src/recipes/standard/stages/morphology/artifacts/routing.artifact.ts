import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MorphologyRoutingArtifactSchema = Type.Object(
  {
    flowDir: TypedArraySchemas.i32({
      description: "Steepest-descent receiver index per tile (or -1 for sinks/edges).",
    }),
    flowAccum: TypedArraySchemas.f32({ description: "Drainage area proxy per tile." }),
    basinId: Type.Optional(
      TypedArraySchemas.i32({
        description: "Optional basin identifier per tile (or -1 when unassigned).",
      })
    ),
  },
  { description: "Morphology routing buffer handle (publish once)." }
);

export const Schema = MorphologyRoutingArtifactSchema;

export const artifact = defineArtifact({
  name: "routing",
  id: "artifact:morphology.routing",
  schema: Schema,
});
