import type { Static, TSchema } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

import { Schema as FoundationCrustSchema } from "../../artifacts/crust.artifact.js";
import { Schema as FoundationMantleForcingSchema } from "../../artifacts/mantle-forcing.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";

function withDescription<T extends TSchema>(schema: T, description: string) {
  const { additionalProperties: _additionalProperties, default: _default, ...rest } = schema as any;
  return Type.Unsafe<Static<T>>({ ...rest, description } as any);
}

/** Default strategy configuration for computing basaltic-lid crust truth + derived drivers. */
const StrategySchema = Type.Object(
  {
    /** Basaltic lid thickness proxy (0..1). Controls baseline lithosphere strength and buoyancy. */
    basalticThickness01: Type.Number({
      default: 0.25,
      minimum: 0,
      maximum: 1,
      description:
        "Basaltic lid thickness proxy (0..1). Controls baseline lithosphere strength and buoyancy.",
    }),
    /** Yield strength scalar for the lithosphere (0..1). */
    yieldStrength01: Type.Number({
      default: 0.55,
      minimum: 0,
      maximum: 1,
      description:
        "Controls lithosphere yield strength before mantle coupling and rift weakening are applied.",
    }),
    /** Mantle coupling scalar (0..1) used to scale initial strength (mantle-coupled baseline). */
    mantleCoupling01: Type.Number({
      default: 0.6,
      minimum: 0,
      maximum: 1,
      description:
        "Mantle coupling scalar (0..1) used to scale initial strength (mantle-coupled baseline).",
    }),
    /** Rift weakening scalar (0..1). Reserved for event-driven weakening in later slices. */
    riftWeakening01: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description:
        "Controls how strongly rift contexts weaken crust strength in downstream tectonic shaping.",
    }),
  },
  {
    description:
      "Default strategy configuration for computing basaltic-lid crust truth + derived drivers.",
  }
);

/** Input payload for foundation/compute-crust. */
const InputSchema = Type.Object(
  {
    /** Foundation mesh (cells, adjacency, site coordinates). */
    mesh: withDescription(
      FoundationMeshSchema,
      "Foundation mesh (cells, adjacency, site coordinates)."
    ),
    /** Mantle forcing fields (derived from mantle potential). */
    mantleForcing: withDescription(
      FoundationMantleForcingSchema,
      "Mantle forcing fields (derived from mantle potential)."
    ),
    /** Deterministic RNG seed (derived in the step; pure data). */
    rngSeed: Type.Integer({
      minimum: 0,
      maximum: 2_147_483_647,
      description: "Deterministic RNG seed (derived in the step; pure data).",
    }),
  },
  { description: "Input payload for foundation/compute-crust." }
);

/** Output payload for foundation/compute-crust. */
const OutputSchema = Type.Object(
  {
    /** Crust truth + derived drivers per mesh cell. */
    crust: FoundationCrustSchema,
  },
  { description: "Output payload for foundation/compute-crust." }
);

const ComputeCrustContract = defineOp({
  kind: "compute",
  id: "foundation/compute-crust",
  input: InputSchema,
  output: OutputSchema,
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeCrustContract;
export type ComputeCrustConfig = Static<typeof StrategySchema>;
