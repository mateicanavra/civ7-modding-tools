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
   * This op combines precipitation, surface wetness, and supplied demand into deterministic
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
      runoff: Type.Array(Type.Number({ minimum: 0 }), { description: "Number-precision approximate annual dry-ground water yield per tile." }),
      bodies: Type.Array(BasinWetBodySchema, { description: "Complete strict finite wet bodies and their annual input ledgers." }),
      /** Unclipped finite nonnegative atmospheric precipitation. */
      precipitation: TypedArraySchemas.f32({ description: "Finite nonnegative atmospheric precipitation in rainfall-index units." }),
      /** Independently aggregated normalized atmospheric wetness. */
      surfaceWetness: TypedArraySchemas.f32({ description: "Atmospheric surface wetness in 0..1; not local plant-water supply." }),
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
      /** Potential evapotranspiration proxy (precipitation units, advisory). */
      pet: TypedArraySchemas.f32({
        description: "Potential evapotranspiration proxy (precipitation units, advisory).",
      }),
      /** Precipitation and normalized wetness expressed on one terrestrial moisture scale. */
      effectiveMoisture: TypedArraySchemas.f32({
        description:
          "Resolved exposed-land precipitation + 0.35*255*surfaceWetness; zero on water, with no atmospheric precipitation cap.",
      }),
      /** Aridity index (0..1) derived from precipitation vs PET (advisory). */
      aridityIndex: TypedArraySchemas.f32({
        description: "Aridity index (0..1) derived from precipitation vs PET (advisory).",
      }),
      localSurfaceWaterOpportunity: TypedArraySchemas.f32({
        description: "Local annual surface-water opportunity per represented exposed-land tile area in rainfall-index units; zero on water, not delivered water or permanence.",
      }),
      plantEffectiveMoisture: TypedArraySchemas.f32({
        description: "Exposed-land precipitation + 0.35*255*surfaceWetness + local annual surface-water opportunity; not root uptake or groundwater.",
      }),
      plantWaterStress: TypedArraySchemas.f32({
        description: "Demand / (demand + precipitation + local annual surface-water opportunity + 1), zero on water.",
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
