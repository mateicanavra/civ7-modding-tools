import { describe, expect, it } from "bun:test";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../../../src/domain/ecology/model/atoms/index.js";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const floodplainScore = ecology.features.ops.scoreFloodplains;
const selection = normalizeOperationSelectionForTest(
  floodplainScore,
  floodplainScore.defaultConfig
);
const NAVIGABLE_LAYER_BY_BIOME = [
  [BIOME_SYMBOL_TO_INDEX.desert, "desert-floodplain-navigable"],
  [BIOME_SYMBOL_TO_INDEX.temperateHumid, "grassland-floodplain-navigable"],
  [BIOME_SYMBOL_TO_INDEX.temperateDry, "plains-floodplain-navigable"],
  [BIOME_SYMBOL_TO_INDEX.tropicalSeasonal, "plains-floodplain-navigable"],
  [BIOME_SYMBOL_TO_INDEX.tropicalRainforest, "tropical-floodplain-navigable"],
  [BIOME_SYMBOL_TO_INDEX.snow, "tundra-floodplain-navigable"],
  [BIOME_SYMBOL_TO_INDEX.tundra, "tundra-floodplain-navigable"],
  [BIOME_SYMBOL_TO_INDEX.boreal, "tundra-floodplain-navigable"],
] as const;
const NAVIGABLE_LAYER_KEYS = [
  "desert-floodplain-navigable",
  "grassland-floodplain-navigable",
  "plains-floodplain-navigable",
  "tropical-floodplain-navigable",
  "tundra-floodplain-navigable",
] as const;

function tileIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

function createInput() {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  return {
    width,
    height,
    seed: TEST_MAP_SEED,
    landMask: new Uint8Array(size).fill(1),
    biomeIndex: new Uint8Array(size),
    fertility: new Float32Array(size).fill(1),
    floodplainMask: new Uint8Array(size),
    navigableRiverMask: new Uint8Array(size),
    discharge: new Float32Array(size),
    elevation: new Int16Array(size).fill(100),
    mountainMask: new Uint8Array(size),
    hillMask: new Uint8Array(size),
    volcanoMask: new Uint8Array(size),
  };
}

