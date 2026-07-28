import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import petAridityDefinition from "./strategies/pet-aridity/config.js";

/** Computes terrestrial moisture supply, potential evapotranspiration, and aridity. */
const ComputeLandWaterBudgetContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-land-water-budget",
  /**
   * Computes terrestrial effective moisture, PET, and aridity.
   *
   * This op combines rainfall, humidity, temperature, and river hierarchy into deterministic
   * advisory indices. Consumers use these outputs rather than re-deriving local variants.
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /** Rainfall (0..200) per tile. */
      rainfall: TypedArraySchemas.u8({ description: "Rainfall (0..200) per tile." }),
      /** Humidity (0..255) per tile. */
      humidity: TypedArraySchemas.u8({ description: "Humidity (0..255) per tile." }),
      /** Surface temperature proxy (C). */
      surfaceTemperatureC: TypedArraySchemas.f32({ description: "Surface temperature proxy (C)." }),
      /** Hydrology river hierarchy used to derive local riparian moisture influence. */
      riverClass: TypedArraySchemas.u8({
        description:
          "Hydrology river class per tile (0=none, 1=minor, 2+=major) used for riparian moisture.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Admitted climate and river inputs for deterministic terrestrial water-budget indices.",
    }
  ),
  /**
   * Terrestrial water-budget outputs (effective moisture, PET, and aridity).
   */
  output: Type.Object(
    {
      /** Potential evapotranspiration proxy (rainfall units, advisory). */
      pet: TypedArraySchemas.f32({
        description: "Potential evapotranspiration proxy (rainfall units, advisory).",
      }),
      /** Rainfall, humidity, and nearby river influence expressed on one terrestrial moisture scale. */
      effectiveMoisture: TypedArraySchemas.f32({
        description:
          "Land-only rainfall + 0.35*humidity + radius-1 wrapped-hex river bonus (minor=4, major=8); the authored rainfall and humidity maxima yield 297.25, and water is 0.",
      }),
      /** Aridity index (0..1) derived from precipitation vs PET (advisory). */
      aridityIndex: TypedArraySchemas.f32({
        description: "Aridity index (0..1) derived from precipitation vs PET (advisory).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Land water budget outputs: effective terrestrial moisture, PET proxy, and aridity index.",
    }
  ),
  strategies: [petAridityDefinition],
});

export default ComputeLandWaterBudgetContract;
