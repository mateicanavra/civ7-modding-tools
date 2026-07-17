import {
  artifacts as foundationArtifacts,
  validators as foundationArtifactValidators,
} from "@mapgen/domain/foundation";
import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import {
  pointsFromTileCentroids,
  segmentsFromTileTopologyNeighbors,
} from "../../foundation/viz.js";
import PlateTopologyStepContract from "./plateTopology.contract.js";

const GROUP_PLATE_TOPOLOGY = "Foundation / Plate Topology";

/**
 * Summarizes projected tile-space plate IDs into whole-plate adjacency, ensuring
 * topology reflects the same raster vintage consumed by downstream map stages.
 */
export default createStep(PlateTopologyStepContract, {
  artifacts: implementArtifacts([foundationArtifacts.plateTopology], {
    foundationPlateTopology: {
      validate: (value) => foundationArtifactValidators.plateTopology(value),
    },
  }),
  run: (context, config, ops, deps) => {
    // Plate adjacency is derived from the projected tile plate-id field via the
    // compute-plate-topology op (tile-derived; see the op contract for the
    // mesh-native follow-on note).
    const { width, height } = context.dimensions;
    const plates = deps.artifacts.foundationPlates.read(context);

    const { plateTopology } = ops.computePlateTopology(
      { plateIds: plates.id, width, height },
      config.computePlateTopology
    );
    const topologyPlates = plateTopology.plates;

    deps.artifacts.foundationPlateTopology.publish(context, plateTopology);

    const centroidPoints = pointsFromTileCentroids(topologyPlates);
    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.plateTopology.centroidArea",
      spaceId: "tile.hexOddQ",
      positions: centroidPoints.positions,
      values: centroidPoints.areas,
      valueFormat: "i32",
      meta: defineVizMeta("foundation.plateTopology.centroidArea", {
        label: "Plate Centroid Area",
        group: GROUP_PLATE_TOPOLOGY,
        showGrid: false,
      }),
    });

    context.viz?.dumpPoints(context.trace, {
      dataTypeKey: "foundation.plateTopology.centroidPlateId",
      spaceId: "tile.hexOddQ",
      positions: centroidPoints.positions,
      values: centroidPoints.ids,
      valueFormat: "i16",
      meta: defineVizMeta("foundation.plateTopology.centroidPlateId", {
        label: "Plate Centroid PlateId",
        group: GROUP_PLATE_TOPOLOGY,
        palette: "categorical",
        showGrid: false,
      }),
    });

    context.viz?.dumpSegments(context.trace, {
      dataTypeKey: "foundation.plateTopology.neighbors",
      spaceId: "tile.hexOddQ",
      segments: segmentsFromTileTopologyNeighbors(topologyPlates),
      meta: defineVizMeta("foundation.plateTopology.neighbors", {
        label: "Plate Neighbor Edges",
        group: GROUP_PLATE_TOPOLOGY,
        showGrid: false,
      }),
    });
  },
});
