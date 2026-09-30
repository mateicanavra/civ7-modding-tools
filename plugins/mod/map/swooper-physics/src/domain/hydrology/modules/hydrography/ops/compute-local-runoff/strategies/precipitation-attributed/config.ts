import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Local rainfall withholding fractions for infiltration and humidity, without an independent runoff floor. */
export default defineStrategy({
  id: "precipitation-attributed",
  config: Type.Object(
    {
      infiltrationFraction: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.15,
        description: "Fraction of local rainfall withheld from runoff.",
      }),
      humidityDampening: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.25,
        description: "Humidity-dependent fraction of the remaining local rainfall withheld.",
      }),
    },
    {
      additionalProperties: false,
      description: "Attributes local runoff to rainfall after infiltration and humidity-dependent withholding.",
    }
  ),
});
