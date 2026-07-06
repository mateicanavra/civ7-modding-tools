import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

export const HydrologyLakePlanArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    lakeMask: TypedArraySchemas.u8({
      description: "Deterministic Hydrology lake intent mask (1=planned lake, 0=not planned).",
    }),
    plannedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles marked as planned lakes.",
    }),
    sinkLakeCount: Type.Integer({
      minimum: 0,
      description: "Count of hydrography sink tiles mapped to lake tiles.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology-owned deterministic lake intent plan consumed by map-hydrology projection and placement.",
  }
);

export const Schema = HydrologyLakePlanArtifactSchema;

export const artifact = defineArtifact({
  name: "lakePlan",
  id: "artifact:hydrology.lakePlan",
  schema: Schema,
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
