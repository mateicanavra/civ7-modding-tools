import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

import { Schema as FoundationMantleForcingSchema } from "../../artifacts/mantle-forcing.artifact.js";
import { Schema as FoundationMantlePotentialSchema } from "../../artifacts/mantle-potential.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";

const StrategySchema = Type.Object(
  {
    velocityScale: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 5,
      description:
        "Controls the velocity strength applied to mantle-gradient forcing before plate motion fitting.",
    }),
    rotationScale: Type.Number({
      default: 0.2,
      minimum: 0,
      maximum: 2,
      description:
        "Controls the rotational shear component mixed into the mantle forcing velocity field.",
    }),
    stressNorm: Type.Number({
      default: 1,
      minimum: 1e-3,
      maximum: 10,
      description:
        "Sets the normalization factor for stress proxy values consumed by crust and tectonics.",
    }),
    curvatureWeight: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 2,
      description: "Controls how much curvature contributes to the mantle stress proxy.",
    }),
    upwellingThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description: "Sets the local-maximum threshold used to classify cells as upwelling sources.",
    }),
    downwellingThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description: "Sets the local-minimum threshold used to classify cells as downwelling sinks.",
    }),
  },
  { additionalProperties: false }
);

const ComputeMantleForcingContract = defineOp({
  kind: "compute",
  id: "foundation/compute-mantle-forcing",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      mantlePotential: FoundationMantlePotentialSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    { mantleForcing: FoundationMantleForcingSchema },
    {
      additionalProperties: false,
      description:
        "Mesh-wide velocity, stress, divergence, and upwelling signals derived from mantle potential and shared by plate-motion, hotspot, and tracer reconstruction.",
    }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeMantleForcingContract;
export type ComputeMantleForcingConfig = Static<typeof StrategySchema>;
