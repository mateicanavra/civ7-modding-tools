import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import {
  createExtendedMapContext,
  FLAT_TERRAIN,
  HILL_TERRAIN,
  OCEAN_TERRAIN,
} from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import buildElevation from "../../src/recipes/standard/stages/map-elevation/steps/buildElevation.js";
import { buildTestDeps } from "../support/step-deps.js";

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
    this.setTerrainType(1, 1, HILL_TERRAIN);
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
    const width = 10;
    const height = 10;
    const seed = 1234;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = new DriftAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    const size = width * height;
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    // Seed the plotted terrain snapshot: flat land where landMask=1, ocean otherwise.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        adapter.setTerrainType(x, y, landMask[idx] === 1 ? FLAT_TERRAIN : OCEAN_TERRAIN);
        adapter.setWater(x, y, landMask[idx] !== 1);
      }
    }

    context.artifacts.set("artifact:morphology.topography", { landMask });
    context.artifacts.set("artifact:map.hydrology.engineProjectionLakes", {
      width,
      height,
      lakeMask: new Uint8Array(size),
      sinkMismatchCount: 0,
    });

    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    try {
      buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation));
    } finally {
      console.log = originalLog;
    }

    expect(adapter.buildElevationCalls).toBe(1);
    expect(logs.some((line) => line.includes("WATER_DRIFT_POLICY_V1"))).toBe(true);
    expect(logs.some((line) => line.includes('"mismatchCount":1'))).toBe(true);
    expect(logs.some((line) => line.includes('"withinPolicy":true'))).toBe(true);
  });

  it("fails when buildElevation drift exceeds the policy budget", () => {
    const width = 4;
    const height = 3;
    const seed = 1234;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = new ExcessiveDriftAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, FLAT_TERRAIN);
        adapter.setWater(x, y, false);
      }
    }

    context.artifacts.set("artifact:morphology.topography", {
      landMask: new Uint8Array(width * height).fill(1),
    });
    context.artifacts.set("artifact:map.hydrology.engineProjectionLakes", {
      width,
      height,
      lakeMask: new Uint8Array(width * height),
      sinkMismatchCount: 0,
    });

    const originalLog = console.log;
    console.log = () => {};
    try {
      expect(() =>
        buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation))
      ).toThrow(/map-elevation\/build-elevation.*land\/water drift .*exceeds policy max/);
    } finally {
      console.log = originalLog;
    }

    expect(adapter.buildElevationCalls).toBe(1);
  });

  it("keeps post-buildElevation terrain when no water drift is detected", () => {
    const width = 3;
    const height = 3;
    const seed = 4321;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, FLAT_TERRAIN);
      }
    }
    context.artifacts.set("artifact:morphology.topography", {
      landMask: new Uint8Array(width * height).fill(1),
    });
    context.artifacts.set("artifact:map.hydrology.engineProjectionLakes", {
      width,
      height,
      lakeMask: new Uint8Array(width * height),
      sinkMismatchCount: 0,
    });

    buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation));

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.getTerrainType(1, 1)).toBe(HILL_TERRAIN);
    expect(adapter.stampContinentsCalls).toBe(0);
    expect(adapter.storeWaterDataCalls).toBe(0);
  });

  it("treats engine-accepted lakes as expected water during elevation readback", () => {
    const width = 3;
    const height = 3;
    const seed = 5678;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[0] = 1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        adapter.setTerrainType(
          x,
          y,
          lakeMask[idx] === 1 ? adapter.getTerrainTypeIndex("TERRAIN_COAST") : FLAT_TERRAIN
        );
        adapter.setWater(x, y, lakeMask[idx] === 1);
      }
    }
    context.artifacts.set("artifact:morphology.topography", {
      landMask: new Uint8Array(width * height).fill(1),
    });
    context.artifacts.set("artifact:map.hydrology.engineProjectionLakes", {
      width,
      height,
      lakeMask,
      sinkMismatchCount: 0,
    });

    buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation));

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.isWater(0, 0)).toBe(true);
  });

  it("does not turn rejected lake intent into expected engine water", () => {
    const width = 3;
    const height = 3;
    const seed = 6789;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, FLAT_TERRAIN);
        adapter.setWater(x, y, false);
      }
    }
    context.artifacts.set("artifact:morphology.topography", {
      landMask: new Uint8Array(width * height).fill(1),
    });
    context.artifacts.set("artifact:map.hydrology.engineProjectionLakes", {
      width,
      height,
      lakeMask: new Uint8Array(width * height),
      sinkMismatchCount: 1,
    });

    buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation));

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.isWater(0, 0)).toBe(false);
  });
});
