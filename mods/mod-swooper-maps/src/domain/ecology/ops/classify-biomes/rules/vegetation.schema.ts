import { Type } from "@swooper/mapgen-core/authoring";

export const VegetationSchema = Type.Object(
  {
    /**
     * Baseline vegetation density (0..1).
     * Acts as the floor for vegetation even in marginal climates.
     */
    base: Type.Number({
      description:
        "Baseline vegetation density (0..1). Acts as the floor even in marginal climates.",
      default: 0.2,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Weight applied to effective moisture when computing vegetation density.
     * Higher values mean wetter regions get denser vegetation.
     */
    moistureWeight: Type.Number({
      description:
        "Weight applied to effective moisture when computing vegetation density (scalar).",
      default: 0.55,
      minimum: 0,
    }),
    /**
     * Extra padding added to the humid threshold when normalizing moisture (units).
     * Larger values soften how quickly vegetation saturates as rainfall increases.
     */
    moistureNormalizationPadding: Type.Number({
      description:
        "Padding added to humid threshold when normalizing moisture (effective moisture units).",
      default: 40,
      minimum: 0,
    }),
  },
  {
    description: "Vegetation density model knobs (base, moisture weight, normalization).",
  }
);
