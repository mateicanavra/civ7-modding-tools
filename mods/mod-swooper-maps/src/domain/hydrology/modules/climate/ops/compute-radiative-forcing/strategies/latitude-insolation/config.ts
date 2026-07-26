import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Latitude, seasonality, and polar attenuation produce deterministic bounded insolation for every tile. */
export default defineStrategy({
  id: "latitude-insolation",
  config: Type.Object(
    {
      /** Insolation proxy at the equator (baseline scale). */
      equatorInsolation: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 2,
        description: "Insolation proxy at the equator.",
      }),
      /** Insolation proxy at the poles (baseline scale). */
      poleInsolation: Type.Number({
        default: 0.25,
        minimum: 0,
        maximum: 2,
        description: "Insolation proxy at the poles.",
      }),
      /** Controls how sharply forcing falls off with latitude (higher = sharper falloff). */
      latitudeExponent: Type.Number({
        default: 1.2,
        minimum: 0.1,
        maximum: 6,
        description: "Controls how sharply forcing falls off with latitude.",
      }),
    },
    {
      additionalProperties: false,
      description: "Radiative forcing parameters (latitude-insolation strategy).",
    }
  ),
});
