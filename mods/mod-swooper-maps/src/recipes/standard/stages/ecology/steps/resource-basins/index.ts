import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { ecologyArtifacts } from "../../artifacts.js";
import { validateResourceBasinsArtifact } from "../../artifact-validation.js";
import ResourceBasinsStepContract from "./contract.js";

const GROUP_RESOURCE_BASINS = "Ecology / Resource Basins";

export default createStep(ResourceBasinsStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.resourceBasins], {
    resourceBasins: {
      validate: (value, context) => validateResourceBasinsArtifact(value, context.dimensions),
    },
  }),
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
    context.viz?.dumpGrid(context.trace, {
      layerId: "ecology.resourceBasins.resourceBasinId",
      dims: { width, height },
      format: "u16",
      values: basinIdByTile,
      meta: defineVizMeta("ecology.resourceBasins.resourceBasinId", {
        label: "Resource Basin Id",
        group: GROUP_RESOURCE_BASINS,
        palette: "categorical",
      }),
    });

    deps.artifacts.resourceBasins.publish(context, balanced);
  },
});
