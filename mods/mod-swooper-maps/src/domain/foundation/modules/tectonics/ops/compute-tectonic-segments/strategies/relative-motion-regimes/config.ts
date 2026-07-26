import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Configuration contract for classifying plate boundaries from relative motion. */
export default defineStrategy({
  id: "relative-motion-regimes",
  config: Type.Object(
    {
      intensityScale: Type.Number({
        default: 900,
        minimum: 1,
        maximum: 10_000,
        description:
          "Controls how strongly relative plate motion maps into 0..255 boundary segment intensities.",
      }),
      regimeMinIntensity: Type.Integer({
        default: 4,
        minimum: 0,
        maximum: 255,
        description:
          "Sets the minimum boundary intensity required before a segment affects tectonic regime classification.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Relative-motion scaling and inactivity thresholds used to classify plate-boundary regime and intensity.",
    }
  ),
});
