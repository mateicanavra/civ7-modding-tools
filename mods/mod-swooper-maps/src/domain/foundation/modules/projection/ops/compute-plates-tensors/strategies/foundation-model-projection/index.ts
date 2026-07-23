import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputePlatesTensorsContract from "../../contract.js";
import { projectPlatesFromModel } from "../../rules/project-plates.js";
import FoundationModelProjectionDefinition from "./config.js";

/**
 * Materializes mesh-space Foundation state as aligned tile tensors and provenance evidence.
 * A single projection mapping keeps crust, motion, history, and lineage spatially correlated.
 */
const foundationModelProjection = createStrategy(
  ComputePlatesTensorsContract,
  FoundationModelProjectionDefinition,
  {
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
  }
);

export default foundationModelProjection;
