import { createOp } from "@swooper/mapgen-core/authoring";
import ComputePlatesTensorsContract from "./contract.js";
import { projectPlatesFromModel } from "./rules/project-plates.js";

const computePlatesTensors = createOp(ComputePlatesTensorsContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const width = input.width;
        const height = input.height;
        const mesh = input.mesh;
        const crust = input.crust;
        const plateGraph = input.plateGraph;
        const plateMotion = input.plateMotion;
        const tectonics = input.tectonics;
        const tectonicHistory = input.tectonicHistory;
        const tectonicProvenance = input.tectonicProvenance ?? null;
        const cellCount = mesh.cellCount | 0;
        const plateCount = plateGraph.plates.length | 0;
        if (crust.type.length !== cellCount || crust.strength.length !== cellCount) {
          throw new Error("[Foundation] Invalid crust.cellCount for compute-plates-tensors.");
        }
        if (plateGraph.cellToPlate.length !== cellCount) {
          throw new Error(
            "[Foundation] Invalid plateGraph.cellToPlate for compute-plates-tensors."
          );
        }
        if ((plateMotion.cellCount | 0) !== cellCount) {
          throw new Error("[Foundation] Invalid plateMotion.cellCount for compute-plates-tensors.");
        }
        if ((plateMotion.plateCount | 0) !== plateCount) {
          throw new Error(
            "[Foundation] Invalid plateMotion.plateCount for compute-plates-tensors."
          );
        }
        if (
          tectonics.boundaryType.length !== cellCount ||
          tectonics.cumulativeUplift.length !== cellCount
        ) {
          throw new Error("[Foundation] Invalid tectonics.cellCount for compute-plates-tensors.");
        }
        if (
          tectonicHistory.upliftTotal.length !== cellCount ||
          tectonicHistory.fractureTotal.length !== cellCount
        ) {
          throw new Error(
            "[Foundation] Invalid tectonicHistory.cellCount for compute-plates-tensors."
          );
        }
        if (tectonicProvenance && (tectonicProvenance.cellCount | 0) !== cellCount) {
          throw new Error(
            "[Foundation] Invalid tectonicProvenance.cellCount for compute-plates-tensors."
          );
        }

        const boundaryInfluenceDistance = config.boundaryInfluenceDistance;
        const boundaryDecay = config.boundaryDecay;
        const movementScale = config.movementScale;
        const rotationScale = config.rotationScale;

        const platesResult = projectPlatesFromModel({
          width,
          height,
          mesh,
          crust,
          plateGraph,
          plateMotion,
          tectonics,
          tectonicHistory,
          tectonicProvenance,
          boundaryInfluenceDistance,
          boundaryDecay,
          movementScale,
          rotationScale,
        });

        return {
          tileToCellIndex: platesResult.tileToCellIndex,
          crustTiles: platesResult.crustTiles,
          plates: platesResult.plates,
          tectonicHistoryTiles: platesResult.tectonicHistoryTiles,
          tectonicProvenanceTiles: platesResult.tectonicProvenanceTiles,
        } as const;
      },
    },
  },
});

export default computePlatesTensors;
