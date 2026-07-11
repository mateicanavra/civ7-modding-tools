import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

import { Schema as FoundationCrustSchema } from "../../artifacts/crust.artifact.js";
import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";
import type { Artifact as FoundationPlateGraphArtifact } from "../../artifacts/plate-graph.artifact.js";
import { Schema as FoundationPlateGraphSchema } from "../../artifacts/plate-graph.artifact.js";

const StrategySchema = Type.Object(
  {
    plateCount: Type.Integer({
      default: 8,
      minimum: 2,
      maximum: 256,
      description: "Authored tectonic plate count for the selected map size.",
    }),
    polarCaps: Type.Object(
      {
        capFraction: Type.Number({
          default: 0.1,
          minimum: 0.02,
          maximum: 0.25,
          description:
            "Controls the mesh Y-span fraction reserved as the locked polar cap in each hemisphere.",
        }),
        microplateBandFraction: Type.Number({
          default: 0.2,
          minimum: 0.02,
          maximum: 0.5,
          description:
            "Fraction of mesh Y-span eligible for polar microplate seeding (outside the locked cap).",
        }),
        microplatesPerPole: Type.Integer({
          default: 0,
          minimum: 0,
          maximum: 8,
          description:
            "Maximum polar microplates per pole (subject to plateCount and min-plate guards).",
        }),
        microplatesMinPlateCount: Type.Integer({
          default: 14,
          minimum: 0,
          maximum: 256,
          description:
            "Only enable polar microplates when the normalized plateCount meets this threshold.",
        }),
        microplateMinAreaCells: Type.Integer({
          default: 8,
          minimum: 1,
          maximum: 10_000,
          description: "Minimum cell area for a polar microplate (sliver guardrail).",
        }),
      },
      {
        additionalProperties: false,
        description:
          "Controls polar cap and polar microplate partition behavior for the generated plate graph.",
      }
    ),
  },
  { additionalProperties: false }
);

const ComputePlateGraphContract = defineOp({
  kind: "compute",
  id: "foundation/compute-plate-graph",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      crust: FoundationCrustSchema,
      rngSeed: Type.Integer({
        minimum: 0,
        maximum: 2_147_483_647,
        description: "Deterministic RNG seed (derived in the step; pure data).",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({ plateGraph: FoundationPlateGraphSchema }, { additionalProperties: false }),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputePlateGraphContract;
export type ComputePlateGraphConfig = Static<typeof StrategySchema>;
export type FoundationPlate = FoundationPlateGraphArtifact["plates"][number];
