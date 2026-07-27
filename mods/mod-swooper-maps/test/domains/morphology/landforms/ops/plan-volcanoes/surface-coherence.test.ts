import { describe, expect, it } from "bun:test";

import { VOLCANO_INTENT_KIND } from "@mapgen/domain/morphology/modules/landforms/model/atoms/volcano-intent.schema.js";
import morphology from "@mapgen/domain/morphology/router";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { deriveTestOperationSeed, TEST_MAP_SIZE } from "../../../../../setup.js";

const { planVolcanoes } = morphology.landforms.ops;

type Candidate = Readonly<{
  x: number;
  y: number;
  boundaryType: number;
  boundaryCloseness?: number;
  shieldStability?: number;
  volcanism: number;
}>;

function createInput(candidates: readonly Candidate[]) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const cellCount = width * height;
  const landMask = new Uint8Array(cellCount);
  const boundaryCloseness = new Uint8Array(cellCount);
  const boundaryType = new Uint8Array(cellCount);
  const shieldStability = new Uint8Array(cellCount);
  const volcanism = new Uint8Array(cellCount);

  for (const candidate of candidates) {
    const tileIndex = candidate.y * width + candidate.x;
    landMask[tileIndex] = 1;
    boundaryCloseness[tileIndex] = candidate.boundaryCloseness ?? 255;
    boundaryType[tileIndex] = candidate.boundaryType;
    shieldStability[tileIndex] = candidate.shieldStability ?? 0;
    volcanism[tileIndex] = candidate.volcanism;
  }

  return {
    width,
    height,
    landMask,
    boundaryCloseness,
    boundaryType,
    shieldStability,
    volcanism,
    rngSeed: deriveTestOperationSeed("test:morphology:plan-volcanoes"),
  };
}

function selection(overrides: Partial<typeof planVolcanoes.defaultConfig.config> = {}) {
  return {
    strategy: "plate-hotspot-ranking" as const,
    config: {
      ...planVolcanoes.defaultConfig.config,
      baseDensity: 0,
      randomJitter: 0,
      minSpacing: 1,
      ...overrides,
    },
  };
}

describe("plan-volcanoes surface coherence", () => {
  it("returns one deterministic exact mask/list product with honest tectonic settings", () => {
    const candidates = [
      {
        x: 5,
        y: 5,
        boundaryType: BOUNDARY_TYPE.convergent,
        volcanism: 51,
      },
      {
        x: 15,
        y: 5,
        boundaryType: BOUNDARY_TYPE.divergent,
        volcanism: 102,
      },
      {
        x: 25,
        y: 5,
        boundaryType: BOUNDARY_TYPE.transform,
        volcanism: 153,
      },
      {
        x: 35,
        y: 5,
        boundaryType: BOUNDARY_TYPE.none,
        boundaryCloseness: 0,
        volcanism: 204,
      },
      {
        x: 45,
        y: 5,
        boundaryType: BOUNDARY_TYPE.convergent,
        boundaryCloseness: 0,
        volcanism: 230,
      },
    ] as const;
    const input = createInput(candidates);
    const snapshots = {
      landMask: input.landMask.slice(),
      boundaryCloseness: input.boundaryCloseness.slice(),
      boundaryType: input.boundaryType.slice(),
      shieldStability: input.shieldStability.slice(),
      volcanism: input.volcanism.slice(),
    };
    const invertedCountBounds = selection({ minVolcanoes: 5, maxVolcanoes: 1 });

    const first = runAdmittedOperationForTest(planVolcanoes, input, invertedCountBounds);
    const second = runAdmittedOperationForTest(planVolcanoes, input, invertedCountBounds);

    expect(input.landMask).toEqual(snapshots.landMask);
    expect(input.boundaryCloseness).toEqual(snapshots.boundaryCloseness);
    expect(input.boundaryType).toEqual(snapshots.boundaryType);
    expect(input.shieldStability).toEqual(snapshots.shieldStability);
    expect(input.volcanism).toEqual(snapshots.volcanism);
    expect(first.volcanoMask).not.toBe(input.landMask);
    expect(first.volcanoMask).toEqual(second.volcanoMask);
    expect(first.volcanoes).toEqual(second.volcanoes);

    const expectedKinds = [
      VOLCANO_INTENT_KIND.convergentMargin,
      VOLCANO_INTENT_KIND.divergentMargin,
      VOLCANO_INTENT_KIND.transformMargin,
      VOLCANO_INTENT_KIND.intraplate,
      VOLCANO_INTENT_KIND.intraplate,
    ];
    expect(first.volcanoes.map(({ kind }) => kind)).toEqual(expectedKinds);
    expect(first.volcanoes.map(({ tileIndex }) => tileIndex)).toEqual(
      candidates.map(({ x, y }) => y * input.width + x)
    );

    const selected = new Set(first.volcanoes.map(({ tileIndex }) => tileIndex));
    let maskCount = 0;
    for (let tileIndex = 0; tileIndex < first.volcanoMask.length; tileIndex += 1) {
      const isSelected = selected.has(tileIndex);
      expect(first.volcanoMask[tileIndex]).toBe(isSelected ? 1 : 0);
      if (isSelected) {
        maskCount += 1;
        expect(input.landMask[tileIndex]).toBe(1);
      }
    }
    expect(maskCount).toBe(first.volcanoes.length);
    for (const [index, volcano] of first.volcanoes.entries()) {
      expect(volcano.strength01).toBeCloseTo(candidates[index]!.volcanism / 255, 12);
    }
  });

  it("returns the exact empty product when volcano planning is disabled", () => {
    const input = createInput([
      {
        x: 5,
        y: 5,
        boundaryType: BOUNDARY_TYPE.convergent,
        volcanism: 255,
      },
    ]);

    const result = runAdmittedOperationForTest(
      planVolcanoes,
      input,
      selection({ enabled: false, minVolcanoes: 1, maxVolcanoes: 1 })
    );

    expect(result.volcanoes).toEqual([]);
    expect(result.volcanoMask).toEqual(
      new Uint8Array(TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height)
    );
  });

  it("treats opposite horizontal edges as adjacent in volcano spacing", () => {
    const { width } = TEST_MAP_SIZE.dimensions;
    const y = 10;
    const west = y * width;
    const east = y * width + (width - 1);
    const interior = y * width + Math.floor(width / 2);
    const input = createInput([
      {
        x: 0,
        y,
        boundaryType: BOUNDARY_TYPE.convergent,
        volcanism: 255,
      },
      {
        x: width - 1,
        y,
        boundaryType: BOUNDARY_TYPE.convergent,
        volcanism: 224,
      },
      {
        x: Math.floor(width / 2),
        y,
        boundaryType: BOUNDARY_TYPE.convergent,
        volcanism: 180,
      },
    ]);

    const result = runAdmittedOperationForTest(
      planVolcanoes,
      input,
      selection({ minVolcanoes: 3, maxVolcanoes: 3, minSpacing: 2 })
    );

    expect(hexDistanceOddQPeriodicX(west, east, width)).toBe(1);
    expect(result.volcanoes.map(({ tileIndex }) => tileIndex)).toEqual([west, interior]);
    expect(result.volcanoMask[east]).toBe(0);
  });
});
