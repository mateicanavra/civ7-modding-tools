import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the temperature response, PET baseline, and humidity dampening used by the land-water
 * budget. Defaults model moderate atmospheric demand while leaving rainfall as the balancing
 * supply.
 */
export default defineStrategy({
  id: "pet-aridity",
  config: Type.Object(
    {
      /** Minimum temperature for PET scaling (C). */
      tMinC: Type.Number({
        default: 0,
        minimum: -60,
        maximum: 40,
        description: "Minimum temperature for PET scaling (C).",
      }),
      /** Maximum temperature for PET scaling (C). */
      tMaxC: Type.Number({
        default: 35,
        minimum: -10,
        maximum: 80,
        description: "Maximum temperature for PET scaling (C).",
      }),
      /** Baseline PET value (rainfall units). */
      petBase: Type.Number({
        default: 18,
        minimum: 0,
        maximum: 200,
        description: "Baseline PET value (rainfall units).",
      }),
      /** Temperature contribution to PET scaling. */
      petTemperatureWeight: Type.Number({
        default: 75,
        minimum: 0,
        maximum: 400,
        description: "Temperature contribution to PET scaling.",
      }),
      /** How much humidity reduces PET (0..1). */
      humidityDampening: Type.Number({
        default: 0.55,
        minimum: 0,
        maximum: 1,
        description: "How much humidity reduces PET (0..1).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Maps temperature and humidity to potential evapotranspiration demand used with rainfall to derive terrestrial aridity.",
    }
  ),
});
