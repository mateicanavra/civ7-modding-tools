import { describe, expect, it } from "bun:test";
import ecology from "../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../setup.js";

const lotusOp = ecology.features.ops.scoreReefLotus;

function createCertifiedLakeInput(width: number, height: number) {
  const size = width * height;
  return {
    width,
    height,
    landMask: new Uint8Array(size).fill(1),
    surfaceTemperature: new Float32Array(size).fill(32),
    elevation: new Int16Array(size).fill(100),
    lakeMask: new Uint8Array(size),
    bodyId: new Int32Array(size),
    waterSurface: new Array<number>(size).fill(100.25),
  };
}

function scoreCertifiedLake(input: ReturnType<typeof createCertifiedLakeInput>, maxDistanceToCoast = 2) {
  return lotusOp.run(input, normalizeOperationSelectionForTest(lotusOp, {
    ...lotusOp.defaultConfig,
    config: { ...lotusOp.defaultConfig.config, maxDistanceToCoast },
  })).score01;
}

describe("ecology reef-family habitats", () => {
  it("partitions reefs by shelf, coast distance, temperature, depth, and lake state", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size);
    landMask[0] = landMask[width] = 1;
    const warm = new Float32Array(size).fill(28);
    const cold = new Float32Array(size).fill(8);
    const shallow = new Int16Array(size).fill(-10);
    const coldReefDepth = new Int16Array(size).fill(-300);
    const shelfMask = new Uint8Array(size);
    shelfMask[0] = 1;
    shelfMask[2] = 1;
    shelfMask[3] = 1;
    const openOceanMask = new Uint8Array(size);
    openOceanMask[1] = 1;
    const lakeMask = new Uint8Array(size);
    lakeMask[0] = 1;
    const coastalWater = new Uint8Array(size);
    coastalWater[0] = 1;
    coastalWater[2] = 1;
    coastalWater[3] = 1;
    const distanceToCoast = new Uint16Array(size).fill(5);
    distanceToCoast[0] = 1;
    distanceToCoast[2] = 1;
    distanceToCoast[3] = 1;

    const reef = ecology.features.ops.scoreReef.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: warm,
        bathymetry: shallow,
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreReef,
        ecology.features.ops.scoreReef.defaultConfig
      )
    ).score01;
    const atoll = ecology.features.ops.scoreReefAtoll.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: warm,
        bathymetry: shallow,
        shelfMask,
        openOceanMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreReefAtoll,
        ecology.features.ops.scoreReefAtoll.defaultConfig
      )
    ).score01;
    const lotus = ecology.features.ops.scoreReefLotus.run(
      {
        width, height, landMask, surfaceTemperature: warm, lakeMask,
        elevation: new Int16Array(size).fill(100),
        bodyId: Int32Array.from(lakeMask, (wet) => wet),
        waterSurface: Array<number>(size).fill(100.25),
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreReefLotus,
        ecology.features.ops.scoreReefLotus.defaultConfig
      )
    ).score01;
    const coldReef = ecology.features.ops.scoreColdReef.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: cold,
        bathymetry: coldReefDepth,
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOperationSelectionForTest(ecology.features.ops.scoreColdReef, {
        ...ecology.features.ops.scoreColdReef.defaultConfig,
        config: {
          ...ecology.features.ops.scoreColdReef.defaultConfig.config,
          minDepthM: 120,
          peakDepthM: 300,
          maxDepthM: 520,
        },
      })
    ).score01;
    const abyssalColdReef = ecology.features.ops.scoreColdReef.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: cold,
        bathymetry: new Int16Array(size).fill(-2000),
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreColdReef,
        ecology.features.ops.scoreColdReef.defaultConfig
      )
    ).score01;

    expect(reef[0]).toBe(0);
    expect(reef[2]).toBeGreaterThan(0.5);
    expect(reef[1]).toBe(0);
    expect(atoll[0]).toBe(0);
    expect(atoll[1]).toBeGreaterThan(0.5);
    expect(lotus[0]).toBeGreaterThan(0.5);
    expect(lotus[1]).toBe(0);
    expect(coldReef[0]).toBe(0);
    expect(coldReef[2]).toBeGreaterThan(0.5);
    expect(abyssalColdReef[0]).toBe(0);
  });

  it("scores positive fractional lake depth over unchanged physical land without marine masks", () => {
    const input = createCertifiedLakeInput(6, 1);
    input.lakeMask.set([1, 1, 1, 1, 1, 0]);
    input.bodyId.set([1, 1, 1, 1, 1, 0]);
    input.elevation[1] = 60;
    input.elevation[2] = 101;
    input.surfaceTemperature[3] = 8;
    input.surfaceTemperature[4] = 28;
    const before = structuredClone(input);
    const score = scoreCertifiedLake(input, 512);
    expect(score[0]).toBe(Math.fround(1 - 0.25 / 40));
    expect(score[1]).toBe(0);
    expect(score[2]).toBe(0);
    expect(score[3]).toBe(0);
    expect(score[4]).toBe(Math.fround(0.75 * (1 - 0.25 / 40)));
    expect(score[5]).toBe(0);
    expect(input.landMask.every((cell) => cell === 1)).toBe(true);
    expect(scoreCertifiedLake(input, 512)).toEqual(score);
    expect(input).toEqual(before);
  });

  it("excludes strict zero and negative depths while preserving the smallest positive binary64 head", () => {
    const input = createCertifiedLakeInput(3, 1);
    input.lakeMask[1] = 1;
    input.bodyId[1] = 2;
    input.waterSurface[1] = 100;
    expect(scoreCertifiedLake(input)[1]).toBe(0);
    input.waterSurface[1] = 99.75;
    expect(scoreCertifiedLake(input)[1]).toBe(0);
    input.elevation[1] = 0;
    input.waterSurface[1] = Number.MIN_VALUE;
    expect(scoreCertifiedLake(input)[1]).toBe(1);
    input.waterSurface[1] = 0.25;
    expect(scoreCertifiedLake(input)[1]).toBe(Math.fround(1 - 0.25 / 40));
  });

  it("is invariant under joint translation of physical ground and certified head", () => {
    const input = createCertifiedLakeInput(5, 1);
    input.lakeMask.set([0, 1, 1, 1, 0]);
    input.bodyId.set([0, 2, 2, 2, 0]);
    input.elevation[2] = 80;
    const score = scoreCertifiedLake(input);
    const translated = {
      ...input,
      elevation: Int16Array.from(input.elevation, (ground) => ground + 1000),
      waterSurface: input.waterSurface.map((head) => head + 1000),
    };
    expect(scoreCertifiedLake(translated)).toEqual(score);
    expect(score[1]).toBeGreaterThan(score[2]!);
  });

  it("uses body-local shore distance and rejects unseeded bodies even at the maximum authored distance", () => {
    const input = createCertifiedLakeInput(7, 1);
    input.landMask.set([1, 1, 1, 1, 1, 0, 0]);
    input.lakeMask.set([0, 1, 1, 1, 1, 0, 0]);
    input.bodyId.set([0, 2, 2, 4, 4, 0, 0]);
    const score = scoreCertifiedLake(input, 512);
    expect(score[1]).toBeGreaterThan(0);
    expect(score[2]).toBeGreaterThan(0);
    expect(score[3]).toBe(0);
    expect(score[4]).toBe(0);
    expect(scoreCertifiedLake(input, 0)[2]).toBe(0);
  });

  it("applies the authored distance bound to inland members instead of making every footprint edge shore", () => {
    const input = createCertifiedLakeInput(9, 1);
    input.lakeMask.set([0, 1, 1, 1, 1, 1, 1, 1, 0]);
    input.bodyId.set([0, 2, 2, 2, 2, 2, 2, 2, 0]);
    expect(scoreCertifiedLake(input, 2)[4]).toBe(0);
    expect(scoreCertifiedLake(input, 3)[4]).toBeGreaterThan(0);
    expect(scoreCertifiedLake(input, 0)[1]).toBeGreaterThan(0);
  });

  it("wraps X during body-local hex propagation", () => {
    const input = createCertifiedLakeInput(7, 1);
    input.landMask.fill(0);
    input.landMask[4] = 1;
    input.lakeMask.set([1, 1, 0, 0, 0, 1, 1]);
    input.bodyId.set([1, 1, 0, 0, 0, 1, 1]);
    const score = scoreCertifiedLake(input, 2);
    expect(score[5]).toBeGreaterThan(0);
    expect(score[6]).toBeGreaterThan(0);
    expect(score[0]).toBeGreaterThan(0);
    expect(score[1]).toBe(0);
  });

  it("uses Core hex diagonals and does not wrap Y or seed shore on marine-only edges", () => {
    const input = createCertifiedLakeInput(5, 3);
    input.landMask.fill(0);
    input.landMask[1] = 1;
    input.lakeMask[6] = input.lakeMask[12] = 1;
    input.bodyId[6] = input.bodyId[12] = 7;
    expect(scoreCertifiedLake(input, 0)[12]).toBe(0);
    expect(scoreCertifiedLake(input, 1)[12]).toBeGreaterThan(0);

    input.landMask.fill(0);
    input.landMask[12] = 1;
    input.lakeMask.fill(0);
    input.bodyId.fill(0);
    input.lakeMask[2] = 1;
    input.bodyId[2] = 3;
    expect(scoreCertifiedLake(input, 512).every((value) => value === 0)).toBe(true);
    input.landMask.fill(0);
    expect(scoreCertifiedLake(input, 512).every((value) => value === 0)).toBe(true);
    input.landMask.fill(1);
    input.lakeMask.fill(1);
    input.bodyId.fill(1);
    expect(scoreCertifiedLake(input, 512).every((value) => value === 0)).toBe(true);
  });

  it("fails closed for missing or malformed physical lake evidence without retired input fallthrough", () => {
    const input = createCertifiedLakeInput(3, 1);
    input.lakeMask[1] = 1;
    input.bodyId[1] = 2;
    const { bodyId, waterSurface, ...missingEvidence } = input;
    const malformed: readonly unknown[] = [
      missingEvidence,
      { ...input, model: "legacy-sink-budget" },
      { ...input, bathymetry: new Int16Array(3) },
      { ...input, bodyId: new Int32Array(2) },
      { ...input, bodyId: new Int32Array(3) },
      { ...input, bodyId: Int32Array.of(2, 2, 0) },
      { ...input, lakeMask: Uint8Array.of(0, 2, 0) },
      { ...input, landMask: Uint8Array.of(1, 2, 1) },
      { ...input, waterSurface: waterSurface.slice(1) },
      { ...input, waterSurface: new Float32Array(waterSurface) },
      { ...input, waterSurface: [100, NaN, 100] },
      { ...input, waterSurface: [100, Infinity, 100] },
      {
        width: 3, height: 1,
        landMask: new Uint8Array(3),
        surfaceTemperature: input.surfaceTemperature,
        bathymetry: new Int16Array(3).fill(-10),
        lakeMask: new Uint8Array(3).fill(1),
        shelfMask: new Uint8Array(3).fill(1),
        coastalWater: new Uint8Array(3).fill(1),
        distanceToCoast: new Uint16Array(3),
      },
    ];
    for (const candidate of malformed) {
      expect(() => Reflect.apply(lotusOp.run, undefined, [candidate, lotusOp.defaultConfig])).toThrow();
    }
    expect(bodyId).toEqual(Int32Array.of(0, 2, 0));
  });
});
