import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";

/** Daily-mean TOA flux / solar constant; Q_k = cos_k - i sin_k, with phase in turns. */
export const SolarHarmonicsSchema = Type.Object(
  {
    meanQ: Type.Number({ minimum: 0, maximum: 1 }),
    cos1Q: Type.Number({ minimum: -2, maximum: 2 }),
    sin1Q: Type.Number({ minimum: -2, maximum: 2 }),
    cos2Q: Type.Number({ minimum: -2, maximum: 2 }),
    sin2Q: Type.Number({ minimum: -2, maximum: 2 }),
  },
  { additionalProperties: false }
);

export type SolarHarmonics = Static<typeof SolarHarmonicsSchema>;
