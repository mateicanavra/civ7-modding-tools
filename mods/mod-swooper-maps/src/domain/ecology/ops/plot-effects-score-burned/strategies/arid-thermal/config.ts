import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";
import { BiomeSymbolSchema } from "../../../../model/schemas/index.js";

/**
 * Combines heat, aridity, low moisture, sparse vegetation, and biome admission into burned suitability.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "arid-thermal",
  config: Type.Object({
    minAridity: Type.Number({
      default: 0.45,
      minimum: 0,
      maximum: 1,
      description: "Burned is eligible when aridityIndex >= minAridity (0..1).",
    }),
    minTemperature: Type.Number({
      default: 20,
      minimum: -100,
      maximum: 100,
      description: "Burned is eligible when surfaceTemperature >= minTemperature (C).",
    }),
    maxFreeze: Type.Number({
      default: 0.2,
      minimum: 0,
      maximum: 1,
      description: "Burned is eligible when freezeIndex <= maxFreeze (0..1).",
    }),
    maxVegetation: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description: "Burned is eligible when vegetationDensity <= maxVegetation (0..1).",
    }),
    maxMoisture: Type.Number({
      default: 110,
      minimum: 0,
      maximum: 1000,
      description: "Burned is eligible when effectiveMoisture <= maxMoisture.",
    }),
    allowedBiomes: Type.Array(BiomeSymbolSchema, {
      default: ["temperateDry", "tropicalSeasonal"],
      description: "Biome symbols allowed to emit burned plot effects (allowlist).",
    }),
  }),
});
