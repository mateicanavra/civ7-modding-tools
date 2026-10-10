import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { getEngineFeatureLegality } from "@civ7/map-policy";
import { BIOME_SYMBOL_ORDER } from "../../../../../../../src/domain/ecology/index.js";
import { WETLAND_FEATURE_INTENT_KEYS } from "../../../../../../../src/domain/ecology/modules/features/model/atoms/index.js";
import { resolveEngineBiomeIds } from "../../../../../../../src/recipes/standard/stages/ecology/model/policy/biome-projection.js";
import { resolveFeatureKeyForIntent } from "../../../../../../../src/recipes/standard/stages/ecology/model/policy/feature-projection.js";
import { deriveWetlandTerrainBiomeCompatibilityMasks } from "../../../../../../../src/recipes/standard/stages/ecology/model/policy/wetland-terrain-biome-compatibility.js";
import { TEST_MAP_SIZE } from "../../../../../../setup.js";

describe("wetland terrain/biome compatibility", () => {
  it("matches official five-family policy using the same biome mapping as projection", () => {
    const width = BIOME_SYMBOL_ORDER.length;
    const input = {
      width,
      height: 3,
      flatLandMask: new Uint8Array(width * 3),
      biomeIndex: new Uint8Array(width * 3).fill(255),
    };
    input.flatLandMask.fill(1, 0, width);
    input.flatLandMask.fill(1, width * 2);
    for (let i = 0; i < width; i++) {
      input.biomeIndex[i] = i;
      input.biomeIndex[width + i] = i;
    }
    const before = structuredClone(input);
    const masks = deriveWetlandTerrainBiomeCompatibilityMasks(input);
    const adapter = createMockAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
    });
    const projectedBiomes = resolveEngineBiomeIds(adapter);

    expect(Object.keys(masks)).toEqual(Array.from(WETLAND_FEATURE_INTENT_KEYS));
    for (const family of WETLAND_FEATURE_INTENT_KEYS) {
      const legality = getEngineFeatureLegality(resolveFeatureKeyForIntent(family))!;
      const legalBiomeIds = legality.biomes.map((biome) => adapter.getBiomeGlobal(biome));
      for (const [i, symbol] of BIOME_SYMBOL_ORDER.entries()) {
        const expected =
          legality.terrains.includes("TERRAIN_FLAT") &&
          legalBiomeIds.includes(projectedBiomes.land[symbol]);
        expect(masks[family][i]).toBe(expected ? 1 : 0);
      }
      expect(Array.from(masks[family].slice(width))).toEqual(new Array(width * 2).fill(0));
    }
    expect(
      BIOME_SYMBOL_ORDER.map((_, i) =>
        WETLAND_FEATURE_INTENT_KEYS.filter((family) => masks[family][i] === 1)
      )
    ).toEqual([
      ["tundra-bog"],
      ["tundra-bog"],
      ["tundra-bog"],
      ["watering-hole"],
      ["marsh"],
      ["watering-hole"],
      ["mangrove"],
      ["oasis"],
    ]);
    expect(input).toEqual(before);
  });
});
