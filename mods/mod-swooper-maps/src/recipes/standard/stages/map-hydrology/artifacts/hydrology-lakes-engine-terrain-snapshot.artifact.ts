import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot.",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask after lake projection (1=land, 0=water).",
    }),
    terrain: TypedArraySchemas.u8({
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
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
