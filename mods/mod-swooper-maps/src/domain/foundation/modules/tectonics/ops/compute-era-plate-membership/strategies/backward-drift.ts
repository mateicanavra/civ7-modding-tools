import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeEraPlateMembershipContract from "../contract.js";
import { computePlateIdByEra, ERA_COUNT_MAX, ERA_COUNT_MIN } from "../rules/index.js";

/**
 * Reconstructs era membership by advecting plate seeds backward along fitted plate motion.
 * The semantic strategy keeps historical reconstruction replaceable within the tectonics router.
 */
export const backwardDriftStrategy = createStrategy(
  ComputeEraPlateMembershipContract,
  "backward-drift",
  {
    run: (input, config) => {
      const mesh = input.mesh;
      const plateGraph = input.plateGraph;
      const plateMotion = input.plateMotion;
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

      const plateIdByEra = [
        ...computePlateIdByEra({
          mesh,
          plates: plateGraph.plates,
          currentCellToPlate: plateGraph.cellToPlate,
          plateVelocityX: plateMotion.plateVelocityX,
          plateVelocityY: plateMotion.plateVelocityY,
          driftStepsByEra: driftSteps,
          eraCount,
        }),
      ];

      return {
        eraCount,
        eraWeights: [...weights],
        plateIdByEra,
      };
    },
  }
);
