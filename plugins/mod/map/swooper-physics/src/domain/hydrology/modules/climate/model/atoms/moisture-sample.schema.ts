import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Coeval precipitation and humidity before or after weather-member reduction. */
export const MoistureSampleSchema = Type.Object({
  rainfall: TypedArraySchemas.u8({ description: "Quantized rainfall proxy." }),
  humidity: TypedArraySchemas.u8({ description: "Quantized humidity proxy." }),
}, { additionalProperties: false });
export type MoistureSample = Static<typeof MoistureSampleSchema>;
