import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the sea-level baseline, insolation response, lapse rate, land cooling, and hard
 * temperature bounds. Lapse cooling is empirical in upstream relief units, not physical meters;
 * admitted SST remains authoritative over water.
 */
export default defineStrategy({
  id: "insolation-lapse-rate",
  config: Type.Object(
    {
      /** Global baseline temperature at sea level and mid-insolation. */
      baseTemperatureC: Type.Number({
        default: 9,
        minimum: -40,
        maximum: 60,
        description: "Global baseline temperature at sea level and mid-insolation.",
      }),
      /** Temperature delta contributed by insolation forcing. */
      insolationScaleC: Type.Number({
        default: 47,
        minimum: 0,
        maximum: 80,
        description: "Temperature delta contributed by insolation forcing.",
      }),
      /** Empirical land cooling per relief unit above sea level, not per physical meter. */
      lapseRateCPerElevationUnit: Type.Number({
        default: -0.0065,
        minimum: -0.5,
        maximum: 0,
        description:
          "Temperature change per quantized relief unit above sea level on land, not per meter. The range allows up to 50 C cooling per 100 relief units.",
      }),
      /** Extra cooling applied to land tiles (continentality proxy). */
      landCoolingC: Type.Number({
        default: 2,
        minimum: 0,
        maximum: 15,
        description: "Extra cooling applied to land tiles (continentality proxy).",
      }),
      /** Minimum allowed output temperature (C). */
      minC: Type.Number({
        default: -40,
        minimum: -120,
        maximum: 60,
        description: "Minimum allowed output temperature (C).",
      }),
      /** Maximum allowed output temperature (C). */
      maxC: Type.Number({
        default: 50,
        minimum: -40,
        maximum: 120,
        description: "Maximum allowed output temperature (C).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Combines insolation, elevation lapse, and land cooling into a bounded surface-temperature field while admitted SST remains authoritative over water.",
    }
  ),
});
