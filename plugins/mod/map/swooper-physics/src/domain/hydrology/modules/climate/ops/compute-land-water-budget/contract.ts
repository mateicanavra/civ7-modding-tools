import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { BasinWetBodySchema } from "../../../hydrography/model/atoms/basin-network.schema.js";
import petAridityDefinition from "./strategies/pet-aridity/config.js";

/** Computes distinct atmospheric and plant-water indices from supplied demand and physical water ledgers. */
const ComputeLandWaterBudgetContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-land-water-budget",
  /**
   * Computes atmospheric moisture, PET and aridity alongside plant moisture and stress.
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
      externalWaterMask: TypedArraySchemas.u8({ description: "Prescribed marine water, excluded from terrestrial opportunity." }),
      elevation: TypedArraySchemas.i16({ description: "Sealed ground in the same datum as finite-body heads." }),
      componentId: TypedArraySchemas.i32({ description: "Hydraulic component membership; zero denotes ordinary dry reaches." }),
      discharge: Type.Array(Type.Number({ minimum: 0 }), { description: "Number-precision ordinary dry-edge flux per tile." }),
      runoff: Type.Array(Type.Number({ minimum: 0 }), { description: "Number-precision local precipitation-attributed runoff per tile." }),
      bodies: Type.Array(BasinWetBodySchema, { description: "Complete strict finite wet bodies and their annual input ledgers." }),
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
      plantEffectiveMoisture: TypedArraySchemas.f32({
        description: "Exposed-land rainfall + 0.35*humidity + local annual surface-water opportunity; not root uptake or groundwater.",
      }),
      plantWaterStress: TypedArraySchemas.f32({
        description: "Demand / (demand + rainfall + local annual surface-water opportunity + 1), zero on water.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Distinct atmospheric and plant-water indices, with unchanged atmospheric moisture, PET and aridity.",
    }
  ),
  strategies: [petAridityDefinition],
});

export default ComputeLandWaterBudgetContract;
