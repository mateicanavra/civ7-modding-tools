import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import standardRecipe from "../../../../../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../../../../../src/recipes/standard/runtime.js";
import { standardConfig } from "../../../../../support/standard-config.js";

describe("features apply Earthlike balance", () => {
  it("applies non-zero vegetation without drowning coasts", () => {
    const width = 32;
    const height = 20;
    const seed = 1018;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -80,
      MaxLatitude: 80,
      PlayersLandmass1: 4,
      PlayersLandmass2: 4,
      StartSectorRows: 4,
      StartSectorCols: 4,
    };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
    };
    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });
    standardRecipe.run(context, env, standardConfig, { log: () => {} });

    const forestIdx = adapter.getFeatureTypeIndex("FEATURE_FOREST");
    const rainforestIdx = adapter.getFeatureTypeIndex("FEATURE_RAINFOREST");
    const taigaIdx = adapter.getFeatureTypeIndex("FEATURE_TAIGA");
    const savannaIdx = adapter.getFeatureTypeIndex("FEATURE_SAVANNA_WOODLAND");
    const steppeIdx = adapter.getFeatureTypeIndex("FEATURE_SAGEBRUSH_STEPPE");
    const marshIdx = adapter.getFeatureTypeIndex("FEATURE_MARSH");
    const bogIdx = adapter.getFeatureTypeIndex("FEATURE_TUNDRA_BOG");
    const mangroveIdx = adapter.getFeatureTypeIndex("FEATURE_MANGROVE");
    const reefIdx = adapter.getFeatureTypeIndex("FEATURE_REEF");
    const coldReefIdx = adapter.getFeatureTypeIndex("FEATURE_COLD_REEF");
    const atollIdx = adapter.getFeatureTypeIndex("FEATURE_ATOLL");
    const lotusIdx = adapter.getFeatureTypeIndex("FEATURE_LOTUS");

    let landCount = 0;
    let waterCount = 0;
    let forestCount = 0;
    let rainforestCount = 0;
    let taigaCount = 0;
    let savannaCount = 0;
    let steppeCount = 0;
    let wetlandCount = 0;
    let reefFamilyCount = 0;
    let atollCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (adapter.isWater(x, y)) waterCount++;
        else landCount++;
        const feature = adapter.getFeatureType(x, y);
        if (feature === forestIdx) forestCount++;
        if (feature === rainforestIdx) rainforestCount++;
        if (feature === taigaIdx) taigaCount++;
        if (feature === savannaIdx) savannaCount++;
        if (feature === steppeIdx) steppeCount++;
        if (feature === marshIdx || feature === bogIdx || feature === mangroveIdx) wetlandCount++;
        if (
          feature === reefIdx ||
          feature === coldReefIdx ||
          feature === atollIdx ||
          feature === lotusIdx
        ) {
          reefFamilyCount++;
        }
        if (feature === atollIdx) atollCount++;
      }
    }

    expect(
      forestCount + rainforestCount + taigaCount + savannaCount + steppeCount + wetlandCount
    ).toBeGreaterThan(0);
    expect(wetlandCount).toBeLessThan(Math.max(1, Math.floor(landCount * 0.35)));
    expect(reefFamilyCount).toBeLessThan(Math.max(1, Math.floor(waterCount * 0.35)));
    expect(atollCount).toBeLessThan(Math.max(1, Math.floor(waterCount * 0.08)));
  }, 15_000);
});
