import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import petAridityDefinition from "./strategies/pet-aridity/config.js";

/** Computes terrestrial moisture supply and aridity from supplied potential demand. */
const ComputeLandWaterBudgetContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-land-water-budget",
  /**
   * Computes terrestrial effective moisture, PET, and aridity.
   *
   * This op combines rainfall, humidity, and supplied demand into deterministic
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
      /** Double-precision demand preserves pre-extraction aridity before public Float32 rounding. */
      pet: Type.Array(Type.Number({ minimum: 0 }), {
        description: "One double-precision potential-demand sample per tile, supplied by Climate.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Admitted climate inputs for deterministic terrestrial water-budget indices.",
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
      /** Rainfall and humidity expressed on one terrestrial moisture scale. */
      effectiveMoisture: TypedArraySchemas.f32({
        description:
          "Resolved exposed-land rainfall + 0.35*humidity; the authored rainfall and humidity maxima yield 289.25, and water is 0.",
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
