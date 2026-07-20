import { createStep } from "@swooper/mapgen-core/authoring";
import { defineVizMeta } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../viz.js";
import {
  pointsFromTileCentroids,
  segmentsFromTileTopologyNeighbors,
} from "../../../foundation/viz.js";
import { PlateTopologyStepContract } from "./config.js";

const GROUP_PLATE_TOPOLOGY = "Foundation / Plate Topology";

/**
 * Summarizes projected tile-space plate IDs into whole-plate adjacency, ensuring
 * topology reflects the same raster vintage consumed by downstream map stages.
 */
export const PlateTopologyStep = createStep(PlateTopologyStepContract, {
  run: (context, config, ops, deps) => {
    // Plate adjacency is derived from the projected tile plate-id field via the
    // compute-plate-topology op (tile-derived; see the op contract for the
    // mesh-native follow-on note).
    const { width, height } = context.setup.dimensions;
    const plates = deps.artifacts.foundationPlates.read(context);

    const { plateTopology } = ops.computePlateTopology(
      { plateIds: plates.id, width, height },
      config.computePlateTopology
    );
    const topologyPlates = plateTopology.plates;

    deps.artifacts.foundationPlateTopology.publish(context, plateTopology);
    return topologyPlates;
  },
  viz: ({ result: topologyPlates }) => {
    const centroidPoints = pointsFromTileCentroids(topologyPlates);
    return [
      {
        kind: "points",
        dataTypeKey: "foundation.plateTopology.centroidArea",
        spaceId: "tile.hexOddQ",
        positions: centroidPoints.positions,
        values: { format: "i32", values: centroidPoints.areas },
        meta: defineStandardVizMeta("foundation.plateTopology.centroidArea", "field.intensity", {
          label: "Plate Centroid Area",
          group: GROUP_PLATE_TOPOLOGY,
          showGrid: false,
        }),
      },
      {
        kind: "points",
        dataTypeKey: "foundation.plateTopology.centroidPlateId",
        spaceId: "tile.hexOddQ",
        positions: centroidPoints.positions,
        values: { format: "i16", values: centroidPoints.ids },
        meta: defineStandardVizMeta(
          "foundation.plateTopology.centroidPlateId",
          "category.distinct",
          {
            label: "Plate Centroid PlateId",
            group: GROUP_PLATE_TOPOLOGY,
            showGrid: false,
          }
        ),
      },
      {
        kind: "segments",
        dataTypeKey: "foundation.plateTopology.neighbors",
        spaceId: "tile.hexOddQ",
        segments: segmentsFromTileTopologyNeighbors(topologyPlates),
        meta: defineVizMeta("foundation.plateTopology.neighbors", {
          label: "Plate Neighbor Edges",
          group: GROUP_PLATE_TOPOLOGY,
          showGrid: false,
        }),
      },
    ];
  },
});
