import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { COAST_TERRAIN, FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { defaultStrategy as accumulateDischarge } from "../../src/domain/hydrology/ops/accumulate-discharge/strategies/default.js";
import lakes from "../../src/recipes/standard/stages/map-hydrology/steps/lakes.js";
import plotRivers from "../../src/recipes/standard/stages/map-hydrology/steps/plotRivers.js";
import { buildTestDeps } from "../support/step-deps.js";

class RuntimeLakeValidationAdapter extends MockAdapter {
  override modelRivers(): void {
    // Keep this scenario focused on lake projection/validation behavior.
  }

  override validateAndFixTerrain(): void {
    // Simulate runtime validation removing an over-placed non-sink lake tile.
    if (this.getTerrainType(1, 1) === COAST_TERRAIN) {
      this.setTerrainType(1, 1, FLAT_TERRAIN);
    }
  }
}

describe("map-hydrology/lakes runtime fill drift", () => {
  it("captures sink mismatch diagnostics when runtime validation dries a sink candidate", () => {
    const width = 4;
    const height = 4;
    const size = width * height;
    const seed = 2468;
    const sinkIdx = 6;
    const upstreamIdx = 5;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      LakeGenerationFrequency: 5,
    };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = new RuntimeLakeValidationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
      defaultTerrainType: FLAT_TERRAIN,
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    const landMask = new Uint8Array(size).fill(1);
    const flowDir = new Int32Array(size).fill(sinkIdx);
    flowDir[sinkIdx] = -1;

    const discharge = accumulateDischarge.run(
      {
        width,
        height,
        landMask,
        flowDir,
        rainfall: new Uint8Array(size).fill(100),
        humidity: new Uint8Array(size).fill(100),
      },
      {
        runoffScale: 1,
        infiltrationFraction: 0.15,
        humidityDampening: 0.25,
        minRunoff: 0,
      }
    );

    const sinkLakeMask = new Uint8Array(size);
    sinkLakeMask[sinkIdx] = 1;

    expect(sinkLakeMask[sinkIdx]).toBe(1);
    expect(sinkLakeMask[upstreamIdx]).toBe(0);

    context.artifacts.set("artifact:morphology.topography", {
      elevation: new Int16Array(size),
      seaLevel: 0,
      landMask,
      bathymetry: new Int16Array(size),
    });
    context.artifacts.set("artifact:hydrology.hydrography", {
      runoff: discharge.runoff,
      discharge: discharge.discharge,
      riverClass: new Uint8Array(size),
      sinkMask: discharge.sinkMask,
      outletMask: discharge.outletMask,
    });

    lakes.run(context as any, {}, {} as any, buildTestDeps(lakes));
    plotRivers.run(context as any, { minLength: 5, maxLength: 15 }, {} as any, buildTestDeps(plotRivers));

    const projection = context.artifacts.get("artifact:hydrology.engineProjectionRivers") as
      | { sinkMismatchCount?: number }
      | undefined;
    expect(typeof projection?.sinkMismatchCount).toBe("number");
    expect((projection?.sinkMismatchCount ?? 0)).toBeGreaterThanOrEqual(1);
    expect(adapter.isWater(1, 1)).toBe(false);
  });
});
