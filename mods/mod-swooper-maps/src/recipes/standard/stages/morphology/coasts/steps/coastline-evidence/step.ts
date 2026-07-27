import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { config } from "./config.js";

const GROUP_COASTLINES = "Morphology / Coastlines";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Publishes shoreline adjacency and distance evidence for the immutable base topography.
 *
 * This step observes the topography produced by landmass construction; it does not
 * mutate land, elevation, or bathymetry.
 */
export const CoastlineEvidenceStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const topography = deps.artifacts.baseTopography.read();
    const adjacency = ops.adjacency(
      {
        width,
        height,
        landMask: topography.landMask,
      },
      stepConfig.adjacency
    );
    const coastal = new Uint8Array(width * height);
    for (let index = 0; index < coastal.length; index++) {
      coastal[index] =
        adjacency.coastalLand[index] === 1 || adjacency.coastalWater[index] === 1 ? 1 : 0;
    }
    const { distanceToCoast } = ops.distanceToCoast(
      { width, height, coastal },
      stepConfig.distanceToCoast
    );
    const baseCoastline = {
      coastalLand: adjacency.coastalLand,
      coastalWater: adjacency.coastalWater,
      distanceToCoast,
    };

    context.trace.event(() => {
      let landTiles = 0;
      let coastalLandTiles = 0;
      let coastalWaterTiles = 0;
      for (let index = 0; index < coastal.length; index++) {
        if (topography.landMask[index] === 1) landTiles += 1;
        if (baseCoastline.coastalLand[index] === 1) coastalLandTiles += 1;
        if (baseCoastline.coastalWater[index] === 1) coastalWaterTiles += 1;
      }
      return {
        kind: "morphology.coastlines.summary",
        landTiles,
        waterTiles: coastal.length - landTiles,
        coastalLandTiles,
        coastalWaterTiles,
      };
    });

    deps.artifacts.baseCoastline.publish(baseCoastline);
    return baseCoastline;
  },
  viz: ({ result: baseCoastline, dimensions }) => [
    ...(
      [
        ["morphology.baseCoastline.coastalLand", "Coastal Land", baseCoastline.coastalLand],
        ["morphology.baseCoastline.coastalWater", "Coastal Water", baseCoastline.coastalWater],
      ] as const
    ).map(([dataTypeKey, label, values]) => ({
      kind: "grid" as const,
      dataTypeKey,
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8" as const, values },
      meta: defineStandardVizMeta(dataTypeKey, "category.distinct", {
        label,
        group: GROUP_COASTLINES,
      }),
    })),
    {
      kind: "grid",
      dataTypeKey: "morphology.baseCoastline.distanceToCoast",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u16", values: baseCoastline.distanceToCoast },
      meta: defineStandardVizMeta("morphology.baseCoastline.distanceToCoast", "field.intensity", {
        label: "Distance To Coast (Tiles)",
        group: GROUP_COASTLINES,
        visibility: "debug",
      }),
    },
  ],
});
