import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

/**
 * Computes an ocean surface thermal state (SST + sea-ice proxy) from latitude and surface currents.
 *
 * This is a gameplay-oriented proxy intended to make currents matter in downstream climate:
 * - Deterministic, bounded iterations
 * - Water-only advection/diffusion
 */
const ComputeOceanThermalStateInputSchema = Type.Object(
  {
    /** Tile grid width. */
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    /** Tile grid height. */
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    /** Latitude by row in degrees; length must equal `height`. */
    latitudeByRow: TypedArraySchemas.f32({ description: "Latitude per row (degrees)." }),
    /** Water mask per tile (1=water, 0=land). */
    isWaterMask: TypedArraySchemas.u8({ description: "Water mask per tile (1=water, 0=land)." }),
    /** Current U component per tile (-127..127). */
    currentU: TypedArraySchemas.i8({ description: "Current U component per tile (-127..127)." }),
    /** Current V component per tile (-127..127). */
    currentV: TypedArraySchemas.i8({ description: "Current V component per tile (-127..127)." }),
  },
  {
    additionalProperties: false,
    description: "Inputs for ocean thermal state computation (deterministic, data-only).",
  }
);

const ComputeOceanThermalStateOutputSchema = Type.Object(
  {
    /** Sea surface temperature (C) per tile. */
    sstC: TypedArraySchemas.f32({ description: "Sea surface temperature (C) per tile." }),
    /** Sea ice mask per tile (1=ice, 0=no ice). */
    seaIceMask: TypedArraySchemas.u8({ description: "Sea ice mask per tile (1=ice, 0=no ice)." }),
  },
  {
    additionalProperties: false,
    description: "Ocean thermal outputs (SST + sea ice mask).",
  }
);

const ComputeOceanThermalStateDefaultStrategySchema = Type.Object(
  {
    /** Equator baseline SST (C). */
    equatorTempC: Type.Number({
      default: 28,
      minimum: -10,
      maximum: 60,
      description: "Equator baseline SST (C).",
    }),
    /** Pole baseline SST (C). */
    poleTempC: Type.Number({
      default: -2,
      minimum: -10,
      maximum: 20,
      description: "Pole baseline SST (C).",
    }),
    /** Fixed advection iterations (no convergence loops). */
    advectIters: Type.Integer({
      default: 28,
      minimum: 0,
      maximum: 300,
      description: "Fixed advection iterations (no convergence loops).",
    }),
    /** Diffusion strength (0..1) mixed into each iteration. */
    diffusion: Type.Number({
      default: 0.18,
      minimum: 0,
      maximum: 1,
      description: "Diffusion strength (0..1) mixed into each iteration.",
    }),
    /** Minimum normalized weight for a secondary upcurrent neighbor to be considered. */
    secondaryWeightMin: Type.Number({
      default: 0.25,
      minimum: 0,
      maximum: 1,
      description: "Minimum normalized weight for a secondary upcurrent neighbor to be considered.",
    }),
    /** SST threshold at which sea ice forms (C). */
    seaIceThresholdC: Type.Number({
      default: -1,
      minimum: -10,
      maximum: 5,
      description: "SST threshold at which sea ice forms (C).",
    }),
  },
  {
    additionalProperties: false,
    description: "Ocean thermal parameters (default strategy).",
  }
);

const ComputeOceanThermalStateContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-ocean-thermal-state",
  input: ComputeOceanThermalStateInputSchema,
  output: ComputeOceanThermalStateOutputSchema,
  strategies: {
    default: ComputeOceanThermalStateDefaultStrategySchema,
  },
});

export default ComputeOceanThermalStateContract;

