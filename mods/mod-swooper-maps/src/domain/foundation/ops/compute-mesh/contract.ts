import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";

import { Schema as FoundationMeshSchema } from "../../artifacts/mesh.artifact.js";

const ComputeMeshContract = defineOp({
  kind: "compute",
  id: "foundation/compute-mesh",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      rngSeed: Type.Integer({
        minimum: 0,
        maximum: 2_147_483_647,
        description: "Deterministic RNG seed (derived in the step; pure data).",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({ mesh: FoundationMeshSchema }, { additionalProperties: false }),
  strategies: {
    default: Type.Object(
      {
        plateCount: Type.Integer({
          default: 8,
          minimum: 2,
          maximum: 256,
          description:
            "Controls the target tectonic plate count used to derive mesh cell density for this map.",
        }),
        cellsPerPlate: Type.Integer({
          default: 2,
          minimum: 1,
          maximum: 32,
          description:
            "Controls mesh resolution by setting how many mesh cells are generated per normalized plate.",
        }),
        relaxationSteps: Type.Integer({
          default: 2,
          minimum: 0,
          maximum: 50,
          description:
            "Controls how many relaxation passes smooth generated mesh sites before downstream plate logic runs.",
        }),
      },
      { additionalProperties: false }
    ),
  },
});

export default ComputeMeshContract;
export type ComputeMeshConfig = Static<(typeof ComputeMeshContract)["strategies"]["default"]>;
