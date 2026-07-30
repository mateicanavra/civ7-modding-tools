import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers Morphology-owned mountain, foothill, and rough-land intent for
 * later engine projection and placement suitability. Admission requires
 * map-sized fields and binary membership masks while retaining byte-valued
 * potential measurements.
 */
export const artifact = defineArtifact({
  name: "mountains",
  id: "artifact:morphology.mountains",
  schema: Type.Object(
    {
      mountainMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Mask (1/0): Morphology model intent for mountain terrain.",
      }),
      mountainRegionMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Mask (1/0): Morphology model footprint for orographic provinces, including peak spines, passes, valleys, foothills, and internal rough terrain.",
      }),
      mountainRegionIdByTile: TypedArraySchemas.i32({
        cardinality: "map-grid",
        description: "Per-tile orographic province id (-1 outside the mountain-region footprint).",
      }),
      hillMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Mask (1/0): Morphology model intent for hill terrain excluding mountain tiles.",
      }),
      foothillMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Mask (1/0): ridge-skirt hill terrain intent before non-foothill rough-land merge.",
      }),
      roughLandMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Mask (1/0): non-foothill rough-land hill terrain intent.",
      }),
      orogenyPotential: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Orogeny suitability field used to explain mountain placement.",
      }),
      fracturePotential: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Fracture/rift suitability field used to explain hill and mountain placement.",
      }),
      roughnessPotential: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Rolling-upland, old-highland, plateau-rim, basin-margin, and escarpment roughness field.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Mountain, foothill, and rough-land terrain intent. Morphology owns this model; map-morphology only projects it into engine terrain.",
    }
  ),
  refine: (value, { issues }) => {
    for (const key of [
      "mountainMask",
      "mountainRegionMask",
      "hillMask",
      "foothillMask",
      "roughLandMask",
    ] as const) {
      const valueAtKey = value[key];
      for (let index = 0; index < valueAtKey.length; index += 1) {
        if (valueAtKey[index] !== 0 && valueAtKey[index] !== 1) {
          issues.add(
            `Expected mountains.${key} values to be 0 or 1 (first invalid index ${index}).`
          );
          break;
        }
      }
    }
  },
});
