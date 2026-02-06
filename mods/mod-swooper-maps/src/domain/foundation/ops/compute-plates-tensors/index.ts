import { createOp } from "@swooper/mapgen-core/authoring";

import { projectPlatesFromModel } from "./lib/project-plates.js";
import {
  requireCrust,
  requireMesh,
  requirePlateGraph,
  requireTectonicHistory,
  requireTectonicProvenance,
  requireTectonics,
} from "../../lib/require.js";
import ComputePlatesTensorsContract from "./contract.js";

const computePlatesTensors = createOp(ComputePlatesTensorsContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const width = input.width | 0;
        const height = input.height | 0;
        const mesh = requireMesh(input.mesh, "foundation/compute-plates-tensors");
        const crust = requireCrust(input.crust, mesh.cellCount | 0, "foundation/compute-plates-tensors");
        const plateGraph = requirePlateGraph(input.plateGraph, mesh.cellCount | 0, "foundation/compute-plates-tensors");
        const tectonics = requireTectonics(input.tectonics, mesh.cellCount | 0, "foundation/compute-plates-tensors");
        const tectonicHistory = requireTectonicHistory(
          input.tectonicHistory,
          mesh.cellCount | 0,
          "foundation/compute-plates-tensors"
        );
        const tectonicProvenance = input.tectonicProvenance
          ? requireTectonicProvenance(input.tectonicProvenance, mesh.cellCount | 0, "foundation/compute-plates-tensors")
          : null;

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
