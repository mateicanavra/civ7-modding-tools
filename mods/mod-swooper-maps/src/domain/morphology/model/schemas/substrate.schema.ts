import { Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Domain model for per-tile material properties consumed by Morphology erosion. */
export const MorphologySubstrateSchema = Type.Object(
  {
    erodibilityK: TypedArraySchemas.f32({
      description: "Per-tile resistance proxy where larger values admit faster incision.",
    }),
    sedimentDepth: TypedArraySchemas.f32({
      description: "Per-tile loose-sediment depth available for erosion and deposition.",
    }),
  },
  {
    additionalProperties: false,
    description: "Per-tile erodibility and available sediment used by Morphology operations.",
  }
);
