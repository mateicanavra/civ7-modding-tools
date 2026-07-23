import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Requires hydromorphic substrate, then favors fertile, waterlogged temperate land.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "temperate-hydromorphic",
  config: Type.Object({
    waterMin01: Type.Number({
      default: 0.55,
      minimum: 0,
      maximum: 1,
      description: "Minimum water availability for marsh suitability.",
    }),
    fertilityMin01: Type.Number({
      default: 0.2,
      minimum: 0,
      maximum: 1,
      description: "Minimum soil fertility for marsh suitability.",
    }),
    aridityMax01: Type.Number({
      default: 0.6,
      minimum: 0,
      maximum: 1,
      description: "Maximum aridity for marsh suitability.",
    }),
    tempMinC: Type.Number({
      default: -2,
      minimum: -100,
      maximum: 100,
      description: "Minimum temperature for marsh suitability.",
    }),
    tempPeakC: Type.Number({
      default: 10,
      minimum: -100,
      maximum: 100,
      description: "Temperature of peak marsh suitability.",
    }),
    tempMaxC: Type.Number({
      default: 24,
      minimum: -100,
      maximum: 100,
      description: "Maximum temperature for marsh suitability.",
    }),
  }),
});
