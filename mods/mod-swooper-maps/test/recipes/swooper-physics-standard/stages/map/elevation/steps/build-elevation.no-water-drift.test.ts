import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { BuildElevationStep } from "../../../../../../../src/recipes/standard/stages/map-elevation/steps/build-elevation/step.js";
import { artifactModules as mapHydrologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/map-hydrology/artifacts/index.js";
import { artifactModules as morphologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";

const SYNTHETIC_BOUNDED_DRIFT_DIMENSIONS = { width: 10, height: 10 } as const;
const SYNTHETIC_EXCESSIVE_DRIFT_DIMENSIONS = { width: 4, height: 3 } as const;
const SYNTHETIC_READBACK_DIMENSIONS = { width: 3, height: 3 } as const;

function publishBuildElevationInputs(
  context: ReturnType<typeof createMapContext>,
  width: number,
  height: number,
  landMask: Uint8Array,
  lakeMask: Uint8Array,
  sinkMismatchCount: number
): void {
  const size = width * height;
  publishTestArtifact(context, morphologyArtifactModules.topography, {
    elevation: new Int16Array(size),
    seaLevel: 0,
    landMask,
    bathymetry: new Int16Array(size),
  });
  publishTestArtifact(context, mapHydrologyArtifactModules.engineProjectionLakes, {
    width,
    height,
    lakeMask,
    plannedLakeMask: lakeMask.slice(),
    engineWaterMask: lakeMask.slice(),
    engineLakeMask: lakeMask.slice(),
    engineTerrain: new Int32Array(size),
    engineAreaId: new Int32Array(size),
    engineElevation: new Int16Array(size),
    nonWaterMask: new Uint8Array(size),
    nonLakeMask: new Uint8Array(size),
    terrainMismatchMask: new Uint8Array(size),
    sinkMismatchCount,
    nonLakeTileCount: 0,
    terrainMismatchTileCount: 0,
    morphologyProtectedLakeTileCount: 0,
  });
}

function executeBuildElevation(
  context: ReturnType<typeof createMapContext>,
  width: number,
  height: number,
  landMask: Uint8Array,
  lakeMask: Uint8Array,
  sinkMismatchCount: number
): void {
  withMapContextExecutionForTest(context, () => {
    publishBuildElevationInputs(context, width, height, landMask, lakeMask, sinkMismatchCount);
    BuildElevationStep.run(
      context as any,
      {},
      {} as any,
      buildStepTestDependencies(BuildElevationStep)
    );
  });
}

class DriftAfterBuildElevationAdapter extends MockAdapter {
  buildElevationCalls = 0;

  override buildElevation(): void {
    this.buildElevationCalls += 1;
    // Simulate engine drift: cached water tables say "water" even though terrain remains land.
    this.setWater(0, 0, true);
  }
}

class ExcessiveDriftAfterBuildElevationAdapter extends MockAdapter {
  buildElevationCalls = 0;

  override buildElevation(): void {
    this.buildElevationCalls += 1;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setWater(x, y, true);
      }
    }
  }
}

class ReliefAfterBuildElevationAdapter extends MockAdapter {
  buildElevationCalls = 0;
  stampContinentsCalls = 0;
  storeWaterDataCalls = 0;

  override buildElevation(): void {
    this.buildElevationCalls += 1;
    // Simulate engine terrain differentiation without any water drift.
    this.setTerrainType(1, 1, this.getTerrainTypeIndex("TERRAIN_HILL"));
  }

  override stampContinents(): void {
    this.stampContinentsCalls += 1;
  }

  override storeWaterData(): void {
    this.storeWaterDataCalls += 1;
  }
}

