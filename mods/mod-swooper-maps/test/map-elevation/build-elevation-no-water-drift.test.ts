import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import {
  COAST_TERRAIN,
  FLAT_TERRAIN,
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
  OCEAN_TERRAIN,
  createExtendedMapContext,
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

function setBuildElevationArtifacts(
  context: { artifacts: Map<string, unknown> },
  width: number,
  height: number,
  topographyLandMask: Uint8Array,
  acceptedLakeMask = new Uint8Array(width * height),
  hydrologyLandMask?: Uint8Array,
  morphology?: {
    elevation?: Int16Array;
    seaLevel?: number;
    mountainMask?: Uint8Array;
    mountainRegionMask?: Uint8Array;
    hillMask?: Uint8Array;
  }
): void {
  const size = width * height;
  context.artifacts.set("artifact:morphology.topography", {
    elevation: morphology?.elevation ?? new Int16Array(size),
    seaLevel: morphology?.seaLevel ?? 0,
    landMask: topographyLandMask,
    bathymetry: new Int16Array(size),
  });
  context.artifacts.set("artifact:morphology.mountains", {
    mountainMask: morphology?.mountainMask ?? new Uint8Array(size),
    mountainRegionMask: morphology?.mountainRegionMask ?? new Uint8Array(size),
    mountainRegionIdByTile: new Int32Array(size).fill(-1),
    hillMask: morphology?.hillMask ?? new Uint8Array(size),
    foothillMask: new Uint8Array(size),
    roughLandMask: new Uint8Array(size),
    orogenyPotential: new Uint8Array(size),
    fracturePotential: new Uint8Array(size),
    roughnessPotential: new Uint8Array(size),
  });
  context.artifacts.set("artifact:map.hydrology.engineProjectionLakes", {
    width,
    height,
    lakeMask: acceptedLakeMask,
    plannedLakeMask: acceptedLakeMask,
    engineWaterMask: new Uint8Array(size),
    engineLakeMask: new Uint8Array(size),
    engineTerrain: new Int32Array(size),
    engineAreaId: new Int32Array(size),
    engineElevation: new Int16Array(size),
    nonWaterMask: new Uint8Array(size),
    nonLakeMask: new Uint8Array(size),
    terrainMismatchMask: new Uint8Array(size),
    sinkMismatchCount: 0,
    nonLakeTileCount: 0,
    terrainMismatchTileCount: 0,
  });
  context.artifacts.set("artifact:map.hydrologyLakesEngineTerrainSnapshot", {
    stage: "map-hydrology/lakes",
    width,
    height,
    landMask: hydrologyLandMask ?? topographyLandMask,
    terrain: new Uint8Array(size),
    elevation: new Int16Array(size),
  });
}

describe("map-elevation/build-elevation", () => {
  it("fails when the pre-elevation engine surface already differs from the projected land/water surface", () => {
    const width = 4;
    const height = 3;
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
    adapter.setWater(0, 0, true);

    setBuildElevationArtifacts(context, width, height, landMask);

    expect(() =>
      buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation))
    ).toThrow(/map-elevation\/build-elevation:pre.*expected land/);

    expect(adapter.buildElevationCalls).toBe(0);
  });

  it("records post-buildElevation water drift without aborting generation", () => {
    const width = 4;
    const height = 3;
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

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        adapter.setTerrainType(x, y, landMask[idx] === 1 ? FLAT_TERRAIN : OCEAN_TERRAIN);
        adapter.setWater(x, y, landMask[idx] !== 1);
      }
    }

    setBuildElevationArtifacts(context, width, height, landMask);

    buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation));

    expect(adapter.buildElevationCalls).toBe(1);
    const snapshot = context.artifacts.get("artifact:map.elevationEngineTerrainSnapshot") as {
      landMask: Uint8Array;
    };
    expect(snapshot.landMask[0]).toBe(0);
  });

  it("preprojects low polar-edge mountain saddle compliance water before buildElevation", () => {
    const width = 5;
    const height = 4;
    const seed = 1357;
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
    const size = width * height;
    const index = (x: number, y: number) => y * width + x;
    const landMask = new Uint8Array(size).fill(1);
    const elevation = new Int16Array(size).fill(10);
    const mountainMask = new Uint8Array(size);
    const mountainRegionMask = new Uint8Array(size);
    const hillMask = new Uint8Array(size);

    mountainMask[index(1, 0)] = 1;
    mountainMask[index(3, 0)] = 1;
    mountainRegionMask[index(1, 0)] = 1;
    mountainRegionMask[index(2, 0)] = 1;
    mountainRegionMask[index(3, 0)] = 1;
    hillMask[index(2, 0)] = 1;
    elevation[index(2, 0)] = -4;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = index(x, y);
        const terrain =
          mountainMask[idx] === 1 ? MOUNTAIN_TERRAIN : hillMask[idx] === 1 ? HILL_TERRAIN : FLAT_TERRAIN;
        adapter.setTerrainType(x, y, terrain);
        adapter.setWater(x, y, false);
      }
    }

    setBuildElevationArtifacts(context, width, height, landMask, new Uint8Array(size), landMask, {
      elevation,
      seaLevel: 0,
      mountainMask,
      mountainRegionMask,
      hillMask,
    });

    buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation));

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.getTerrainType(2, 0)).toBe(COAST_TERRAIN);
    expect(adapter.isWater(2, 0)).toBe(true);
    const snapshot = context.artifacts.get("artifact:map.elevationEngineTerrainSnapshot") as {
      landMask: Uint8Array;
    };
    expect(snapshot.landMask[index(2, 0)]).toBe(0);
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
    setBuildElevationArtifacts(context, width, height, new Uint8Array(width * height).fill(1));

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
        adapter.setTerrainType(x, y, lakeMask[idx] === 1 ? adapter.getTerrainTypeIndex("TERRAIN_COAST") : FLAT_TERRAIN);
        adapter.setWater(x, y, lakeMask[idx] === 1);
      }
    }
    const topographyLandMask = new Uint8Array(width * height).fill(1);
    const expectedLandMask = new Uint8Array(topographyLandMask);
    expectedLandMask[0] = 0;
    setBuildElevationArtifacts(context, width, height, topographyLandMask, lakeMask, expectedLandMask);

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
    setBuildElevationArtifacts(context, width, height, new Uint8Array(width * height).fill(1));

    buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation));

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.isWater(0, 0)).toBe(false);
  });
});
