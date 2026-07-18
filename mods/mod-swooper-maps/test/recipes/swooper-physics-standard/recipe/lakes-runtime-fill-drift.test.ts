import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { resolveStandardProjectionTerrainTypes } from "../../../../src/recipes/standard/projection-policies/standardProjectionEngineTypes.js";
import { artifactModules as hydrologyArtifactModules } from "../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { LakesStep } from "../../../../src/recipes/standard/stages/map-hydrology/steps/lakes/step.js";
import { artifactModules as mapMorphologyArtifactModules } from "../../../../src/recipes/standard/stages/map-morphology/artifacts/index.js";
import { PlotRiversStep } from "../../../../src/recipes/standard/stages/map-rivers/steps/plot-rivers/step.js";
import { artifactModules as morphologyArtifactModules } from "../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { createRiverNetworkBenchmarkSummaryFixture } from "../../../support/river-network-metrics-fixture.js";
import {
  buildTestDeps,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "../../../support/step-deps.js";

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
    if (this.getTerrainType(1, 1) === this.getTerrainTypeIndex("TERRAIN_COAST")) {
      this.setTerrainType(1, 1, this.getTerrainTypeIndex("TERRAIN_FLAT"));
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
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new RuntimeLakeValidationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const flatTerrain = resolveStandardProjectionTerrainTypes(adapter).flat;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, flatTerrain);
      }
    }
    const sinkLakeMask = new Uint8Array(size);
    sinkLakeMask[sinkIdx] = 1;

    withMapContextExecutionForTest(context, () => {
      publishTestArtifact(context, morphologyArtifactModules.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size).fill(1),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(context, morphologyArtifactModules.mountains, {
        mountainMask: new Uint8Array(size),
        mountainRegionMask: new Uint8Array(size),
        mountainRegionIdByTile: new Int32Array(size).fill(-1),
        hillMask: new Uint8Array(size),
        foothillMask: new Uint8Array(size),
        roughLandMask: new Uint8Array(size),
        orogenyPotential: new Uint8Array(size),
        fracturePotential: new Uint8Array(size),
        roughnessPotential: new Uint8Array(size),
      });
      publishTestArtifact(context, hydrologyArtifactModules.hydrography, {
        runoff: new Float32Array(size),
        discharge: new Float32Array(size),
        riverClass: new Uint8Array(size),
        flowDir: new Int32Array(size).fill(-1),
        sinkMask: sinkLakeMask,
        outletMask: new Uint8Array(size),
      });
      publishTestArtifact(context, hydrologyArtifactModules.riverNetworkMetrics, {
        upstreamArea: new Int32Array(size),
        streamOrderProxy: new Uint8Array(size),
        mouthType: new Uint8Array(size),
        slopeClass: new Uint8Array(size),
        flowPermanenceProxy: new Uint8Array(size),
        benchmarkSummary: createRiverNetworkBenchmarkSummaryFixture({
          landTileCount: size,
          lakeTileCount: 1,
          lakeLandShare: 1 / size,
          dryFlowTileCount: size,
          unresolvedMouthTileCount: size,
          unassignedBasinLandTileCount: size,
        }),
      });
      publishTestArtifact(context, hydrologyArtifactModules.lakePlan, {
        width,
        height,
        lakeMask: sinkLakeMask,
        plannedLakeTileCount: 1,
        sinkLakeCount: 1,
      });
      publishTestArtifact(context, mapMorphologyArtifactModules.coastClassification, {
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
    });

    const projection = context.artifacts.get("artifact:map.rivers.engineProjectionRivers") as
      | { sinkMismatchCount?: number }
      | undefined;
    expect(typeof projection?.sinkMismatchCount).toBe("number");
    expect(projection?.sinkMismatchCount ?? 0).toBeGreaterThanOrEqual(1);
    expect(adapter.isWater(1, 1)).toBe(false);
  });
});
