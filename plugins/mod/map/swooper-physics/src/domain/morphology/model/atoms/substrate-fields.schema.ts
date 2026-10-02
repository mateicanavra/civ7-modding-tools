import { TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Per-tile material resistance consumed by Morphology erosion and incision. */
export const ErodibilityFieldSchema = TypedArraySchemas.f32({
  cardinality: "map-grid",
  description: "Per-tile resistance proxy where larger values admit faster incision.",
});

/** Per-tile loose material retained for landform and pedology consumers. */
export const SedimentDepthFieldSchema = TypedArraySchemas.f32({
  cardinality: "map-grid",
  description: "Per-tile loose-sediment depth retained as material substrate.",
});
