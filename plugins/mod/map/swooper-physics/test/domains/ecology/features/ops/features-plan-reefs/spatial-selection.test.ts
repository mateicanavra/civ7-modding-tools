import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/map-policy";
import { hexDistanceOddQPeriodicX, oddqToCube } from "@swooper/mapgen-core/lib/grid";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { TEST_MAP_SEED } from "../../../../../setup.js";

const planReefs = ecology.features.ops.planReefs;

function createInput(width: number, height: number) {
  const size = width * height;
  return {
    width,
    height,
    seed: TEST_MAP_SEED,
    scoreReef01: new Float32Array(size),
    scoreColdReef01: new Float32Array(size),
    scoreAtoll01: new Float32Array(size),
    scoreLotus01: new Float32Array(size),
    lakeMask: new Uint8Array(size),
    featureOccupancyMask: new Uint8Array(size),
  };
}

function select(input: ReturnType<typeof createInput>, minSpacingTiles: number, minConfidence01 = 0.5) {
  return planReefs.run(input, normalizeOperationSelectionForTest(planReefs, {
    strategy: "habitat",
    config: { minConfidence01, minSpacingTiles },
  })).placements;
}

function indices(placements: ReturnType<typeof select>, width: number) {
  return placements.map(({ x, y }) => y * width + x);
}

// The oracle uses cube distance, independently of the planner's radius BFS.
function expectSpatialSet(selected: number[], eligible: number[], width: number, spacing: number) {
  expect(selected).toEqual([...selected].sort((a, b) => a - b));
  expect(new Set(selected).size).toBe(selected.length);
  const admitted = new Set(eligible);
  for (const tile of selected) expect(admitted.has(tile)).toBe(true);
  for (let a = 0; a < selected.length; a++) {
    for (let b = a + 1; b < selected.length; b++) {
      expect(hexDistanceOddQPeriodicX(selected[a]!, selected[b]!, width)).toBeGreaterThanOrEqual(spacing);
    }
  }
  for (const tile of eligible) {
    expect(selected.some((witness) => hexDistanceOddQPeriodicX(tile, witness, width) < spacing)).toBe(true);
  }
  if (spacing === 1) expect(selected).toEqual(eligible);
}

function translateHex(x: number, y: number, dq: number, dr: number, width: number) {
  const cube = oddqToCube(x, y);
  const row = cube.z + dr;
  const column = cube.x + dq + (row - (row & 1)) / 2;
  return { x: ((column % width) + width) % width, y: row };
}

