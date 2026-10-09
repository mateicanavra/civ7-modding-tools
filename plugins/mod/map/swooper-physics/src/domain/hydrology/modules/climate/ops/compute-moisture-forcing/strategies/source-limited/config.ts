import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Provisional model rates, not Earth-unit conversions or fitted climate coefficients. */
export default defineStrategy({
  id: "source-limited",
  config: Type.Object(
    {
      marineSourceRate: Type.Number({
        default: 900,
        minimum: 0,
        description: "Provisional marine model-water supply per unit tile area per interval (E0).",
      }),
      backgroundExtractionRate: Type.Number({
        default: 1.2,
        minimum: 0,
        description: "Provisional background fractional rainout rate per interval (k0).",
      }),
      ascentExtractionRate: Type.Number({
        default: 4,
        minimum: 0,
        description: "Provisional maximum additional land-ascent rainout rate per interval (k1).",
      }),
      transportSpeed: Type.Number({
        default: 80,
        minimum: 0,
        description:
          "Provisional reference projected edge lengths per interval at maximum encoded wind (V0), with fixed spacing h=84/width.",
      }),
      terrainGradientReference: Type.Number({
        default: 300,
        exclusiveMinimum: 0,
        description:
          "Provisional model-relief units per reference projected edge length (G0), independent of source amplitude.",
      }),
      wetnessScale: Type.Number({
        default: 1,
        minimum: 0,
        description: "Marine supply multiplier applied once, never to extraction or publication.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Source-limited provisional model rates over fixed H=1; numerical passes are derived privately, not an authored climate mode.",
    }
  ),
});
