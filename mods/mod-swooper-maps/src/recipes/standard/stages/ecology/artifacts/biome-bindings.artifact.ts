import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Runtime contract for Ecology-symbol-to-engine-biome readback, including collision and
 * land/water mismatch evidence at the projection boundary.
 */
export const BiomeBindingsArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    engineBiomeId: TypedArraySchemas.u16({
      description: "Engine biome id resolved from biome symbols (tile order).",
    }),
    bindingClass: TypedArraySchemas.u8({
      description:
        "Binding class per tile (0=water, 1=unique binding, 2=colliding binding where multiple symbols map to same engine biome).",
    }),
    collapsedBindingCount: Type.Integer({
      minimum: 0,
      description:
        "Count of land tiles whose symbol maps through a colliding engine biome binding.",
    }),
    landWaterMismatchCount: Type.Integer({
      minimum: 0,
      description: "Count of land-mask mismatches between Morphology truth and engine water state.",
    }),
  },
  { additionalProperties: false }
);

export type BiomeBindingsArtifact = Static<typeof BiomeBindingsArtifactSchema>;

/** Canonical schema entrypoint used to register and validate biome-binding readback. */
export const Schema = BiomeBindingsArtifactSchema;

/**
 * Registers map-ecology readback that binds each Ecology biome symbol to the Civ7 biome ID
 * applied per tile. Collision and land/water mismatch evidence lets projection be verified
 * without treating engine IDs as Ecology truth.
 */
export const artifact = defineArtifact({
  name: "biomeBindings",
  id: "artifact:ecology.biomeBindings",
  schema: Schema,
});

/** Returns every TypeBox schema issue for biome-symbol engine bindings without throwing. */
export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
