import { TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Per-tile material resistance consumed by Morphology erosion and incision. */
export const ErodibilityFieldSchema = TypedArraySchemas.f32({
  description: "Per-tile resistance proxy where larger values admit faster incision.",
});

/** Per-tile loose material available to Morphology erosion and deposition. */
export const SedimentDepthFieldSchema = TypedArraySchemas.f32({
  description: "Per-tile loose-sediment depth available for erosion and deposition.",
});
