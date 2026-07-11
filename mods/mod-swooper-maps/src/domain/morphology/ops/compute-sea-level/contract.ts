import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Land fraction / hypsometry controls used for sea-level selection.
 */
const HypsometryConfigSchema = Type.Object(
  {
    /** Target global water coverage (0-100). */
    targetWaterPercent: Type.Number({
      description:
        "Target global water coverage (0-100). 55-65 mimics Earth; 70-75 drifts toward archipelago worlds.",
      default: 60,
      minimum: 0,
      maximum: 100,
    }),
    /**
     * Multiplier applied after targetWaterPercent (typically 0.75-1.25).
     * Clamped to 0.25-1.75 to prevent full ocean/land wipeouts.
     */
    targetScalar: Type.Number({
      description:
        "Controls map water coverage by multiplying targetWaterPercent after the base sea-level posture is chosen.",
      default: 1,
      minimum: 0.25,
      maximum: 1.75,
    }),
    /** Optional variance (0-100) applied to the target water percent per map. */
    variance: Type.Number({
      description: "Optional variance (0-100) applied to the target water percent per map.",
      default: 0,
      minimum: 0,
      maximum: 100,
    }),
    /**
     * Soft backstop on the share of land inside the boundary closeness band (0..1).
     * The solver lowers threshold in 5-point steps until boundary share meets this target.
     */
    boundaryShareTarget: Type.Number({
      description:
        "Controls the minimum share of land allowed inside the boundary closeness band (0..1).",
      default: 0.15,
      minimum: 0,
      maximum: 1,
    }),
    /** Desired share of continental crust when balancing land vs. ocean plates (0..1). */
    continentalFraction: Type.Number({
      default: 0.39,
      description:
        "Desired share of continental crust when balancing land vs. ocean plates (0..1).",
      minimum: 0,
      maximum: 1,
    }),
  },
  {
    additionalProperties: false,
    description: "Water coverage controls used to choose sea level from terrain hypsometry.",
  }
);

/**
 * Selects the sea level threshold based on hypsometry targets.
 */
const ComputeSeaLevelContract = defineOp({
  kind: "compute",
  id: "morphology/compute-sea-level",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    elevation: TypedArraySchemas.i16({
      description: "Base elevation per tile (normalized units).",
    }),
    crustType: TypedArraySchemas.u8({
      description: "Crust type per tile (0=oceanic, 1=continental).",
    }),
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    upliftPotential: TypedArraySchemas.u8({
      description: "Uplift potential per tile (0..255).",
    }),
    rngSeed: Type.Integer({ description: "Seed for hypsometry variance (deterministic)." }),
  }),
  output: Type.Object({
    seaLevel: Type.Number({ description: "Sea level threshold derived from hypsometry targets." }),
  }),
  strategies: {
    default: HypsometryConfigSchema,
  },
});

export default ComputeSeaLevelContract;
