import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { COAST_TERRAIN, FLAT_TERRAIN, createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { defaultStrategy as accumulateDischarge } from "../../src/domain/hydrology/ops/accumulate-discharge/strategies/default.js";
import planLakesOp from "../../src/domain/hydrology/ops/plan-lakes/index.js";
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
  it("keeps planned lakes fully water-filled after plot-rivers validation under default lake planning", () => {
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

    const lakePlan = planLakesOp.run(
      {
        width,
        height,
        landMask,
        flowDir,
        sinkMask: discharge.sinkMask,
      },
      planLakesOp.defaultConfig
    );

    expect(lakePlan.lakeMask[sinkIdx]).toBe(1);
    expect(lakePlan.lakeMask[upstreamIdx]).toBe(0);
    expect(lakePlan.plannedLakeTileCount).toBe(lakePlan.sinkLakeCount);

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
    context.artifacts.set("artifact:hydrology.lakePlan", lakePlan);

    lakes.run(context as any, {}, {} as any, buildTestDeps(lakes));
    plotRivers.run(context as any, { minLength: 5, maxLength: 15 }, {} as any, buildTestDeps(plotRivers));

    let plannedDryCount = 0;
    for (let i = 0; i < size; i++) {
      if (lakePlan.lakeMask[i] !== 1) continue;
      const x = i % width;
      const y = (i / width) | 0;
      if (!adapter.isWater(x, y)) plannedDryCount += 1;
    }

    expect(plannedDryCount).toBe(0);
    expect(adapter.isWater(2, 1)).toBe(true);
    expect(adapter.isWater(1, 1)).toBe(false);
  });
});
