import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers seasonal rainfall and humidity amplitudes together with the sampled seasonal mode
 * count. Consumers can reason about moisture variability without rerunning the baseline pass.
 */
export const artifact = defineArtifact({
  name: "climateSeasonality",
  id: "artifact:hydrology.climateSeasonality",
  schema: Type.Object(
    {
      modeCount: Type.Union([Type.Literal(2), Type.Literal(4)], {
        description: "Seasonal sampling resolution: solstices or quarter-year modes.",
      }),
      axialTiltDeg: Type.Number({
        minimum: 0,
        maximum: 45,
        description:
          "Axial tilt used to derive seasonal declination; zero produces no seasonal amplitude.",
      }),
      rainfallAmplitude: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Difference between dry- and wet-season rainfall signals per tile (0..255).",
      }),
      humidityAmplitude: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Difference between dry- and wet-season humidity signals per tile (0..255).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Seasonal rainfall and humidity variability corresponding to the annual-mean baseline climate vintage.",
    }
  ),
});
