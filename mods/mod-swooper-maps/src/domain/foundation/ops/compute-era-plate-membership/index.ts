import { createOp } from "@swooper/mapgen-core/authoring";

import { requireMesh, requirePlateGraph, requirePlateMotion } from "../../lib/require.js";
import ComputeEraPlateMembershipContract from "./contract.js";
import { computePlateIdByEra, ERA_COUNT_MAX, ERA_COUNT_MIN } from "../compute-tectonic-history/lib/pipeline-core.js";

const computeEraPlateMembership = createOp(ComputeEraPlateMembershipContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-era-plate-membership");
        const plateGraph = requirePlateGraph(
          input.plateGraph,
          mesh.cellCount | 0,
          "foundation/compute-era-plate-membership"
        );
        const plateMotion = requirePlateMotion(
          input.plateMotion,
          mesh.cellCount | 0,
          plateGraph.plates.length | 0,
          "foundation/compute-era-plate-membership"
        );

        const weights = config.eraWeights;
        const driftSteps = config.driftStepsByEra;
        if (weights.length !== driftSteps.length) {
          throw new Error(
            "[Foundation] compute-era-plate-membership expects eraWeights/driftStepsByEra to match length."
          );
        }

        const eraCount = Math.min(weights.length, driftSteps.length);
        if (eraCount < ERA_COUNT_MIN || eraCount > ERA_COUNT_MAX) {
          throw new Error(
            `[Foundation] compute-era-plate-membership expects eraCount within ${ERA_COUNT_MIN}..${ERA_COUNT_MAX}.`
          );
        }

        const plateIdByEra = [...computePlateIdByEra({
          mesh,
          plates: plateGraph.plates,
          currentCellToPlate: plateGraph.cellToPlate,
          plateVelocityX: plateMotion.plateVelocityX,
          plateVelocityY: plateMotion.plateVelocityY,
          driftStepsByEra: driftSteps,
          eraCount,
        })];

        return {
          eraCount,
          eraWeights: [...weights],
          plateIdByEra,
        };
      },
    },
  },
});

export default computeEraPlateMembership;
