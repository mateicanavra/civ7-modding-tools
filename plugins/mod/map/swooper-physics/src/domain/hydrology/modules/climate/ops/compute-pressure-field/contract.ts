import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

import ThermalContinentalDefinition from "./strategies/thermal-continental/config.js";

/**
 * Derives a circulation-oriented mean-sea-level pressure-anomaly proxy from latitude, thermal
 * state, land distribution, and deterministic transient weather.
 */
const ComputePressureFieldContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-pressure-field",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      rngSeed: Type.Integer({
        minimum: 0,
        maximum: 2_147_483_647,
        description: "Deterministic RNG seed for the transient pressure term.",
      }),
      seasonSalt: Type.Optional(
        Type.Integer({
          minimum: 0,
          maximum: 2_147_483_647,
          description:
            "Optional decorrelation salt for the transient pressure term. Seasonal callers use one salt per sample.",
        })
      ),
      transientPolarity: Type.Optional(
        Type.Union([Type.Literal(-1), Type.Literal(1)], {
          default: 1,
          description:
            "Invocation-owned sign of the transient pressure sample. Paired callers reuse one season salt with +1 and -1 to form a zero-mean weather ensemble.",
        })
      ),
      latitudeByRow: TypedArraySchemas.f32({
        cardinality: ["height"],
        description:
          "Latitude per row in degrees on the same seasonally lagged frame used by atmospheric circulation.",
      }),
      surfaceTemperatureC: TypedArraySchemas.f32({
        cardinality: ["width", "height"],
        description:
          "Sea-level surface temperature in degrees Celsius for the sampled season phase.",
      }),
      meanSurfaceTemperatureC: TypedArraySchemas.f32({
        cardinality: ["width", "height"],
        description:
          "Sea-level surface temperature averaged over the same phases later used to average pressure.",
      }),
      landMask: TypedArraySchemas.u8({
        cardinality: ["width", "height"],
        description: "Land mask per tile (1=land, 0=water).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Dimension-aligned latitude, thermal, land, and deterministic transient evidence for the circulation pressure proxy.",
    }
  ),
  output: Type.Object(
    {
      pressure: TypedArraySchemas.f32({
        cardinality: ["width", "height"],
        description:
          "Circulation-oriented mean-sea-level pressure-anomaly proxy in hPa, including stationary, seasonal, and transient terms.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Unquantized mean-sea-level pressure-anomaly proxy for atmospheric circulation.",
    }
  ),
  strategies: [ThermalContinentalDefinition],
});

export default ComputePressureFieldContract;
