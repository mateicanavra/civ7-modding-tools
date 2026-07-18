import { createStep } from "@swooper/mapgen-core/authoring";
import { clamp01 } from "@swooper/mapgen-core/lib/math";
import { buildScalarFieldProjections } from "@swooper/mapgen-viz";
import { defineStandardVizCategoryMeta, defineStandardVizMeta } from "../../../../viz.js";
import {
  assertBiomeIndexVizCategoriesCoverSymbols,
  BIOME_INDEX_VIZ_CATEGORIES,
} from "../../viz.js";
import { BiomesStepContract } from "./config.js";

const GROUP_BIOMES = "Ecology / Biomes";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Classifies refined climate, soil, cryosphere, and topography into stable
 * biome truth; Civ7 biome IDs remain owned by the later map-ecology projection.
 */
export const BiomesStep = createStep(BiomesStepContract, {
  run: (context, config, ops, deps) => {
    const { width, height } = context.setup.dimensions;

    const climateIndices = deps.artifacts.climateIndices.read(context);
    const topography = deps.artifacts.topography.read(context);
    const { landMask } = topography;
    const pedology = deps.artifacts.pedology.read(context);
    const cryosphere = deps.artifacts.cryosphere.read(context);

    const result = ops.classify(
      {
        width,
        height,
        effectiveMoisture: climateIndices.effectiveMoisture,
        surfaceTemperatureC: climateIndices.surfaceTemperatureC,
        aridityIndex: climateIndices.aridityIndex,
        freezeIndex: climateIndices.freezeIndex,
        landMask,
        soilType: pedology.soilType,
        fertility: pedology.fertility,
      },
      config.classify
    );

    const size = width * height;
    const treeLine01 = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      treeLine01[i] = clamp01(1 - (cryosphere.permafrost01?.[i] ?? 0));
    }

    const classification = {
      width,
      height,
      ...result,
      groundIce01: cryosphere.groundIce01,
      permafrost01: cryosphere.permafrost01,
      meltPotential01: cryosphere.meltPotential01,
      treeLine01,
    };
    deps.artifacts.biomeClassification.publish(context, classification);
    return classification;
  },
  viz: ({ result: classification, dimensions }) => {
    assertBiomeIndexVizCategoriesCoverSymbols();
    return [
      ...buildScalarFieldProjections({
        dataTypeKey: "ecology.biome.vegetationDensity",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "f32", values: classification.vegetationDensity },
        meta: defineStandardVizMeta("ecology.biome.vegetationDensity", "field.intensity", {
          label: "Vegetation Density",
          group: GROUP_BIOMES,
        }),
        points: {},
      }),
      ...buildScalarFieldProjections({
        dataTypeKey: "ecology.biome.effectiveMoisture",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "f32", values: classification.effectiveMoisture },
        meta: defineStandardVizMeta("ecology.biome.effectiveMoisture", "climate.moisture", {
          label: "Effective Moisture",
          group: GROUP_BIOMES,
        }),
        points: {},
      }),
      {
        kind: "grid",
        dataTypeKey: "ecology.biome.biomeIndex",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: classification.biomeIndex },
        meta: defineStandardVizCategoryMeta(
          "ecology.biome.biomeIndex",
          BIOME_INDEX_VIZ_CATEGORIES,
          {
            label: "Biome Index",
            group: GROUP_BIOMES,
          }
        ),
      },
      ...(
        [
          [
            "ecology.biome.surfaceTemperature",
            "Surface Temperature",
            classification.surfaceTemperature,
            "climate.temperature",
          ],
          [
            "ecology.biome.aridityIndex",
            "Aridity Index",
            classification.aridityIndex,
            "field.intensity",
          ],
          [
            "ecology.biome.freezeIndex",
            "Freeze Index",
            classification.freezeIndex,
            "field.intensity",
          ],
          [
            "ecology.biome.groundIce01",
            "Ground Ice 01",
            classification.groundIce01,
            "field.intensity",
          ],
          [
            "ecology.biome.permafrost01",
            "Permafrost 01",
            classification.permafrost01,
            "field.intensity",
          ],
          [
            "ecology.biome.meltPotential01",
            "Melt Potential 01",
            classification.meltPotential01,
            "field.intensity",
          ],
          [
            "ecology.biome.treeLine01",
            "Tree Line 01",
            classification.treeLine01,
            "field.intensity",
          ],
        ] as const
      ).map(([dataTypeKey, label, values, style]) => ({
        kind: "grid" as const,
        dataTypeKey,
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "f32" as const, values },
        meta: defineStandardVizMeta(dataTypeKey, style, {
          label,
          group: GROUP_BIOMES,
          visibility: "debug",
        }),
      })),
    ];
  },
});
