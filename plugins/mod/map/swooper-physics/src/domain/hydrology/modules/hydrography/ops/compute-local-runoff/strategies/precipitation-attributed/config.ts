import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Local precipitation withholding fractions for infiltration and wetness, without a runoff floor. */
export default defineStrategy({
  id: "precipitation-attributed",
  config: Type.Object(
    {
      infiltrationFraction: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.15,
        description: "Fraction of local model precipitation withheld from runoff.",
      }),
      wetnessDampening: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.25,
        description: "Surface-wetness-dependent fraction of the remaining local precipitation withheld.",
      }),
    },
    {
      additionalProperties: false,
      description: "Attributes local runoff to model precipitation after infiltration and surface-wetness withholding.",
    }
  ),
});
