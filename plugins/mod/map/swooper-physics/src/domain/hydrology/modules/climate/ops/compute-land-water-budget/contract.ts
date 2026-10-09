import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import petAridityDefinition from "./strategies/pet-aridity/config.js";

/** Computes terrestrial moisture supply and aridity from supplied potential demand. */
const ComputeLandWaterBudgetContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-land-water-budget",
  /**
   * Computes terrestrial effective moisture, PET, and aridity.
   *
   * This op combines precipitation, empirical surface wetness, supplied demand, and river hierarchy into deterministic
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
      /** Authoritative deposited model water, independent of the native rainfall byte. */
      precipitation: TypedArraySchemas.f32({ description: "Finite nonnegative model precipitation per tile without codec saturation." }),
      /** Empirical wetness proxy, not independent atmospheric humidity. */
      surfaceWetness: TypedArraySchemas.f32({ description: "Finite empirical surface wetness in 0..1." }),
      /** Double-precision demand preserves pre-extraction aridity before public Float32 rounding. */
      pet: Type.Array(Type.Number({ minimum: 0 }), {
        description: "One double-precision potential-demand sample per tile, supplied by Climate.",
      }),
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
      /** Potential evapotranspiration proxy (model water units, advisory). */
      pet: TypedArraySchemas.f32({
        description: "Potential evapotranspiration proxy (model water units, advisory).",
      }),
      /** Precipitation, normalized wetness, and nearby river influence on the terrestrial moisture scale. */
      effectiveMoisture: TypedArraySchemas.f32({
        description:
          "Land-only precipitation + 0.35*(255*surfaceWetness) + radius-1 wrapped-hex river bonus (minor=4, major=8); atmospheric precipitation is unchanged, and water is 0.",
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
