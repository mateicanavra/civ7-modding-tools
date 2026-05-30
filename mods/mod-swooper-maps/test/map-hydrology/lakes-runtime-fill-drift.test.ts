import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { COAST_TERRAIN, FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import lakes from "../../src/recipes/standard/stages/map-hydrology/steps/lakes.js";
import plotRivers from "../../src/recipes/standard/stages/map-hydrology/steps/plotRivers.js";
import { buildTestDeps } from "../support/step-deps.js";

/**
 * Runtime validation double.
 *
 * Civ7 terrain validation can disagree with a projected lake after the map
 * stage stamps it. This double dries one planned sink during river validation
 * so the test proves mismatch accounting remains diagnostic and downstream.
 */
class RuntimeLakeValidationAdapter extends MockAdapter {
  override modelRivers(): void {
    // Keep this scenario focused on lake projection/validation behavior.
  }

  override validateAndFixTerrain(): void {
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
    const sinkIdx = 1 + width;
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
    const sinkLakeMask = new Uint8Array(size);
    sinkLakeMask[sinkIdx] = 1;

    context.artifacts.set("artifact:morphology.topography", {
      elevation: new Int16Array(size),
      seaLevel: 0,
      landMask: new Uint8Array(size).fill(1),
      bathymetry: new Int16Array(size),
    });
    context.artifacts.set("artifact:hydrology.hydrography", {
      runoff: new Float32Array(size),
      discharge: new Float32Array(size),
      riverClass: new Uint8Array(size),
      flowDir: new Int32Array(size).fill(-1),
      sinkMask: sinkLakeMask,
      outletMask: new Uint8Array(size),
    });
    context.artifacts.set("artifact:hydrology.lakePlan", {
      width,
      height,
      lakeMask: sinkLakeMask,
      plannedLakeTileCount: 1,
      sinkLakeCount: 1,
    });

    lakes.run(context as any, { projectionReadback: true }, {} as any, buildTestDeps(lakes));
    plotRivers.run(
      context as any,
      { minLength: 5, maxLength: 15 },
      {} as any,
      buildTestDeps(plotRivers)
    );

    const projection = context.artifacts.get("artifact:hydrology.engineProjectionRivers") as
      | { sinkMismatchCount?: number }
      | undefined;
    expect(typeof projection?.sinkMismatchCount).toBe("number");
    expect(projection?.sinkMismatchCount ?? 0).toBeGreaterThanOrEqual(1);
    expect(adapter.isWater(1, 1)).toBe(false);
  });
});
