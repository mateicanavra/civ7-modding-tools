import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeEraPlateMembershipContract from "../../contract.js";
import { computePlateIdByEra } from "../../rules/index.js";
import BackwardDriftDefinition from "./config.js";

/**
 * Reconstructs era membership by advecting plate seeds backward along fitted plate motion.
 * The semantic strategy keeps historical reconstruction replaceable within the tectonics router.
 */
export default createStrategy(ComputeEraPlateMembershipContract, BackwardDriftDefinition, {
  run: (input, config) => {
    const mesh = input.mesh;
    const plateGraph = input.plateGraph;
    const plateMotion = input.plateMotion;
    const weights = config.eraWeights;
    const driftSteps = config.driftStepsByEra;
    const eraCount = weights.length;

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
});
