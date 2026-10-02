import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

export default defineStrategy({
  id: "implicit-stream-power",
  config: Type.Object(
    {
      rate: Type.Number({ minimum: 0, maximum: 1, default: 0.15, description: "Dimensionless detachment rate per adjacent-hex evolution cycle." }),
      m: Type.Number({ minimum: 0, maximum: 4, default: 0.5, description: "Exponent applied to certified dry discharge without per-map normalization." }),
      n: Type.Literal(1, { default: 1, description: "Linear normalized-relief slope exponent admitted by the analytic implicit update." }),
    },
    { additionalProperties: false }
  ),
});
