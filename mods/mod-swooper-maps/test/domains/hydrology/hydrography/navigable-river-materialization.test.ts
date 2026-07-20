import { describe, expect, it } from "bun:test";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { HYDROLOGY_MOUTH_OCEAN } from "@mapgen/domain/hydrology/model/policy/river-network-metrics.js";
import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const { selectNavigableRiverTerrain } = hydrologyOpsPublic.ops;

describe("select navigable river terrain", () => {
  it("prefers the strongest major-discharge trunk when density only allows one chain", () => {
    const syntheticDimensions = { width: 8, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    const discharge = new Float32Array(size);
    const flowDir = new Int32Array(size).fill(-1);
    const mouthType = new Uint8Array(size).fill(HYDROLOGY_MOUTH_OCEAN);
    const lakeMask = new Uint8Array(size);
    const projectableLandMask = new Uint8Array(size).fill(1);

    for (let x = 0; x < 5; x++) {
      const index = x;
      riverClass[index] = RIVER_CLASS_MAJOR;
      discharge[index] = x + 1;
      flowDir[index] = x < 4 ? x + 1 : -1;
    }

    for (let x = 0; x < 3; x++) {
      const index = width + x;
      riverClass[index] = RIVER_CLASS_MAJOR;
      discharge[index] = 10 + x;
      flowDir[index] = x < 2 ? width + x + 1 : -1;
    }

    const result = runAdmittedOperationForTest(
      selectNavigableRiverTerrain,
      {
        width,
        height,
        riverClass,
        discharge,
        flowDir,
        mouthType,
        lakeMask,
        projectableLandMask,
      },
      {
        strategy: "default",
        config: { endpointDischargePercentileMin: 1, targetMajorTileFraction: 0.3 },
      }
    );

    expect(result.selectedTileCount).toBe(3);
    expect(result.selectedChainCount).toBe(1);
    expect(Array.from(result.selectedChainLengths)).toEqual([3]);
    expect(result.longestSelectedChainLength).toBe(3);
    expect(result.meanSelectedChainLength).toBe(3);
    expect(result.plannedMinorRiverTileCount).toBe(0);
    expect(result.plannedMajorRiverTileCount).toBe(8);
    expect(result.nonProjectableMajorTileCount).toBe(0);
    expect(result.unselectedEligibleMajorTileCount).toBe(5);
    expect(result.selectedEndpointDischargeFloor).toBe(12);
    expect(result.candidateEndpointCount).toBe(1);
    for (let x = 0; x < 5; x++) expect(result.riverMask[x]).toBe(0);
    for (let x = 0; x < 3; x++) expect(result.riverMask[width + x]).toBe(1);
  });

  it("fills the target budget from admitted endpoints", () => {
    const syntheticDimensions = { width: 2, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size).fill(RIVER_CLASS_MAJOR);
    const discharge = new Float32Array([90, 100, 70, 80, 50, 60]);
    const flowDir = new Int32Array([1, -1, 3, -1, 5, -1]);
    const mouthType = new Uint8Array(size).fill(HYDROLOGY_MOUTH_OCEAN);
    const lakeMask = new Uint8Array(size);
    const projectableLandMask = new Uint8Array(size).fill(1);

    const result = runAdmittedOperationForTest(
      selectNavigableRiverTerrain,
      {
        width,
        height,
        riverClass,
        discharge,
        flowDir,
        mouthType,
        lakeMask,
        projectableLandMask,
      },
      {
        strategy: "default",
        config: { endpointDischargePercentileMin: 0, targetMajorTileFraction: 0.7 },
      }
    );

    expect(result.selectedEndpointDischargeFloor).toBe(60);
    expect(result.candidateEndpointCount).toBe(3);
    expect(result.targetTileCount).toBe(4);
    expect(result.selectedChainCount).toBe(2);
    expect(Array.from(result.selectedChainLengths)).toEqual([2, 2]);
    expect(result.longestSelectedChainLength).toBe(2);
    expect(result.meanSelectedChainLength).toBe(2);
    expect(result.selectedTileCount).toBe(4);
    expect(result.nonProjectableMajorTileCount).toBe(0);
    expect(result.unselectedEligibleMajorTileCount).toBe(2);
    expect(Array.from(result.riverMask)).toEqual([1, 1, 1, 1, 0, 0]);
  });

  it("does not backfill endpoints below the discharge floor", () => {
    const syntheticDimensions = { width: 2, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size).fill(RIVER_CLASS_MAJOR);
    const discharge = new Float32Array([90, 100, 70, 80, 50, 60]);
    const flowDir = new Int32Array([1, -1, 3, -1, 5, -1]);
    const mouthType = new Uint8Array(size).fill(HYDROLOGY_MOUTH_OCEAN);
    const lakeMask = new Uint8Array(size);
    const projectableLandMask = new Uint8Array(size).fill(1);

    const result = runAdmittedOperationForTest(
      selectNavigableRiverTerrain,
      {
        width,
        height,
        riverClass,
        discharge,
        flowDir,
        mouthType,
        lakeMask,
        projectableLandMask,
      },
      {
        strategy: "default",
        config: { endpointDischargePercentileMin: 1, targetMajorTileFraction: 0.7 },
      }
    );

    expect(result.selectedEndpointDischargeFloor).toBe(100);
    expect(result.candidateEndpointCount).toBe(1);
    expect(result.targetTileCount).toBe(4);
    expect(result.selectedChainCount).toBe(1);
    expect(Array.from(result.selectedChainLengths)).toEqual([2]);
    expect(result.selectedTileCount).toBe(2);
    expect(result.unselectedEligibleMajorTileCount).toBe(4);
    expect(Array.from(result.riverMask)).toEqual([1, 1, 0, 0, 0, 0]);
  });

  it("does not promote minor rivers into navigable river terrain", () => {
    const syntheticDimensions = { width: 6, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    const discharge = new Float32Array(size);
    const flowDir = new Int32Array(size).fill(-1);
    const mouthType = new Uint8Array(size).fill(HYDROLOGY_MOUTH_OCEAN);
    const lakeMask = new Uint8Array(size);
    const projectableLandMask = new Uint8Array(size).fill(1);

    for (let x = 0; x < width; x++) {
      riverClass[x] = RIVER_CLASS_MINOR;
      discharge[x] = 100 + x;
      flowDir[x] = x < width - 1 ? x + 1 : -1;
    }

    const result = runAdmittedOperationForTest(
      selectNavigableRiverTerrain,
      {
        width,
        height,
        riverClass,
        discharge,
        flowDir,
        mouthType,
        lakeMask,
        projectableLandMask,
      },
      {
        strategy: "default",
        config: { endpointDischargePercentileMin: 0, targetMajorTileFraction: 1 },
      }
    );

    expect(result.plannedMinorRiverTileCount).toBe(6);
    expect(result.plannedMajorRiverTileCount).toBe(0);
    expect(result.eligibleTileCount).toBe(0);
    expect(result.selectedEndpointDischargeFloor).toBe(0);
    expect(Number.isFinite(result.selectedEndpointDischargeFloor)).toBe(true);
    expect(result.selectedTileCount).toBe(0);
    expect(Array.from(result.selectedChainLengths)).toEqual([]);
    expect(result.longestSelectedChainLength).toBe(0);
    expect(result.meanSelectedChainLength).toBe(0);
    expect(result.nonProjectableMajorTileCount).toBe(0);
    expect(result.unselectedEligibleMajorTileCount).toBe(0);
    expect([...result.riverMask]).toEqual(new Array(size).fill(0));
    for (let x = 0; x < width; x++) expect(result.plannedMinorRiverMask[x]).toBe(1);
  });

  it("continues Hydrology major trunks through nonprojectable lake gaps without stamping them", () => {
    const syntheticDimensions = { width: 7, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size).fill(RIVER_CLASS_MAJOR);
    const discharge = new Float32Array([10, 20, 30, 40, 50, 60, 70]);
    const flowDir = new Int32Array([1, 2, 3, 4, 5, 6, -1]);
    const mouthType = new Uint8Array(size).fill(HYDROLOGY_MOUTH_OCEAN);
    const lakeMask = new Uint8Array(size);
    lakeMask[4] = 1;
    const projectableLandMask = new Uint8Array(size).fill(1);
    projectableLandMask[4] = 0;

    const result = runAdmittedOperationForTest(
      selectNavigableRiverTerrain,
      {
        width,
        height,
        riverClass,
        discharge,
        flowDir,
        mouthType,
        lakeMask,
        projectableLandMask,
      },
      {
        strategy: "default",
        config: { endpointDischargePercentileMin: 1, targetMajorTileFraction: 1 },
      }
    );

    expect(result.candidateEndpointCount).toBe(1);
    expect(result.selectedChainCount).toBe(1);
    expect(Array.from(result.selectedChainLengths)).toEqual([6]);
    expect(result.selectedTileCount).toBe(6);
    expect(result.nonProjectableMajorTileCount).toBe(1);
    expect(Array.from(result.riverMask)).toEqual([1, 1, 1, 1, 0, 1, 1]);
  });

  it("does not continue visible selection through non-lake projection blockers", () => {
    const syntheticDimensions = { width: 7, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size).fill(RIVER_CLASS_MAJOR);
    const discharge = new Float32Array([10, 20, 30, 40, 50, 60, 70]);
    const flowDir = new Int32Array([1, 2, 3, 4, 5, 6, -1]);
    const mouthType = new Uint8Array(size).fill(HYDROLOGY_MOUTH_OCEAN);
    const lakeMask = new Uint8Array(size);
    const projectableLandMask = new Uint8Array(size).fill(1);
    projectableLandMask[4] = 0;

    const result = runAdmittedOperationForTest(
      selectNavigableRiverTerrain,
      {
        width,
        height,
        riverClass,
        discharge,
        flowDir,
        mouthType,
        lakeMask,
        projectableLandMask,
      },
      {
        strategy: "default",
        config: { endpointDischargePercentileMin: 1, targetMajorTileFraction: 1 },
      }
    );

    expect(result.candidateEndpointCount).toBe(1);
    expect(result.selectedChainCount).toBe(1);
    expect(Array.from(result.selectedChainLengths)).toEqual([2]);
    expect(result.selectedTileCount).toBe(2);
    expect(result.nonProjectableMajorTileCount).toBe(1);
    expect(Array.from(result.riverMask)).toEqual([0, 0, 0, 0, 0, 1, 1]);
  });

  it("does not seed navigable terrain from unresolved major endpoints", () => {
    const syntheticDimensions = { width: 4, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size).fill(RIVER_CLASS_MAJOR);
    const discharge = new Float32Array([10, 20, 30, 40]);
    const flowDir = new Int32Array([1, 2, 3, -1]);
    const mouthType = new Uint8Array(size);
    const lakeMask = new Uint8Array(size);
    const projectableLandMask = new Uint8Array(size).fill(1);

    const result = runAdmittedOperationForTest(
      selectNavigableRiverTerrain,
      {
        width,
        height,
        riverClass,
        discharge,
        flowDir,
        mouthType,
        lakeMask,
        projectableLandMask,
      },
      {
        strategy: "default",
        config: { endpointDischargePercentileMin: 0, targetMajorTileFraction: 1 },
      }
    );

    expect(result.candidateEndpointCount).toBe(0);
    expect(result.selectedEndpointDischargeFloor).toBe(0);
    expect(Number.isFinite(result.selectedEndpointDischargeFloor)).toBe(true);
    expect(result.selectedChainCount).toBe(0);
    expect(result.selectedTileCount).toBe(0);
    expect(Array.from(result.riverMask)).toEqual([0, 0, 0, 0]);
  });
});
