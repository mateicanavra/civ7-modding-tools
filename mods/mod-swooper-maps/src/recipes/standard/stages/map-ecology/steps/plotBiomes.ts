import { defineVizMeta, logBiomeSummary } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import * as ecology from "@mapgen/domain/ecology";
import PlotBiomesStepContract from "./plotBiomes.contract.js";
import { clampToByte } from "./plot-biomes/helpers/apply.js";
import { resolveEngineBiomeIds } from "./plot-biomes/helpers/engine-bindings.js";
import { buildEngineBiomeIdVizCategories } from "./plot-biomes/viz.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(PlotBiomesStepContract, {
  run: (context, config, _ops, deps) => {
    const { width, height } = context.dimensions;
    const classification = deps.artifacts.biomeClassification.read(context);
    const topography = deps.artifacts.topography.read(context);
    const { land: engineBindings, marine: marineBiome } = resolveEngineBiomeIds(
      context.adapter,
      config.bindings
    );
    const biomeIdCategories = buildEngineBiomeIdVizCategories({
      land: engineBindings,
      marine: marineBiome,
    });

    const biomeField = context.fields.biomeId;
    const temperatureField = context.fields.temperature;
    if (!biomeField || !temperatureField) {
      throw new Error("PlotBiomesStep: Missing biomeId or temperature field buffers.");
    }

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        if (topography.landMask[idx] === 0) {
          context.adapter.setBiomeType(x, y, marineBiome);
          biomeField[idx] = marineBiome;
          temperatureField[idx] = clampToByte(classification.surfaceTemperature[idx]! + 50);
          continue;
        }
        const biomeIdx = classification.biomeIndex[idx]!;
        if (biomeIdx === 255) continue;
        const symbol = ecology.biomeSymbolFromIndex(biomeIdx);
        const engineId = engineBindings[symbol];
        context.adapter.setBiomeType(x, y, engineId);
        biomeField[idx] = engineId;
        temperatureField[idx] = clampToByte(classification.surfaceTemperature[idx]! + 50);
      }
    }

    // Map-stage visualization: engine biomes are best-effort bindings of ecology truth (not 1:1).
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.ecology.biomeId",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: biomeField,
      meta: defineVizMeta("map.ecology.biomeId", {
        label: "Biome Id (Engine)",
        group: GROUP_MAP_ECOLOGY,
        palette: "categorical",
        categories: biomeIdCategories,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.ecology.temperature",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: temperatureField,
      meta: defineVizMeta("map.ecology.temperature", {
        label: "Temperature (Engine)",
        group: GROUP_MAP_ECOLOGY,
      }),
    });

    logBiomeSummary(context.trace, context.adapter, width, height);
  },
});
