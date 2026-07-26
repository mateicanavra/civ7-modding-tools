import { Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Domain model for the elevation and surface-classification fields used by Morphology. */
export const MorphologyTopographySchema = Type.Object(
  {
    elevation: TypedArraySchemas.i16({
      description: "Signed normalized relief quantized into Int16 engine elevation units.",
    }),
    seaLevel: Type.Number({
      description: "Global land-water threshold in the same normalized datum as elevation.",
    }),
    landMask: TypedArraySchemas.u8({
      description: "Per-tile land classification where 1 is land and 0 is water.",
    }),
    bathymetry: TypedArraySchemas.i16({
      description:
        "Per-tile water depth below sea level in engine elevation units; land tiles contain 0.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Morphology relief, sea-level, land classification, and bathymetry for one map grid.",
  }
);
