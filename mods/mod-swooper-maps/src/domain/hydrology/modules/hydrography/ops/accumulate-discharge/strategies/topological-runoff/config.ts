import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines how rainfall becomes local runoff through scaling, infiltration, humidity dampening, and
 * a source floor. Defaults preserve most rainfall signal while leaving receiver topology entirely
 * under the drainage operation's authority.
 */
export default defineStrategy({
  id: "topological-runoff",
  config: Type.Object(
    {
      /** Linear scale applied to rainfall when computing a runoff proxy. */
      runoffScale: Type.Number({
        default: 1,
        minimum: 0,
        maximum: 10,
        description: "Linear scale applied to rainfall when computing a runoff proxy.",
      }),
      /** Fraction of runoff removed as infiltration (dimensionless). */
      infiltrationFraction: Type.Number({
        default: 0.15,
        minimum: 0,
        maximum: 1,
        description: "Fraction of runoff removed as infiltration (dimensionless).",
      }),
      /** How much humidity reduces runoff source (dimensionless). */
      humidityDampening: Type.Number({
        default: 0.25,
        minimum: 0,
        maximum: 1,
        description: "How much humidity reduces runoff source (dimensionless).",
      }),
      /** Minimum runoff source value (after scaling). */
      minRunoff: Type.Number({
        default: 0,
        minimum: 0,
        maximum: 200,
        description: "Minimum runoff source value (after scaling).",
      }),
    },
    {
      additionalProperties: false,
      description: "Discharge accumulation parameters (topological-runoff strategy).",
    }
  ),
});
