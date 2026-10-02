import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Frozen inland empirical response, with explicit annual offset and existing model-relief/bounds controls. */
export default defineStrategy({
  id: "periodic-response",
  config: Type.Object(
    {
      annualOffsetC: Type.Number({
        default: 0,
        minimum: -60,
        maximum: 60,
        description: "Celsius added to the empirical annual land-temperature mean before independent sea-level and ground clipping.",
      }),
      lapseRateCPerElevationUnit: Type.Number({
        default: -0.0065,
        minimum: -0.5,
        maximum: 0,
        description: "Celsius per quantized model relief unit above sea level, not per meter.",
      }),
      minC: Type.Number({
        default: -40,
        minimum: -120,
        maximum: 60,
        description: "Lower Celsius bound applied independently to sea-level and ground temperatures.",
      }),
      maxC: Type.Number({
        default: 50,
        minimum: -40,
        maximum: 120,
        description: "Upper Celsius bound applied independently to sea-level and ground temperatures.",
      }),
    },
    {
      additionalProperties: false,
      description: "Empirical periodic land-temperature response with annual offset, model-relief cooling, and temperature bounds.",
    }
  ),
});
