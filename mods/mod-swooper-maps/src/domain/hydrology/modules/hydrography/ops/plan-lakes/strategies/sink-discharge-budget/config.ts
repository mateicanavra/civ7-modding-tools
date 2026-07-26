import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the sink-discharge percentile, primary-lake land budget, and optional upstream expansion
 * depth. Defaults admit only the upper 22 percent of positive sink discharge, cap primary lakes at
 * six percent of land, and disable expansion.
 */
export default defineStrategy({
  id: "sink-discharge-budget",
  config: Type.Object(
    {
      maxUpstreamSteps: Type.Integer({
        minimum: 0,
        maximum: 8,
        default: 0,
        description:
          "How many upstream drainage hops to include from sink tiles when expanding planned lakes.",
      }),
      sinkDischargePercentileMin: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.78,
        description:
          "Minimum percentile among positive land-sink discharge values required for terminal-basin lake admission.",
      }),
      maxLakeLandFraction: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.06,
        description:
          "Maximum share of Morphology land tiles admitted as primary sink lakes before upstream expansion.",
      }),
    },
    {
      description:
        "Budgets terminal-basin lake admission by sink-discharge rank, land share, and bounded upstream expansion depth.",
    }
  ),
});
