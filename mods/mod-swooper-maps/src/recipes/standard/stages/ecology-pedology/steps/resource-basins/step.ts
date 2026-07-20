import { createStep } from "@swooper/mapgen-core/authoring";
import { defineStandardVizMeta } from "../../../../viz.js";
import { ResourceBasinsStepContract } from "./config.js";

const GROUP_RESOURCE_BASINS = "Ecology / Resource Basins";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Plans and balances resource-basin evidence from soil, climate, and topography
 * without selecting resource sites or mutating the engine.
 */
export const ResourceBasinsStep = createStep(ResourceBasinsStepContract, {
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const pedology = deps.artifacts.pedology.read(context);
    const topography = deps.artifacts.topography.read(context);
    const climate = deps.artifacts.climateField.read(context);

    const planned = ops.plan(
      {
        width,
        height,
        landMask: topography.landMask,
        fertility: pedology.fertility,
        soilType: pedology.soilType,
        rainfall: climate.rainfall,
        humidity: climate.humidity,
      },
      config.plan
    );

    const balanced = ops.score(planned, config.score);

    const basinIdByTile = new Uint16Array(width * height);
    for (let basinIndex = 0; basinIndex < balanced.basins.length; basinIndex++) {
      const basin = balanced.basins[basinIndex];
      if (!basin) continue;
      const id = basinIndex + 1;
      for (let i = 0; i < basin.plots.length; i++) {
        const plotIndex = basin.plots[i] ?? -1;
        if (plotIndex < 0 || plotIndex >= basinIdByTile.length) continue;
        basinIdByTile[plotIndex] = id;
      }
    }
    deps.artifacts.resourceBasins.publish(context, balanced);
    return basinIdByTile;
  },
  viz: ({ result: basinIdByTile, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "ecology.resourceBasins.resourceBasinId",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u16", values: basinIdByTile },
      meta: defineStandardVizMeta("ecology.resourceBasins.resourceBasinId", "category.distinct", {
        label: "Resource Basin Id",
        group: GROUP_RESOURCE_BASINS,
      }),
    },
  ],
});
