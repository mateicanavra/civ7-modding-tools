import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

/**
 * Computes evaporation source strength per tile from land/ocean mask and temperature.
 *
 * This is the “moisture supply” input for advection/transport. It must remain deterministic and data-pure.
 */
const ComputeEvaporationSourcesInputSchema = Type.Object(
  {
    /** Tile grid width. */
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    /** Tile grid height. */
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    /** Land mask per tile (1=land, 0=water). */
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    /** Surface temperature proxy (C). */
    surfaceTemperatureC: TypedArraySchemas.f32({ description: "Surface temperature proxy (C)." }),
    /** Optional wind U component per tile (-127..127), for ocean evaporation coupling. */
    windU: Type.Optional(TypedArraySchemas.i8({ description: "Optional wind U component per tile (-127..127)." })),
    /** Optional wind V component per tile (-127..127), for ocean evaporation coupling. */
    windV: Type.Optional(TypedArraySchemas.i8({ description: "Optional wind V component per tile (-127..127)." })),
    /** Optional sea surface temperature (C) per tile, used to drive ocean evaporation. */
    sstC: Type.Optional(TypedArraySchemas.f32({ description: "Optional sea surface temperature (C) per tile." })),
    /** Optional sea ice mask per tile (1=ice, 0=no ice), used to suppress ocean evaporation. */
    seaIceMask: Type.Optional(TypedArraySchemas.u8({ description: "Optional sea ice mask per tile (1=ice, 0=no ice)." })),
  },
  {
    additionalProperties: false,
    description: "Inputs for evaporation source computation (deterministic, data-only).",
  }
);

/**
 * Evaporation strength output (0..1 proxy).
 */
const ComputeEvaporationSourcesOutputSchema = Type.Object(
  {
    /** Evaporation sources proxy (0..1) per tile. */
    evaporation: TypedArraySchemas.f32({ description: "Evaporation sources proxy (0..1) per tile." }),
  },
  {
    additionalProperties: false,
    description: "Evaporation source strength output per tile (0..1 proxy).",
  }
);

/**
 * Default evaporation parameters.
 *
 * Practical guidance:
 * - If oceans should contribute more moisture globally: increase `oceanStrength`.
 * - If land should contribute more moisture (more humid interiors): increase `landStrength`.
 * - If cold regions evaporate too much: increase `minTempC` (shift cut-off upward).
 */
const ComputeEvaporationSourcesDefaultStrategySchema = Type.Object(
  {
    /** Evaporation multiplier applied to water tiles. */
    oceanStrength: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 5,
      description: "Evaporation multiplier applied to water tiles.",
    }),
    /** Evaporation multiplier applied to land tiles. */
    landStrength: Type.Number({
      default: 0.2,
      minimum: 0,
      maximum: 5,
      description: "Evaporation multiplier applied to land tiles.",
    }),
    /** Temperature threshold below which evaporation is ~0. */
    minTempC: Type.Number({
      default: -10,
      minimum: -60,
      maximum: 40,
      description: "Temperature threshold below which evaporation is ~0.",
    }),
    /** Temperature threshold above which evaporation is saturated. */
    maxTempC: Type.Number({
      default: 30,
      minimum: -10,
      maximum: 80,
      description: "Temperature threshold above which evaporation is saturated.",
    }),
  },
  {
    additionalProperties: false,
    description: "Evaporation source parameters (default strategy).",
  }
);

const ComputeEvaporationSourcesContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-evaporation-sources",
  input: ComputeEvaporationSourcesInputSchema,
  output: ComputeEvaporationSourcesOutputSchema,
  strategies: {
    default: ComputeEvaporationSourcesDefaultStrategySchema,
  },
});

export default ComputeEvaporationSourcesContract;
