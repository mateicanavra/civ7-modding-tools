import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Frozen inland empirical response, with explicit annual offset and existing model-relief/bounds controls. */
export default defineStrategy({
  id: "periodic-response",
  config: Type.Object(
    {
      annualOffsetC: Type.Number({ default: 0, minimum: -60, maximum: 60 }),
      lapseRateCPerElevationUnit: Type.Number({
        default: -0.0065,
        minimum: -0.5,
        maximum: 0,
        description: "Celsius per quantized model relief unit above sea level, not per meter.",
      }),
      minC: Type.Number({ default: -40, minimum: -120, maximum: 60 }),
      maxC: Type.Number({ default: 50, minimum: -40, maximum: 120 }),
    },
    { additionalProperties: false }
  ),
});
