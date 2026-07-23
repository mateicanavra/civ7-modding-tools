import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";
import { BiomeSymbolSchema } from "../../../../model/schemas/index.js";

/**
 * Combines tropical heat, moisture, and vegetation density within the rainforest allowlist.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "hot-wet-dense",
  config: Type.Object({
    minTemperature: Type.Number({
      default: 22,
      minimum: -100,
      maximum: 100,
      description: "Jungle is eligible when surfaceTemperature >= minTemperature (C).",
    }),
    minMoisture: Type.Number({
      default: 110,
      minimum: 0,
      maximum: 1000,
      description: "Jungle is eligible when effectiveMoisture >= minMoisture.",
    }),
    minVegetation: Type.Number({
      default: 0.45,
      minimum: 0,
      maximum: 1,
      description: "Jungle is eligible when vegetationDensity >= minVegetation (0..1).",
    }),
    allowedBiomes: Type.Array(BiomeSymbolSchema, {
      default: ["tropicalRainforest"],
      description: "Biome symbols allowed to emit jungle plot effects (allowlist).",
    }),
  }),
});
