import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Coeval float precipitation and independently reduced normalized surface wetness. */
export const MoistureSampleSchema = Type.Object({
  precipitation: TypedArraySchemas.f32({ description: "Unclipped model precipitation in rainfall-index-equivalent units." }),
  surfaceWetness: TypedArraySchemas.f32({ description: "Empirical surface wetness on a normalized 0..1 scale." }),
}, { additionalProperties: false });
export type MoistureSample = Static<typeof MoistureSampleSchema>;
