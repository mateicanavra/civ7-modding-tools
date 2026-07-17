import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Runtime contract for deterministic lake intent, map dimensions, and the sink evidence that
 * explains how many planned tiles came from hydrography minima.
 */
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

/** Canonical schema entrypoint for publishing and validating Hydrology lake intent. */
export const Schema = HydrologyLakePlanArtifactSchema;

/**
 * Registers deterministic lake intent and its drainage evidence before map-hydrology stamps
 * static water. Projection outcomes cannot retroactively redefine this Hydrology plan.
 */
export const artifact = defineArtifact({
  name: "lakePlan",
  id: "artifact:hydrology.lakePlan",
  schema: Schema,
});

/** Returns every TypeBox schema issue for deterministic lake intent without throwing. */
export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
