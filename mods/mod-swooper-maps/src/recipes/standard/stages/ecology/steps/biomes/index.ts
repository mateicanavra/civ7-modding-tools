import { defineVizMeta, dumpScalarFieldVariants } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { clamp01 } from "@swooper/mapgen-core/lib/math";
import BiomesStepContract from "./contract.js";
import { ecologyArtifacts } from "../../artifacts.js";
import { validateBiomeClassificationArtifact } from "../../artifact-validation.js";
import { assertBiomeIndexVizCategoriesCoverSymbols, BIOME_INDEX_VIZ_CATEGORIES } from "./viz.js";

const GROUP_BIOMES = "Ecology / Biomes";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(BiomesStepContract, {
  artifacts: implementArtifacts([ecologyArtifacts.biomeClassification], {
    biomeClassification: {
      validate: (value, context) => validateBiomeClassificationArtifact(value, context.dimensions),
    },
  }),
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;

    const climateField = deps.artifacts.climateField.read(context);
    const climateIndices = deps.artifacts.climateIndices.read(context);
    const topography = deps.artifacts.topography.read(context);
    const { landMask } = topography;
    const hydrography = deps.artifacts.hydrography.read(context);
    const cryosphere = deps.artifacts.cryosphere.read(context);

    const result = ops.classify(
      {
        width,
        height,
        rainfall: climateField.rainfall,
        humidity: climateField.humidity,
        surfaceTemperatureC: climateIndices.surfaceTemperatureC,
        aridityIndex: climateIndices.aridityIndex,
        freezeIndex: climateIndices.freezeIndex,
        landMask,
        riverClass: hydrography.riverClass,
      },
      config.classify
    );

    const size = Math.max(0, (width | 0) * (height | 0));
    const treeLine01 = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      treeLine01[i] = clamp01(1 - (cryosphere.permafrost01?.[i] ?? 0));
    }

    dumpScalarFieldVariants(context.trace, context.viz, {
      dataTypeKey: "ecology.biome.vegetationDensity",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      field: { format: "f32", values: result.vegetationDensity },
      label: "Vegetation Density",
      group: GROUP_BIOMES,
      points: {},
    });
    dumpScalarFieldVariants(context.trace, context.viz, {
      dataTypeKey: "ecology.biome.effectiveMoisture",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      field: { format: "f32", values: result.effectiveMoisture },
      label: "Effective Moisture",
      group: GROUP_BIOMES,
      points: {},
    });
    assertBiomeIndexVizCategoriesCoverSymbols();
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.biome.biomeIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: result.biomeIndex,
      meta: defineVizMeta("ecology.biome.biomeIndex", {
        label: "Biome Index",
        group: GROUP_BIOMES,
        palette: "categorical",
        categories: BIOME_INDEX_VIZ_CATEGORIES,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.biome.surfaceTemperature",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: result.surfaceTemperature,
      meta: defineVizMeta("ecology.biome.surfaceTemperature", {
        label: "Surface Temperature",
        group: GROUP_BIOMES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.biome.aridityIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: result.aridityIndex,
      meta: defineVizMeta("ecology.biome.aridityIndex", {
        label: "Aridity Index",
        group: GROUP_BIOMES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.biome.freezeIndex",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: result.freezeIndex,
      meta: defineVizMeta("ecology.biome.freezeIndex", {
        label: "Freeze Index",
        group: GROUP_BIOMES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.biome.groundIce01",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: cryosphere.groundIce01,
      meta: defineVizMeta("ecology.biome.groundIce01", {
        label: "Ground Ice 01",
        group: GROUP_BIOMES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.biome.permafrost01",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: cryosphere.permafrost01,
      meta: defineVizMeta("ecology.biome.permafrost01", {
        label: "Permafrost 01",
        group: GROUP_BIOMES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.biome.meltPotential01",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: cryosphere.meltPotential01,
      meta: defineVizMeta("ecology.biome.meltPotential01", {
        label: "Melt Potential 01",
        group: GROUP_BIOMES,
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "ecology.biome.treeLine01",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: treeLine01,
      meta: defineVizMeta("ecology.biome.treeLine01", {
        label: "Tree Line 01",
        group: GROUP_BIOMES,
        visibility: "debug",
      }),
    });

    deps.artifacts.biomeClassification.publish(context, {
      width,
      height,
      ...result,
      groundIce01: cryosphere.groundIce01,
      permafrost01: cryosphere.permafrost01,
      meltPotential01: cryosphere.meltPotential01,
      treeLine01,
    });
  },
});