describe("planReefs habitat-ranked spatial selection", () => {
  it("admits the confidence boundary without mutating inputs and returns row-major intent", () => {
    const input = createInput(8, 1);
    input.scoreReef01.set([0.49, 0.5, 0.75, 1, 0, Number.NaN, Number.POSITIVE_INFINITY, 0.875]);
    input.featureOccupancyMask[3] = 1;
    const before = structuredClone(input);

    expect(select(input, 1)).toEqual([
      { x: 1, y: 0, feature: "reef" },
      { x: 2, y: 0, feature: "reef" },
      { x: 7, y: 0, feature: "reef" },
    ]);
    for (const key of ["scoreReef01", "scoreColdReef01", "scoreAtoll01", "scoreLotus01", "lakeMask", "featureOccupancyMask"] as const) {
      expect(new Uint8Array(input[key].buffer)).toEqual(new Uint8Array(before[key].buffer));
    }
    expect(select(input, 1)).toEqual(select(structuredClone(input), 1));
    expect(select(createInput(3, 3), 12)).toEqual([]);
  });

  it("does not let upstream occupancy or below-floor evidence block a free neighbor", () => {
    const input = createInput(8, 1);
    input.scoreReef01[0] = 1;
    input.featureOccupancyMask[0] = 1;
    input.scoreReef01[1] = 0.75;
    input.scoreReef01[2] = 0.49;
    expect(select(input, 3)).toEqual([{ x: 1, y: 0, feature: "reef" }]);

    input.scoreReef01[0] = 0.49;
    input.featureOccupancyMask[0] = 0;
    expect(select(input, 3)).toEqual([{ x: 1, y: 0, feature: "reef" }]);
  });

  it("keeps lotus lake-gated and preserves the within-cell family tie law", () => {
    const input = createInput(6, 1);
    input.scoreLotus01.fill(1);
    expect(select(input, 1)).toEqual([]);
    input.lakeMask[0] = 1;
    input.lakeMask[1] = 1;
    input.scoreReef01[1] = 1;
    input.scoreColdReef01[1] = 1;
    input.scoreAtoll01[1] = 1;
    input.scoreColdReef01[2] = 0.75;
    expect(select(input, 1)).toEqual([
      { x: 0, y: 0, feature: "lotus" },
      { x: 1, y: 0, feature: "atoll" },
      { x: 2, y: 0, feature: "cold-reef" },
    ]);
  });

  it("retains a lone atoll at every longitude, edge, row parity, and admitted spacing", () => {
    const { width, height } = getCiv7StandardMapSizePreset("MAPSIZE_HUGE").dimensions;
    const huge = createInput(width, height);
    huge.scoreAtoll01[33 * width + 12] = 0.7464;
    expect(select(huge, 3, 0.52)).toEqual([{ x: 12, y: 33, feature: "atoll" }]);

    const input = createInput(width, 6);
    for (let y = 0; y < input.height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = y * width + x;
        input.scoreAtoll01[tile] = 0.7464;
        for (const spacing of [1, 2, 3, 12]) {
          expect(select(input, spacing, 0.52)).toEqual([{ x, y, feature: "atoll" }]);
        }
        input.scoreAtoll01[tile] = 0;
      }
    }
  });

  it("ranks by confidence, shares spacing across every family, and blocks only from accepted cells", () => {
    for (const [stronger, weaker] of [
      ["scoreReef01", "scoreColdReef01"],
      ["scoreColdReef01", "scoreAtoll01"],
      ["scoreAtoll01", "scoreLotus01"],
      ["scoreLotus01", "scoreReef01"],
    ] as const) {
      const input = createInput(8, 1);
      input.lakeMask.fill(1);
      input[weaker][0] = 0.75;
      input[stronger][1] = 1;
      expect(indices(select(input, 2), input.width)).toEqual([1]);
    }

    const chain = createInput(8, 1);
    chain.scoreReef01.set([1, 0.875, 0.75]);
    expect(indices(select(chain, 2), chain.width)).toEqual([0, 2]);
  });

  it("matches independent distance for every pair on wrapped narrow and odd-row grids", () => {
    for (const [width, height] of [[1, 1], [1, 5], [2, 5], [7, 5], [8, 4]] as const) {
      const input = createInput(width, height);
      const size = width * height;
      for (let a = 0; a < size; a++) {
        for (let b = a + 1; b < size; b++) {
          input.scoreReef01[a] = 0.75;
          input.scoreReef01[b] = 1;
          const distance = hexDistanceOddQPeriodicX(a, b, width);
          for (let spacing = 1; spacing <= 12; spacing++) {
            expect(indices(select(input, spacing), width)).toEqual(distance < spacing ? [b] : [a, b]);
          }
          input.scoreReef01[a] = 0;
          input.scoreReef01[b] = 0;
        }
      }
    }
  });

  it("is a maximal spaced subset for every small bank with equal or distinct priorities", () => {
    for (const [width, height] of [[1, 5], [2, 3], [3, 3]] as const) {
      const size = width * height;
      for (let bank = 0; bank < 2 ** size; bank++) {
        for (const distinct of [false, true]) {
          const input = createInput(width, height);
          const eligible: number[] = [];
          for (let tile = 0; tile < size; tile++) {
            if ((bank & (1 << tile)) === 0) continue;
            eligible.push(tile);
            input.scoreReef01[tile] = distinct ? 0.5 + tile / (2 * size) : 0.75;
          }
          for (const spacing of [1, 2, 3, 12]) {
            const selected = indices(select(input, spacing), width);
            expectSpatialSet(selected, eligible, width, spacing);
            // Replaying the quality order with a distance oracle also checks which maximal set wins.
            const expected: number[] = [];
            for (const tile of distinct ? [...eligible].reverse() : eligible) {
              if (expected.every((other) => hexDistanceOddQPeriodicX(tile, other, width) >= spacing)) {
                expected.push(tile);
              }
            }
            expect(selected).toEqual(expected.sort((a, b) => a - b));
          }
        }
      }
    }
  });

  it("spaces dense mixed-family banks and retains a suppression witness for every rejected tile", () => {
    const input = createInput(17, 9);
    const layers = [input.scoreReef01, input.scoreColdReef01, input.scoreAtoll01, input.scoreLotus01];
    const eligible = Array.from({ length: input.width * input.height }, (_, tile) => tile);
    input.lakeMask.fill(1);
    for (const distinct of [false, true]) {
      for (const tile of eligible) layers[tile % 4]![tile] = distinct ? 0.5 + tile / (2 * eligible.length) : 0.75;
      const before = structuredClone(input);
      for (let spacing = 1; spacing <= 12; spacing++) {
        const placements = select(input, spacing);
        expectSpatialSet(indices(placements, input.width), eligible, input.width, spacing);
        expect(select(structuredClone(input), spacing)).toEqual(placements);
      }
      expect(input).toEqual(before);
    }
  });

  it("preserves distinct-priority selection through seam and parity-correct interior translations", () => {
    const width = 13;
    const height = 12;
    const bank = [
      { x: 12, y: 4, score: 1 },
      { x: 0, y: 4, score: 0.9375 },
      { x: 1, y: 5, score: 0.875 },
      { x: 5, y: 5, score: 0.8125 },
      { x: 5, y: 6, score: 0.75 },
      { x: 8, y: 7, score: 0.6875 },
    ];
    const original = createInput(width, height);
    for (const cell of bank) original.scoreAtoll01[cell.y * width + cell.x] = cell.score;
    for (const spacing of [1, 2, 3, 4, 12]) {
      const selected = select(original, spacing);
      for (let dq = 0; dq < width; dq++) {
        for (const dr of [-3, -2, -1, 0, 1, 2, 3]) {
          const translated = createInput(width, height);
          for (const cell of bank) {
            const { x, y } = translateHex(cell.x, cell.y, dq, dr, width);
            expect(y).toBeGreaterThanOrEqual(0);
            expect(y).toBeLessThan(height);
            translated.scoreAtoll01[y * width + x] = cell.score;
          }
          const expected = selected.map(({ x, y, feature }) => ({ ...translateHex(x, y, dq, dr, width), feature }));
          expected.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));
          expect(select(translated, spacing)).toEqual(expected);
        }
      }
    }
  });

  it("retains deterministic tile-index ties without claiming tie translation equivariance", () => {
    const input = createInput(4, 1);
    input.scoreReef01.fill(0.75);
    const selected = indices(select(input, 2), input.width);
    expect(selected).toEqual([0, 2]);
    expect(indices(select(structuredClone(input), 2), input.width)).toEqual(selected);
    expect(selected).not.toEqual(selected.map((tile) => (tile + 1) % input.width).sort((a, b) => a - b));
    expectSpatialSet(selected, [0, 1, 2, 3], input.width, 2);
  });

  it("handles a dense Huge-size bank with the existing radius helper", () => {
    const { width, height } = getCiv7StandardMapSizePreset("MAPSIZE_HUGE").dimensions;
    const input = createInput(width, height);
    input.scoreReef01.fill(0.75);
    expect(select(input, 1)).toHaveLength(width * height);
    for (const spacing of [2, 3, 12]) {
      const selected = indices(select(input, spacing), width);
      expect(selected.length).toBeGreaterThan(0);
      expect(selected.length).toBeLessThan(width * height);
      expect(selected).toEqual([...new Set(selected)].sort((a, b) => a - b));
    }
  });
});
