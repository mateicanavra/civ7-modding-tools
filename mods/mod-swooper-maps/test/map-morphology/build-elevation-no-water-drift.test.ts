import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { FLAT_TERRAIN, HILL_TERRAIN, OCEAN_TERRAIN } from "@swooper/mapgen-core";

import buildElevation from "../../src/recipes/standard/stages/map-morphology/steps/buildElevation.js";
import { buildTestDeps } from "../support/step-deps.js";

class DriftAfterBuildElevationAdapter extends MockAdapter {
  buildElevationCalls = 0;
  stampContinentsCalls = 0;
  storeWaterDataCalls = 0;

  private recomputeWaterMaskFromTerrain(): void {
    const coast = this.getTerrainTypeIndex("TERRAIN_COAST");
    const ocean = this.getTerrainTypeIndex("TERRAIN_OCEAN");
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = this.getTerrainType(x, y) | 0;
        this.setWater(x, y, t === coast || t === ocean);
      }
    }
  }

  override buildElevation(): void {
    this.buildElevationCalls += 1;
    // Simulate engine drift: cached water tables say "water" even though terrain remains land.
    this.setWater(0, 0, true);
  }

  override stampContinents(): void {
    this.stampContinentsCalls += 1;
    this.recomputeWaterMaskFromTerrain();
  }

  override storeWaterData(): void {
    this.storeWaterDataCalls += 1;
    this.recomputeWaterMaskFromTerrain();
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

describe("map-morphology/build-elevation", () => {
  it("restores plotted terrain snapshot and syncs water caches (no landMask drift)", () => {
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
      }
    }

    context.artifacts.set("artifact:morphology.topography", { landMask });

    buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation));

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.stampContinentsCalls).toBeGreaterThanOrEqual(1);
    expect(adapter.storeWaterDataCalls).toBeGreaterThanOrEqual(1);

    // The drifted cached water bit must be corrected back to land.
    expect(adapter.isWater(0, 0)).toBe(false);
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

    buildElevation.run(context as any, {}, {} as any, buildTestDeps(buildElevation));

    expect(adapter.buildElevationCalls).toBe(1);
    expect(adapter.getTerrainType(1, 1)).toBe(HILL_TERRAIN);
    expect(adapter.stampContinentsCalls).toBe(0);
    expect(adapter.storeWaterDataCalls).toBe(0);
  });
});
