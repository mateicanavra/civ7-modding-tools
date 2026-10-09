import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Coeval float precipitation and already-clamped empirical surface wetness. */
export const MoistureSampleSchema = Type.Object({
  precipitation: TypedArraySchemas.f32({ description: "Nonnegative deposited model water per unit tile area over one interval." }),
  surfaceWetness: TypedArraySchemas.f32({ description: "Empirical member surface wetness in 0..1, clamped before weather reduction." }),
}, { additionalProperties: false });
export type MoistureSample = Static<typeof MoistureSampleSchema>;
