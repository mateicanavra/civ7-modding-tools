import * as ecology from "@mapgen/domain/ecology";
import { createStep } from "@swooper/mapgen-core/authoring";
import { clampU8 } from "@swooper/mapgen-core/lib/math";
import { measureStandardBiomeProjection } from "../../../../../metrics/families/ecology-projection.js";
import {
  defineStandardVizCategoryMeta,
  defineStandardVizMeta,
  STANDARD_VIZ_COLORS,
} from "../../../../../viz.js";
import { resolveEngineBiomeIds } from "../../model/policy/biome-projection.js";
import { buildEngineBiomeIdVizCategories } from "../../viz.js";
import { config } from "./config.js";

const GROUP_MAP_ECOLOGY = "Map / Ecology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Binds Ecology biome symbols to the fixed Swooper Civ7 policy, applies them to land, and returns
 * invocation-local projection evidence for trace, metrics, and visualization.
 */
export const PlotBiomesStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const classification = deps.artifacts.biomeClassification.read(context);
    const climateIndices = deps.artifacts.climateIndices.read(context);
    const topography = deps.artifacts.topography.read(context);
    const engineBiomeIds = resolveEngineBiomeIds({
      getBiomeGlobal: (key) => deps.engine.getBiomeGlobal(context, key),
    });
    const { land: engineBindings, marine: marineBiome } = engineBiomeIds;

    const size = width * height;
    const projectedBiomeId = new Int32Array(size);
    const projectedTemperature = new Uint8Array(size);
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
          deps.engine.setBiomeType(context, x, y, marineBiome);
          projectedBiomeId[idx] = marineBiome;
          projectedTemperature[idx] = clampU8(
            Math.round(climateIndices.surfaceTemperatureC[idx]! + 50)
          );
          bindingClass[idx] = 0;
          continue;
        }
        const biomeIdx = classification.biomeIndex[idx]!;
        if (biomeIdx === 255) continue;
        const symbol = ecology.biomeSymbolFromIndex(biomeIdx);
        const engineId = engineBindings[symbol];
        deps.engine.setBiomeType(context, x, y, engineId);
        projectedBiomeId[idx] = engineId;
        projectedTemperature[idx] = clampU8(
          Math.round(climateIndices.surfaceTemperatureC[idx]! + 50)
        );
        if (collidingEngineBiomeIds.has(engineId)) {
          bindingClass[idx] = 2;
          collapsedBindingCount += 1;
        } else {
          bindingClass[idx] = 1;
        }
      }
    }

    const engineWaterMask = deps.engine.readCurrentMapWaterMask(context);
    let landWaterMismatchCount = 0;
    for (let i = 0; i < size; i++) {
      const wantsLand = topography.landMask[i] === 1;
      const isLand = engineWaterMask[i] !== 1;
      if (wantsLand !== isLand) landWaterMismatchCount += 1;
    }

    const collisionEngineBiomeIds = [...collidingEngineBiomeIds].sort((a, b) => a - b);
    context.trace.event(() => ({
      type: "map.ecology.biomes.parity",
      collapsedBindingCount,
      landWaterMismatchCount,
      collisionEngineBiomeIds,
    }));

    return {
      projectedBiomeId,
      projectedTemperature,
      bindingClass,
      engineBiomeIds,
      projectionMeasurementInput: {
        collapsedBindingCount,
        landWaterMismatchCount,
        collisionEngineBiomeIds,
      },
    };
  },
  metrics: ({ result }) => ({
    "ecology.biomeProjection": measureStandardBiomeProjection(result.projectionMeasurementInput),
  }),
  viz: ({ result, dimensions }) => {
    const biomeIdCategories = buildEngineBiomeIdVizCategories(result.engineBiomeIds);
    return [
      {
        kind: "grid",
        dataTypeKey: "map.ecology.biomeId",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "i32", values: result.projectedBiomeId },
        meta: defineStandardVizCategoryMeta("map.ecology.biomeId", biomeIdCategories, {
          label: "Biome Id (Engine)",
          group: GROUP_MAP_ECOLOGY,
        }),
      },
      {
        kind: "grid",
        dataTypeKey: "map.ecology.temperature",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: result.projectedTemperature },
        meta: defineStandardVizMeta("map.ecology.temperature", "climate.temperature", {
          label: "Temperature (Engine)",
          group: GROUP_MAP_ECOLOGY,
        }),
      },
      {
        kind: "grid",
        dataTypeKey: "map.ecology.biome.bindingClass",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: result.bindingClass },
        meta: defineStandardVizCategoryMeta(
          "map.ecology.biome.bindingClass",
          [
            { value: 0, label: "Water", color: STANDARD_VIZ_COLORS.water.ocean },
            { value: 1, label: "Unique Binding", color: STANDARD_VIZ_COLORS.field.elevated },
            { value: 2, label: "Colliding Binding", color: STANDARD_VIZ_COLORS.field.positive },
          ],
          {
            label: "Biome Binding Drift Class",
            group: GROUP_MAP_ECOLOGY,
            visibility: "debug",
          }
        ),
      },
    ];
  },
});
