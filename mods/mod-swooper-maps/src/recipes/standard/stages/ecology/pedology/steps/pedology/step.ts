import { createStep } from "@swooper/mapgen-core/authoring";
import { buildScalarFieldProjections } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { config } from "./config.js";

const GROUP_PEDOLOGY = "Ecology / Pedology";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Derives canonical soil type and fertility from substrate, topography, and
 * final-refined climate so biome and resource-basin consumers share one soil vintage.
 */
export const PedologyStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const climateField = deps.artifacts.climateField.read();
    const topography = deps.artifacts.topography.read();
    const substrate = deps.artifacts.substrate.read();
    const { width, height } = context.setup.dimensions;

    const result = ops.classify(
      {
        width,
        height,
        landMask: topography.landMask,
        elevation: topography.elevation,
        rainfall: climateField.rainfall,
        humidity: climateField.humidity,
        sedimentDepth: substrate.sedimentDepth,
      },
      stepConfig.classify
    );

    const pedology = {
      width,
      height,
      ...result,
    };
    deps.artifacts.pedology.publish(pedology);
    return pedology;
  },
  viz: ({ result: pedology, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "ecology.pedology.soilType",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: pedology.soilType },
      meta: defineStandardVizMeta("ecology.pedology.soilType", "category.distinct", {
        label: "Soil Type",
        group: GROUP_PEDOLOGY,
      }),
    },
    ...buildScalarFieldProjections({
      dataTypeKey: "ecology.pedology.fertility",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: pedology.fertility },
      meta: defineStandardVizMeta("ecology.pedology.fertility", "field.intensity", {
        label: "Fertility",
        group: GROUP_PEDOLOGY,
      }),
      points: {},
    }),
  ],
});
