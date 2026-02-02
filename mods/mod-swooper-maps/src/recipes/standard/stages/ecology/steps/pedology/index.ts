import { defineVizMeta } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { ecologyArtifacts } from "../../artifacts.js";
import { validatePedologyArtifact } from "../../artifact-validation.js";
import PedologyStepContract from "./contract.js";

const GROUP_PEDOLOGY = "Ecology / Pedology";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(PedologyStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.pedology], {
    pedology: {
      validate: (value, context) => validatePedologyArtifact(value, context.dimensions),
    },
  }),
  run: (context, config, ops, deps) => {
    const climateField = deps.artifacts.climateField.read(context);
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.dimensions;

    const result = ops.classify(
      {
        width,
        height,
        landMask: topography.landMask,
        elevation: topography.elevation,
        rainfall: climateField.rainfall,
        humidity: climateField.humidity,
      },
      config.classify
    );

    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.pedology.soilType",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: result.soilType,
      meta: defineVizMeta("ecology.pedology.soilType", {
        label: "Soil Type",
        group: GROUP_PEDOLOGY,
        palette: "categorical",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.pedology.fertility",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: result.fertility,
      meta: defineVizMeta("ecology.pedology.fertility", {
        label: "Fertility",
        group: GROUP_PEDOLOGY,
      }),
    });

    deps.artifacts.pedology.publish(context, {
      width,
      height,
      ...result,
    });
  },
});
