import { Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Per-tile signed relief in the normalized elevation datum shared by Morphology vintages. */
export const ElevationFieldSchema = TypedArraySchemas.i16({
  cardinality: "map-grid",
  description: "Signed normalized relief quantized into Int16 engine elevation units.",
});

/** Global land-water threshold expressed in the same normalized datum as elevation. */
export const SeaLevelDatumSchema = Type.Number({
  description: "Global land-water threshold in the same normalized datum as elevation.",
});

/** Per-tile surface classification shared by Morphology's topography vintages. */
export const LandMaskSchema = TypedArraySchemas.u8({
  cardinality: "map-grid",
  description: "Per-tile land classification where 1 is land and 0 is water.",
});

/** Per-tile submerged relief retained alongside each Morphology topography vintage. */
export const BathymetryFieldSchema = TypedArraySchemas.i16({
  cardinality: "map-grid",
  description:
    "Per-tile water depth below sea level in engine elevation units; land tiles contain 0.",
});
