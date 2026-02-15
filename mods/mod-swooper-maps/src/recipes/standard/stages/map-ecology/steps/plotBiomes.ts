import { defineVizMeta, logBiomeSummary } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import * as ecology from "@mapgen/domain/ecology";
import PlotBiomesStepContract from "./plotBiomes.contract.js";
import { clampToByte } from "./plot-biomes/helpers/apply.js";
import { resolveEngineBiomeIds } from "./plot-biomes/helpers/engine-bindings.js";
import { buildEngineBiomeIdVizCategories } from "./plot-biomes/viz.js";
import { ecologyArtifacts } from "../../ecology/artifacts.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(PlotBiomesStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.biomeBindings], {
    biomeBindings: {},
  }),
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

    const size = width * height;
    const engineBiomeId = new Uint16Array(size);
    const bindingClass = new Uint8Array(size);
    const idToSymbols = new Map<number, Set<string>>();
    for (const [symbol, engineId] of Object.entries(engineBindings)) {
      const set = idToSymbols.get(engineId) ?? new Set<string>();
      set.add(symbol);
      idToSymbols.set(engineId, set);
    }
    const collidingEngineBiomeIds = new Set<number>();
    for (const [engineId, symbols] of idToSymbols.entries()) {
      if (symbols.size > 1) collidingEngineBiomeIds.add(engineId);
    }

    let collapsedBindingCount = 0;
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        if (topography.landMask[idx] === 0) {
          context.adapter.setBiomeType(x, y, marineBiome);
          biomeField[idx] = marineBiome;
          temperatureField[idx] = clampToByte(classification.surfaceTemperature[idx]! + 50);
          engineBiomeId[idx] = marineBiome;
          bindingClass[idx] = 0;
          continue;
        }
        const biomeIdx = classification.biomeIndex[idx]!;
        if (biomeIdx === 255) continue;
        const symbol = ecology.biomeSymbolFromIndex(biomeIdx);
        const engineId = engineBindings[symbol];
        context.adapter.setBiomeType(x, y, engineId);
        biomeField[idx] = engineId;
        temperatureField[idx] = clampToByte(classification.surfaceTemperature[idx]! + 50);
        engineBiomeId[idx] = engineId;
        if (collidingEngineBiomeIds.has(engineId)) {
          bindingClass[idx] = 2;
          collapsedBindingCount += 1;
        } else {
          bindingClass[idx] = 1;
        }
      }
    }

    let landWaterMismatchCount = 0;
    for (let i = 0; i < size; i++) {
      const x = i % width;
      const y = (i / width) | 0;
      const wantsLand = topography.landMask[i] === 1;
      const isLand = !context.adapter.isWater(x, y);
      if (wantsLand !== isLand) landWaterMismatchCount += 1;
    }

    deps.artifacts.biomeBindings.publish(context, {
      width,
      height,
      engineBiomeId,
      bindingClass,
      collapsedBindingCount,
      landWaterMismatchCount,
    });

    context.trace.event(() => ({
      type: "map.ecology.biomes.parity",
      collapsedBindingCount,
      landWaterMismatchCount,
      collisionEngineBiomeIds: [...collidingEngineBiomeIds].sort((a, b) => a - b),
    }));

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
        categories: biomeIdCategories.map((category) => ({
          value: category.value,
          label: category.label,
          color: [...category.color] as [number, number, number, number],
        })),
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
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.ecology.biome.bindingClass",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: bindingClass,
      meta: defineVizMeta("map.ecology.biome.bindingClass", {
        label: "Biome Binding Drift Class",
        group: GROUP_MAP_ECOLOGY,
        palette: "categorical",
        visibility: "debug",
        categories: [
          { value: 0, label: "Water", color: [59, 130, 246, 200] as const },
          { value: 1, label: "Unique Binding", color: [34, 197, 94, 220] as const },
          { value: 2, label: "Colliding Binding", color: [239, 68, 68, 235] as const },
        ],
      }),
    });

    logBiomeSummary(context.trace, context.adapter, width, height);
  },
});
