import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

const MorphologyMountainsArtifactSchema = Type.Object(
  {
    mountainMask: TypedArraySchemas.u8({
      description: "Mask (1/0): Morphology truth intent for mountain terrain.",
    }),
    mountainRegionMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): Morphology truth footprint for orographic provinces, including peak spines, passes, valleys, foothills, and internal rough terrain.",
    }),
    mountainRegionIdByTile: TypedArraySchemas.i32({
      description: "Per-tile orographic province id (-1 outside the mountain-region footprint).",
    }),
    hillMask: TypedArraySchemas.u8({
      description: "Mask (1/0): Morphology truth intent for hill terrain excluding mountain tiles.",
    }),
    foothillMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): ridge-skirt hill terrain intent before non-foothill rough-land merge.",
    }),
    roughLandMask: TypedArraySchemas.u8({
      description: "Mask (1/0): non-foothill rough-land hill terrain intent.",
    }),
    orogenyPotential: TypedArraySchemas.u8({
      description: "Orogeny suitability field used to explain mountain placement.",
    }),
    fracturePotential: TypedArraySchemas.u8({
      description: "Fracture/rift suitability field used to explain hill and mountain placement.",
    }),
    roughnessPotential: TypedArraySchemas.u8({
      description:
        "Rolling-upland, old-highland, plateau-rim, basin-margin, and escarpment roughness field.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Mountain, foothill, and rough-land terrain intent. Morphology owns this truth; map-morphology only projects it into engine terrain.",
  }
);

export const Schema = MorphologyMountainsArtifactSchema;

export const artifact = defineArtifact({
  name: "mountains",
  id: "artifact:morphology.mountains",
  schema: Schema,
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
