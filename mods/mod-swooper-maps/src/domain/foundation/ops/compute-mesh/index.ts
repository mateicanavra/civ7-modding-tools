import { createOp } from "@swooper/mapgen-core/authoring";
import { buildDelaunayMesh } from "@swooper/mapgen-core/lib/mesh";

import {
  deriveFoundationReferenceArea,
  requireEnvDimensions,
} from "../../model/policy/reference-area.js";
import ComputeMeshContract from "./contract.js";

const PLATE_COUNT_CLAMP_MIN = 2;
const CELL_COUNT_CLAMP_MIN = 1;

const computeMesh = createOp(ComputeMeshContract, {
  strategies: {
    default: {
      normalize: (config, ctx) => {
        deriveFoundationReferenceArea(
          requireEnvDimensions(ctx, "foundation/compute-mesh.normalize")
        );
        const scaledPlateCount = Math.max(PLATE_COUNT_CLAMP_MIN, config.plateCount | 0);
        return {
          ...config,
          plateCount: scaledPlateCount,
        };
      },
      run: (input, config) => {
        const width = input.width | 0;
        const height = input.height | 0;
        const rngSeed = input.rngSeed | 0;

        const cellCount = Math.max(
          CELL_COUNT_CLAMP_MIN,
          (config.plateCount | 0) * (config.cellsPerPlate | 0)
        );
        const relaxationSteps = config.relaxationSteps;

        return {
          mesh: buildDelaunayMesh({
            width,
            height,
            cellCount,
            relaxationSteps,
            rngSeed,
          }),
        } as const;
      },
    },
  },
});

export default computeMesh;
