import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

/**
 * Computes a prevailing wind field (U/V) from latitude plus deterministic structure/noise.
 *
 * Important invariants:
 * - RNG crosses the op boundary as *data only* (`rngSeed`). The op must construct its own local RNG.
 * - Outputs are deterministic given the same seed + inputs.
 *
 * Practical guidance:
 * - If winds feel too uniform: increase `windVariance` and/or `windJetStreaks`.
 * - If winds dominate too strongly: decrease `windJetStrength`.
 */
const ComputeAtmosphericCirculationInputSchema = Type.Object(
  {
    /** Tile grid width. */
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    /** Tile grid height. */
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    /** Latitude by row in degrees; length must equal `height`. */
    latitudeByRow: TypedArraySchemas.f32({ description: "Latitude per row (degrees)." }),
    /** Deterministic RNG seed (derived in the step; pure data). */
    rngSeed: Type.Integer({
      minimum: 0,
      maximum: 2_147_483_647,
      description: "Deterministic RNG seed (derived in the step; pure data).",
    }),
    /** Optional land mask per tile (1=land, 0=water). */
    landMask: Type.Optional(TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." })),
    /** Optional elevation (meters-ish) per tile (signed). */
    elevation: Type.Optional(TypedArraySchemas.i16({ description: "Elevation per tile (optional; signed meters-ish)." })),
    /** Optional season phase (0..1), where 0 and 1 represent the same point in the cycle. */
    seasonPhase01: Type.Optional(
      Type.Number({
        minimum: 0,
        maximum: 1,
        description: "Optional season phase (0..1), where 0 and 1 represent the same point in the cycle.",
      })
    ),
  },
  {
    additionalProperties: false,
    description: "Inputs for wind-field computation (deterministic, data-only).",
  }
);

/**
 * Wind field output (discrete i8 components).
 */
const ComputeAtmosphericCirculationOutputSchema = Type.Object(
  {
    /** Wind U component per tile (-127..127). */
    windU: TypedArraySchemas.i8({ description: "Wind U component per tile (-127..127)." }),
    /** Wind V component per tile (-127..127). */
    windV: TypedArraySchemas.i8({ description: "Wind V component per tile (-127..127)." }),
  },
  {
    additionalProperties: false,
    description: "Wind field output per tile (U/V components).",
  }
);

/**
 * Default wind-field parameters.
 */
const ComputeAtmosphericCirculationDefaultStrategySchema = Type.Object(
  {
    /** Number of jet stream bands influencing storm tracks (higher = more bands). */
    windJetStreaks: Type.Integer({
      default: 3,
      minimum: 0,
      maximum: 12,
      description: "Number of jet stream bands influencing storm tracks.",
    }),
    /** Overall jet stream intensity multiplier (higher = stronger prevailing winds). */
    windJetStrength: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 5,
      description: "Overall jet stream intensity multiplier.",
    }),
    /** Directional variance applied to winds (higher = noisier/more variable). */
    windVariance: Type.Number({
      default: 0.6,
      minimum: 0,
      maximum: 2,
      description: "Directional variance applied to winds.",
    }),
  },
  {
    additionalProperties: false,
    description: "Atmospheric circulation parameters (default strategy).",
  }
);

/**
 * Earthlike wind-field parameters.
 *
 * This strategy aims for tile-varying winds with coherent structure (planetary waves + noise-driven pressure gradients),
 * while remaining deterministic and bounded-cost. It is a gameplay-oriented proxy, not a CFD atmosphere.
 */
const ComputeAtmosphericCirculationEarthlikeStrategySchema = Type.Object(
  {
    /** Max physical-ish speed used for quantization to i8 (higher = weaker output for same internal field). */
    maxSpeed: Type.Number({
      default: 110,
      minimum: 1,
      maximum: 400,
      description: "Max speed used for quantization to i8 (higher = weaker output for same internal field).",
    }),
    /** Base zonal (east-west) circulation strength. */
    zonalStrength: Type.Number({
      default: 90,
      minimum: 0,
      maximum: 300,
      description: "Base zonal (east-west) circulation strength.",
    }),
    /** Base meridional (north-south) circulation strength. */
    meridionalStrength: Type.Number({
      default: 30,
      minimum: 0,
      maximum: 200,
      description: "Base meridional (north-south) circulation strength.",
    }),
    /** Strength of geostrophic-like flow derived from a pressure gradient proxy. */
    geostrophicStrength: Type.Number({
      default: 70,
      minimum: 0,
      maximum: 400,
      description: "Strength of geostrophic-like flow derived from a pressure gradient proxy.",
    }),
    /** Spatial scale (in tiles) for pressure noise. */
    pressureNoiseScale: Type.Number({
      default: 18,
      minimum: 2,
      maximum: 128,
      description: "Spatial scale (in tiles) for pressure noise.",
    }),
    /** Amplitude of pressure noise (higher = more meander/eddies). */
    pressureNoiseAmp: Type.Number({
      default: 55,
      minimum: 0,
      maximum: 400,
      description: "Amplitude of pressure noise (higher = more meander/eddies).",
    }),
    /** Planetary wave strength (longitude-dependent meanders). */
    waveStrength: Type.Number({
      default: 45,
      minimum: 0,
      maximum: 300,
      description: "Planetary wave strength (longitude-dependent meanders).",
    }),
    /** Land heating influence (requires `landMask`; ignored if absent). */
    landHeatStrength: Type.Number({
      default: 20,
      minimum: 0,
      maximum: 200,
      description: "Land heating influence (requires landMask; ignored if absent).",
    }),
    /** Orography influence (requires `elevation`; ignored if absent). */
    mountainDeflectStrength: Type.Number({
      default: 18,
      minimum: 0,
      maximum: 200,
      description: "Orography influence (requires elevation; ignored if absent).",
    }),
    /** Bounded smoothing passes over the vector field (higher = smoother, less noisy). */
    smoothIters: Type.Integer({
      default: 4,
      minimum: 0,
      maximum: 16,
      description: "Bounded smoothing passes over the vector field (higher = smoother, less noisy).",
    }),
  },
  {
    additionalProperties: false,
    description: "Atmospheric circulation parameters (earthlike strategy).",
  }
);

const ComputeAtmosphericCirculationContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-atmospheric-circulation",
  input: ComputeAtmosphericCirculationInputSchema,
  output: ComputeAtmosphericCirculationOutputSchema,
  strategies: {
    default: ComputeAtmosphericCirculationDefaultStrategySchema,
    earthlike: ComputeAtmosphericCirculationEarthlikeStrategySchema,
  },
});

export default ComputeAtmosphericCirculationContract;