describe("map-elevation/build-elevation", () => {
  it("allows bounded buildElevation land/water drift and logs the policy report", () => {
    const { width, height } = SYNTHETIC_BOUNDED_DRIFT_DIMENSIONS;
    const seed = 1234;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: SYNTHETIC_BOUNDED_DRIFT_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new DriftAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const { TERRAIN_FLAT: flatTerrain, TERRAIN_OCEAN: oceanTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;

    const size = width * height;
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    // Seed the plotted terrain snapshot: flat land where landMask=1, ocean otherwise.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        adapter.setTerrainType(x, y, landMask[idx] === 1 ? flatTerrain : oceanTerrain);
        adapter.setWater(x, y, landMask[idx] !== 1);
      }
    }

    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    try {
      executeBuildElevation(context, width, height, landMask, new Uint8Array(size), 0);
    } finally {
      console.log = originalLog;
    }

    expect(adapter.buildElevationCalls).toBe(1);
    expect(logs.some((line) => line.includes("WATER_DRIFT_POLICY_V1"))).toBe(true);
    expect(logs.some((line) => line.includes('"mismatchCount":1'))).toBe(true);
    expect(logs.some((line) => line.includes('"withinPolicy":true'))).toBe(true);
  });

  it("fails when buildElevation drift exceeds the policy budget", () => {
    const { width, height } = SYNTHETIC_EXCESSIVE_DRIFT_DIMENSIONS;
    const seed = 1234;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: SYNTHETIC_EXCESSIVE_DRIFT_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new ExcessiveDriftAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const flatTerrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, flatTerrain);
        adapter.setWater(x, y, false);
      }
    }

    const originalLog = console.log;
    console.log = () => {};
    try {
      expect(() =>
        executeBuildElevation(
          context,
          width,
          height,
          new Uint8Array(width * height).fill(1),
          new Uint8Array(width * height),
          0
        )
      ).toThrow(/map-elevation\/build-elevation.*land\/water drift .*exceeds policy max/);
    } finally {
      console.log = originalLog;
    }

    expect(adapter.buildElevationCalls).toBe(1);
  });

  it("keeps post-buildElevation terrain when no water drift is detected", () => {
    const { width, height } = SYNTHETIC_READBACK_DIMENSIONS;
    const seed = 4321;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: SYNTHETIC_READBACK_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const { TERRAIN_FLAT: flatTerrain, TERRAIN_HILL: hillTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, flatTerrain);
      }
    }
    executeBuildElevation(
      context,
      width,
      height,
      new Uint8Array(width * height).fill(1),
      new Uint8Array(width * height),
      0
    );

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.getTerrainType(1, 1)).toBe(hillTerrain);
    expect(adapter.stampContinentsCalls).toBe(0);
    expect(adapter.storeWaterDataCalls).toBe(0);
  });

  it("treats engine-accepted lakes as expected water during elevation readback", () => {
    const { width, height } = SYNTHETIC_READBACK_DIMENSIONS;
    const seed = 5678;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: SYNTHETIC_READBACK_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const { TERRAIN_COAST: coastTerrain, TERRAIN_FLAT: flatTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    const lakeMask = new Uint8Array(width * height);
    lakeMask[0] = 1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        adapter.setTerrainType(x, y, lakeMask[idx] === 1 ? coastTerrain : flatTerrain);
        adapter.setWater(x, y, lakeMask[idx] === 1);
      }
    }
    executeBuildElevation(
      context,
      width,
      height,
      new Uint8Array(width * height).fill(1),
      lakeMask,
      0
    );

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.isWater(0, 0)).toBe(true);
  });

  it("does not turn rejected lake intent into expected engine water", () => {
    const { width, height } = SYNTHETIC_READBACK_DIMENSIONS;
    const seed = 6789;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: SYNTHETIC_READBACK_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const flatTerrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, flatTerrain);
        adapter.setWater(x, y, false);
      }
    }
    executeBuildElevation(
      context,
      width,
      height,
      new Uint8Array(width * height).fill(1),
      new Uint8Array(width * height),
      1
    );

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.isWater(0, 0)).toBe(false);
  });
});