describe("ecology floodplain alluvial-relief scoring", () => {
  it("routes every admitted biome into its floodplain feature family", () => {
    const input = createInput();
    const { width } = input;
    const row = 4;

    for (const [caseIndex, [biomeIndex]] of NAVIGABLE_LAYER_BY_BIOME.entries()) {
      const tile = tileIndex(caseIndex + 4, row, width);
      input.floodplainMask[tile] = 1;
      input.navigableRiverMask[tile] = 1;
      input.biomeIndex[tile] = biomeIndex;
    }

    const { layers } = floodplainScore.run(input, selection);

    for (const [caseIndex, [, expectedLayer]] of NAVIGABLE_LAYER_BY_BIOME.entries()) {
      const tile = tileIndex(caseIndex + 4, row, width);
      expect(layers[expectedLayer][tile], `${expectedLayer} at tile ${tile}`).toBeGreaterThan(0);
      for (const layer of NAVIGABLE_LAYER_KEYS) {
        if (layer === expectedLayer) continue;
        expect(layers[layer][tile], `${layer} at tile ${tile}`).toBe(0);
      }
    }
  });

  it("routes navigable and wrapped-adjacent minor alluvium into their biome families", () => {
    const input = createInput();
    const { width } = input;
    const row = 2;
    const navigableTile = tileIndex(0, row, width);
    const wrappedMinorTile = tileIndex(width - 1, row, width);

    input.floodplainMask[navigableTile] = 1;
    input.navigableRiverMask[navigableTile] = 1;
    input.discharge[navigableTile] = 500;
    input.biomeIndex[navigableTile] = BIOME_SYMBOL_TO_INDEX.desert;

    input.floodplainMask[wrappedMinorTile] = 1;
    input.biomeIndex[wrappedMinorTile] = BIOME_SYMBOL_TO_INDEX.temperateHumid;

    const { layers } = floodplainScore.run(input, selection);

    expect(layers["desert-floodplain-navigable"][navigableTile]).toBeGreaterThan(0);
    expect(layers["desert-floodplain-minor"][navigableTile]).toBe(0);
    expect(layers["grassland-floodplain-minor"][wrappedMinorTile]).toBeGreaterThan(0);
    expect(layers["grassland-floodplain-navigable"][wrappedMinorTile]).toBe(0);
    expect(layers["plains-floodplain-minor"][wrappedMinorTile]).toBe(0);
  });

  it("rejects nonland, mountain, hill, and volcano tiles despite floodplain river evidence", () => {
    const input = createInput();
    const { width } = input;
    const excludedTiles = [
      tileIndex(4, 4, width),
      tileIndex(5, 4, width),
      tileIndex(6, 4, width),
      tileIndex(7, 4, width),
    ];

    for (const tile of excludedTiles) {
      input.floodplainMask[tile] = 1;
      input.navigableRiverMask[tile] = 1;
      input.discharge[tile] = 1000;
      input.biomeIndex[tile] = BIOME_SYMBOL_TO_INDEX.tropicalRainforest;
    }
    input.landMask[excludedTiles[0]!] = 0;
    input.mountainMask[excludedTiles[1]!] = 1;
    input.hillMask[excludedTiles[2]!] = 1;
    input.volcanoMask[excludedTiles[3]!] = 1;

    const { layers } = floodplainScore.run(input, selection);

    for (const tile of excludedTiles) {
      expect(layers["tropical-floodplain-navigable"][tile]).toBe(0);
    }
  });

  it("responds monotonically to fertility and relief while remaining deterministic and bounded", () => {
    const baseline = createInput();
    const { width, height } = baseline;
    const x = Math.floor(width / 2);
    const y = Math.floor(height / 2);
    const target = tileIndex(x, y, width);

    baseline.floodplainMask[target] = 1;
    baseline.navigableRiverMask[target] = 1;
    baseline.biomeIndex[target] = BIOME_SYMBOL_TO_INDEX.temperateDry;

    const lowFertility = createInput();
    lowFertility.floodplainMask[target] = 1;
    lowFertility.navigableRiverMask[target] = 1;
    lowFertility.biomeIndex[target] = BIOME_SYMBOL_TO_INDEX.temperateDry;
    lowFertility.fertility[target] = 0;

    const highRelief = createInput();
    highRelief.floodplainMask[target] = 1;
    highRelief.navigableRiverMask[target] = 1;
    highRelief.biomeIndex[target] = BIOME_SYMBOL_TO_INDEX.temperateDry;
    for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
      highRelief.elevation[neighbor] = 360;
    }

    const baselineScore = floodplainScore.run(baseline, selection).layers[
      "plains-floodplain-navigable"
    ][target]!;
    const repeatedScore = floodplainScore.run(baseline, selection).layers[
      "plains-floodplain-navigable"
    ][target]!;
    const lowFertilityScore = floodplainScore.run(lowFertility, selection).layers[
      "plains-floodplain-navigable"
    ][target]!;
    const highReliefScore = floodplainScore.run(highRelief, selection).layers[
      "plains-floodplain-navigable"
    ][target]!;

    expect(repeatedScore).toBe(baselineScore);
    expect(baselineScore).toBeGreaterThan(lowFertilityScore);
    expect(baselineScore).toBeGreaterThan(highReliefScore);
    expect(baselineScore).toBeGreaterThanOrEqual(0);
    expect(baselineScore).toBeLessThanOrEqual(1);
  });

  it("uses the admitted seed to vary alluvial patch suitability deterministically", () => {
    const input = createInput();
    const { width } = input;
    const probeTiles = [4, 8, 12, 16].map((x) => tileIndex(x, 6, width));
    for (const tile of probeTiles) {
      input.floodplainMask[tile] = 1;
      input.navigableRiverMask[tile] = 1;
      input.biomeIndex[tile] = BIOME_SYMBOL_TO_INDEX.temperateDry;
    }

    const scoresFor = (seed: number) => {
      const result = floodplainScore.run({ ...input, seed }, selection);
      return probeTiles.map((tile) => result.layers["plains-floodplain-navigable"][tile]);
    };
    const first = scoresFor(TEST_MAP_SEED);
    const repeated = scoresFor(TEST_MAP_SEED);
    const alternateSeed = TEST_MAP_SEED === 2_147_483_647 ? 0 : TEST_MAP_SEED + 1;

    expect(repeated).toEqual(first);
    expect(scoresFor(alternateSeed)).not.toEqual(first);
  });
});
