import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";
import { COAST_TERRAIN, createExtendedMapContext, FLAT_TERRAIN } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { LakesStep } from "../../../../src/recipes/standard/stages/map-hydrology/steps/lakes/step.js";
import { artifacts as mapMorphologyArtifacts } from "../../../../src/recipes/standard/stages/map-morphology/artifacts/index.js";
import { PlotRiversStep } from "../../../../src/recipes/standard/stages/map-rivers/steps/plot-rivers/step.js";
import { buildTestDeps } from "../../../support/step-deps.js";

const { selectNavigableRiverTerrain } = hydrologyOpsPublic.ops;
/**
 * Runtime validation double.
 *
 * Civ7 terrain validation can disagree with a projected lake after the map
 * stage stamps it. This double dries one planned sink during river validation
 * so the test proves mismatch accounting remains diagnostic and downstream.
 */
class RuntimeLakeValidationAdapter extends MockAdapter {
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
    context.artifacts.set("artifact:morphology.mountains", {
      mountainMask: new Uint8Array(size),
      hillMask: new Uint8Array(size),
      foothillMask: new Uint8Array(size),
      roughLandMask: new Uint8Array(size),
      orogenyPotential: new Uint8Array(size),
      fracturePotential: new Uint8Array(size),
      roughnessPotential: new Uint8Array(size),
    });
    context.artifacts.set("artifact:hydrology.hydrography", {
      runoff: new Float32Array(size),
      discharge: new Float32Array(size),
      riverClass: new Uint8Array(size),
      flowDir: new Int32Array(size).fill(-1),
      sinkMask: sinkLakeMask,
      outletMask: new Uint8Array(size),
    });
    context.artifacts.set("artifact:hydrology.riverNetworkMetrics", {
      upstreamArea: new Int32Array(size),
      streamOrderProxy: new Uint8Array(size),
      mouthType: new Uint8Array(size),
      slopeClass: new Uint8Array(size),
      flowPermanenceProxy: new Uint8Array(size),
    });
    context.artifacts.set("artifact:hydrology.lakePlan", {
      width,
      height,
      lakeMask: sinkLakeMask,
      plannedLakeTileCount: 1,
      sinkLakeCount: 1,
    });
    context.artifacts.set(mapMorphologyArtifacts.coastClassification.id, {
      width,
      height,
      baseWaterClass: new Uint8Array(size),
      sourceCoastMask: new Uint8Array(size),
      waterClass: new Uint8Array(size),
      coastRingMask: new Uint8Array(size),
      promotedOceanToCoast: 0,
    });

    LakesStep.run(
      context as any,
      { projectionReadback: true },
      {} as any,
      buildTestDeps(LakesStep)
    );
    PlotRiversStep.run(
      context as any,
      {
        selectNavigableRiverTerrain: {
          strategy: "default",
          config: { endpointDischargePercentileMin: 0.94, targetMajorTileFraction: 0.28 },
        },
      },
      { selectNavigableRiverTerrain: selectNavigableRiverTerrain.run } as any,
      buildTestDeps(PlotRiversStep)
    );

    const projection = context.artifacts.get("artifact:map.rivers.engineProjectionRivers") as
      | { sinkMismatchCount?: number }
      | undefined;
    expect(typeof projection?.sinkMismatchCount).toBe("number");
    expect(projection?.sinkMismatchCount ?? 0).toBeGreaterThanOrEqual(1);
    expect(adapter.isWater(1, 1)).toBe(false);
  });
});
