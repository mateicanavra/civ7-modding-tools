import { describe, expect, it } from "bun:test";

import placementDomain from "../../src/domain/placement/ops.js";
import { runOpValidated } from "../support/compiler-helpers.js";

const {
  planDiscoveries,
  planFloodplains,
  planNaturalWonders,
  planResources,
  planStarts,
  planWonders,
} = placementDomain.ops;

describe("placement plan operations", () => {
  it("plans wonders from map-size defaults without bonus inflation", () => {
    const result = runOpValidated(planWonders, { mapInfo: { NumNaturalWonders: 2 } }, {
      strategy: "default",
      config: {},
    });
    expect(result.wondersCount).toBe(2);
  });

  it("rejects legacy wondersPlusOne config", () => {
    expect(() =>
      runOpValidated(planWonders, { mapInfo: { NumNaturalWonders: 2 } }, {
        strategy: "default",
        config: { wondersPlusOne: true },
      })
    ).toThrow();
  });

  it("plans zero wonders when map-size default is absent", () => {
    const result = runOpValidated(planWonders, { mapInfo: {} }, {
      strategy: "default",
      config: {},
    });
    expect(result.wondersCount).toBe(0);
  });

  it("plans deterministic natural wonder placements from physical fields", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const result = runOpValidated(planNaturalWonders, {
      width,
      height,
      wondersCount: 2,
      landMask: new Uint8Array(size).fill(1),
      elevation: Int16Array.from([5, 20, 30, 40, 10, 100, 70, 20, 0, 10, 15, 60]),
      aridityIndex: new Float32Array(size).fill(0.3),
      riverClass: new Uint8Array(size),
      lakeMask: new Uint8Array(size),
      featureCatalog: [
        { featureType: 1001, direction: 0 },
        { featureType: 1002, direction: 1 },
      ],
    }, {
      strategy: "default",
      config: { minSpacingTiles: 1 },
    });

    expect(result.targetCount).toBe(2);
    expect(result.plannedCount).toBe(2);
    expect(result.placements.length).toBe(2);
    expect(result.placements[0]?.featureType).toBe(1001);
    expect(result.placements[1]?.featureType).toBe(1002);
  });

  it("plans deterministic discovery placements from physical fields", () => {
    const width = 5;
    const height = 4;
    const size = width * height;
    const result = runOpValidated(planDiscoveries, {
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      elevation: Int16Array.from(Array.from({ length: size }, (_, i) => (i % width) * 10)),
      aridityIndex: new Float32Array(size).fill(0.4),
      riverClass: new Uint8Array(size),
      lakeMask: new Uint8Array(size),
      discoveryVisualType: 11,
      discoveryActivationType: 22,
    }, {
      strategy: "default",
      config: { densityPer100Tiles: 10, minSpacingTiles: 1 },
    });

    expect(result.plannedCount).toBeGreaterThan(0);
    expect(result.placements.length).toBe(result.plannedCount);
    expect(result.placements[0]?.discoveryVisualType).toBe(11);
    expect(result.placements[0]?.discoveryActivationType).toBe(22);
  });

  it("prefers runtime-discovered resource candidates over authored config candidates", () => {
    const width = 6;
    const height = 4;
    const size = width * height;
    const result = runOpValidated(planResources, {
      width,
      height,
      noResourceSentinel: 99,
      runtimeCandidateResourceTypes: [7, 2, 7, -1, 99],
      landMask: new Uint8Array(size).fill(1),
      fertility: new Float32Array(size).fill(0.8),
      effectiveMoisture: new Float32Array(size).fill(0.6),
      surfaceTemperature: new Float32Array(size).fill(18),
      aridityIndex: new Float32Array(size).fill(0.4),
      riverClass: new Uint8Array(size),
      lakeMask: new Uint8Array(size),
    }, {
      strategy: "default",
      config: {
        candidateResourceTypes: [1, 3],
        densityPer100Tiles: 25,
        minSpacingTiles: 0,
        maxPlacementsPerResourceShare: 1,
      },
    });

    expect(result.candidateResourceTypes).toEqual([2, 7]);
    expect(result.placements.length).toBeGreaterThan(0);
    for (const placement of result.placements) {
      expect(result.candidateResourceTypes.includes(placement.preferredResourceType)).toBe(true);
    }
  });

  it("falls back to authored config candidates when runtime candidates are empty", () => {
    const width = 6;
    const height = 4;
    const size = width * height;
    const result = runOpValidated(planResources, {
      width,
      height,
      noResourceSentinel: 99,
      runtimeCandidateResourceTypes: [],
      landMask: new Uint8Array(size).fill(1),
      fertility: new Float32Array(size).fill(0.8),
      effectiveMoisture: new Float32Array(size).fill(0.6),
      surfaceTemperature: new Float32Array(size).fill(18),
      aridityIndex: new Float32Array(size).fill(0.4),
      riverClass: new Uint8Array(size),
      lakeMask: new Uint8Array(size),
    }, {
      strategy: "default",
      config: {
        candidateResourceTypes: [5, 1, 5],
        densityPer100Tiles: 25,
        minSpacingTiles: 0,
        maxPlacementsPerResourceShare: 1,
      },
    });

    expect(result.candidateResourceTypes).toEqual([1, 5]);
    expect(result.placements.length).toBeGreaterThan(0);
    for (const placement of result.placements) {
      expect(result.candidateResourceTypes.includes(placement.preferredResourceType)).toBe(true);
    }
  });

  it("returns an empty plan when no usable candidates remain after sentinel filtering", () => {
    const width = 4;
    const height = 4;
    const size = width * height;
    const result = runOpValidated(planResources, {
      width,
      height,
      noResourceSentinel: 7,
      runtimeCandidateResourceTypes: [7, -1, -2],
      landMask: new Uint8Array(size).fill(1),
      fertility: new Float32Array(size).fill(0.8),
      effectiveMoisture: new Float32Array(size).fill(0.6),
      surfaceTemperature: new Float32Array(size).fill(18),
      aridityIndex: new Float32Array(size).fill(0.4),
      riverClass: new Uint8Array(size),
      lakeMask: new Uint8Array(size),
    }, {
      strategy: "default",
      config: {
        candidateResourceTypes: [],
        densityPer100Tiles: 25,
        minSpacingTiles: 0,
        maxPlacementsPerResourceShare: 1,
      },
    });

    expect(result.candidateResourceTypes).toEqual([]);
    expect(result.targetCount).toBe(0);
    expect(result.plannedCount).toBe(0);
    expect(result.placements).toEqual([]);
  });

  it("plans floodplains respecting min/max", () => {
    const result = runOpValidated(planFloodplains, {}, { strategy: "default", config: {} });
    expect(result.minLength).toBe(4);
    expect(result.maxLength).toBe(10);
  });

  it("normalizes floodplains maxLength >= minLength", () => {
    const result = runOpValidated(planFloodplains, {}, {
      strategy: "default",
      config: { minLength: 10, maxLength: 4 },
    });
    expect(result.minLength).toBe(10);
    expect(result.maxLength).toBe(10);
  });

  it("merges start overrides", () => {
    const baseStarts = {
      playersLandmass1: 1,
      playersLandmass2: 1,
      startSectorRows: 2,
      startSectorCols: 2,
      startSectors: [1, 2],
    };

    const result = runOpValidated(planStarts, { baseStarts }, {
      strategy: "default",
      config: {
        overrides: {
          playersLandmass1: 3,
          startSectorRows: 3,
          startSectors: [5],
        },
      },
    });

    expect(result.playersLandmass1).toBe(3);
    expect(result.playersLandmass2).toBe(1);
    expect(result.startSectorRows).toBe(3);
    expect(result.startSectors).toEqual([5]);
  });
});
