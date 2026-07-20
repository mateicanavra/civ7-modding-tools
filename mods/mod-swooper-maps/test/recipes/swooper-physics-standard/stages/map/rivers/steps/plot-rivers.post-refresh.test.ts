import { describe, expect, it } from "bun:test";

import { MockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0, RIVER_TYPE_NAVIGABLE } from "@civ7/map-policy";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "@mapgen/domain/hydrology/model/policy/river-class.js";
import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifactModules as hydrologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { LakesStep } from "../../../../../../../src/recipes/standard/stages/map-hydrology/steps/lakes/step.js";
import { artifactModules as mapMorphologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/map-morphology/artifacts/index.js";
import { artifacts as mapRiversArtifacts } from "../../../../../../../src/recipes/standard/stages/map-rivers/artifacts/index.js";
import { PlotRiversStep } from "../../../../../../../src/recipes/standard/stages/map-rivers/steps/plot-rivers/step.js";
import { artifactModules as morphologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { createRiverNetworkBenchmarkSummaryFixture } from "../fixtures/river-network-metrics.js";

const { selectNavigableRiverTerrain } = hydrologyOpsPublic.ops;

class RiverCacheRefreshAdapter extends MockAdapter {
  private cachedWater: Uint8Array;
  readonly callOrder: string[] = [];

  constructor(config: ConstructorParameters<typeof MockAdapter>[0]) {
    super(config);
    this.cachedWater = new Uint8Array(Math.max(0, this.width * this.height));
  }

  private idx2(x: number, y: number): number {
    return y * this.width + x;
  }

  private refreshCachedWaterFromTerrain(): void {
    const coast = this.getTerrainTypeIndex("TERRAIN_COAST");
    const ocean = this.getTerrainTypeIndex("TERRAIN_OCEAN");
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = this.getTerrainType(x, y) | 0;
        this.cachedWater[this.idx2(x, y)] = t === coast || t === ocean ? 1 : 0;
      }
    }
  }

  override isWater(x: number, y: number): boolean {
    return this.cachedWater[this.idx2(x, y)] === 1;
  }

  override validateAndFixTerrain(): void {
    this.callOrder.push("validateAndFixTerrain");
  }

  override modelRivers(minLength: number, maxLength: number, navigableTerrain: number): void {
    this.callOrder.push("modelRivers");
    super.modelRivers(minLength, maxLength, navigableTerrain);
  }

  override defineNamedRivers(): void {
    this.callOrder.push("defineNamedRivers");
  }

  override recalculateAreas(): void {
    this.callOrder.push("recalculateAreas");
  }

  override storeWaterData(): void {
    this.callOrder.push("storeWaterData");
    this.refreshCachedWaterFromTerrain();
  }
}

/** Simulates Civ7 drying one projected lake while validating terrain before river readback. */
class RuntimeLakeValidationAdapter extends MockAdapter {
  override validateAndFixTerrain(): void {
    if (this.getTerrainType(1, 1) === this.getTerrainTypeIndex("TERRAIN_COAST")) {
      this.setTerrainType(1, 1, this.getTerrainTypeIndex("TERRAIN_FLAT"));
    }
  }
}

describe("map-rivers/plot-rivers", () => {
  it("stamps MapGen-projected navigable rivers and refreshes downstream caches", () => {
    expect(mapRiversArtifacts.projectedNavigableRivers.id).toBe(
      "artifact:map.rivers.projectedNavigableRivers"
    );
    expect(mapRiversArtifacts.engineProjectionRivers.id).toBe(
      "artifact:map.rivers.engineProjectionRivers"
    );

    const syntheticDimensions = { width: 5, height: 4 } as const;
    const { width, height } = syntheticDimensions;
    const seed = 9876;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
    };
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: syntheticDimensions,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new RiverCacheRefreshAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({ setup, adapter });
    const { TERRAIN_FLAT: flatTerrain, TERRAIN_NAVIGABLE_RIVER: navigableRiverTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, flatTerrain);
      }
    }

    const size = width * height;
    const riverTileCount = width * 2;
    const discharge = new Float32Array(size);
    const riverClass = new Uint8Array(size);
    const flowDir = new Int32Array(size).fill(-1);
    for (let x = 0; x < width; x++) {
      const index = x;
      discharge[index] = x + 1;
      riverClass[index] = RIVER_CLASS_MAJOR;
      flowDir[index] = x < width - 1 ? x + 1 : -1;
    }
    for (let x = 0; x < width; x++) {
      const index = width + x;
      discharge[index] = 100 + x;
      riverClass[index] = RIVER_CLASS_MINOR;
      flowDir[index] = x < width - 1 ? width + x + 1 : -1;
    }

    expect(adapter.getTerrainType(0, 0)).toBe(flatTerrain);

    withMapContextExecutionForTest(context, () => {
      publishTestArtifact(context, hydrologyArtifactModules.hydrography, {
        runoff: new Float32Array(size),
        discharge,
        riverClass,
        flowDir,
        sinkMask: new Uint8Array(size),
        outletMask: new Uint8Array(size),
      });
      publishTestArtifact(context, hydrologyArtifactModules.riverNetworkMetrics, {
        upstreamArea: Int32Array.from({ length: size }, (_value, index) =>
          index < width ? index + 1 : 1
        ),
        streamOrderProxy: new Uint8Array(size),
        mouthType: Uint8Array.from({ length: size }, (_value, index) => (index < width ? 1 : 0)),
        slopeClass: new Uint8Array(size),
        flowPermanenceProxy: Uint8Array.from({ length: size }, (_value, index) =>
          index < width ? 3 : index < width * 2 ? 2 : 0
        ),
        benchmarkSummary: createRiverNetworkBenchmarkSummaryFixture({
          landTileCount: size,
          riverTileCount,
          minorRiverTileCount: width,
          majorRiverTileCount: width,
          riverLandShare: riverTileCount / size,
          minorRiverShareOfRiverTiles: 0.5,
          majorRiverShareOfRiverTiles: 0.5,
          lowOrderRiverTileCount: riverTileCount,
          lowOrderRiverShareOfRiverTiles: 1,
          dryFlowTileCount: size - riverTileCount,
          intermittentFlowTileCount: width,
          perennialFlowTileCount: width,
          nonDryFlowLandShare: riverTileCount / size,
          riverIntermittentTileCount: width,
          riverPerennialTileCount: width,
          nonPerennialRiverShareOfRiverTiles: 0.5,
          oceanMouthTileCount: width,
          unresolvedMouthTileCount: size - width,
          resolvedMouthTileCount: width,
          unassignedBasinLandTileCount: size,
          maxUpstreamArea: width,
        }),
      });
      publishTestArtifact(context, hydrologyArtifactModules.lakePlan, {
        width,
        height,
        lakeMask: new Uint8Array(size),
        plannedLakeTileCount: 0,
        sinkLakeCount: 0,
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
      publishTestArtifact(context, morphologyArtifactModules.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size).fill(1),
        bathymetry: new Int16Array(size),
      });

      PlotRiversStep.run(
        context as any,
        {
          selectNavigableRiverTerrain: {
            strategy: "default",
            config: { endpointDischargePercentileMin: 0.94, targetMajorTileFraction: 0.28 },
          },
        },
        { selectNavigableRiverTerrain: selectNavigableRiverTerrain.run } as any,
        buildStepTestDependencies(PlotRiversStep)
      );
    });

    expect(adapter.callOrder).toEqual([
      "modelRivers",
      "validateAndFixTerrain",
      "defineNamedRivers",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(adapter.getTerrainType(0, 0)).toBe(navigableRiverTerrain);
    expect(adapter.getTerrainType(4, 0)).toBe(navigableRiverTerrain);
    expect(adapter.getTerrainType(0, 1)).toBe(flatTerrain);

    const projected = context.artifacts.get(mapRiversArtifacts.projectedNavigableRivers.id) as
      | {
          riverMask?: Uint8Array;
          plannedMinorRiverMask?: Uint8Array;
          plannedMajorRiverMask?: Uint8Array;
          plannedMinorRiverTileCount?: number;
          plannedMajorRiverTileCount?: number;
          selectedChainLengths?: Uint16Array;
          longestSelectedChainLength?: number;
          meanSelectedChainLength?: number;
          selectedEligibleMajorTileFraction?: number;
          majorDurableTileCount?: number;
          majorPerennialTileCount?: number;
          projectionSignalStatus?: string;
          projectionSignalReason?: string;
        }
      | undefined;
    const readback = context.artifacts.get(mapRiversArtifacts.engineProjectionRivers.id) as
      | {
          riverMask?: Uint8Array;
          engineRiverType?: Int32Array;
          engineNavigableRiverMask?: Uint8Array;
          terrainNavigableRiverMask?: Uint8Array;
          engineRiverTileCount?: number;
          engineMinorRiverTileCount?: number;
          engineNavigableRiverTileCount?: number;
          terrainNavigableRiverTileCount?: number;
          minorRiverStampingSupported?: boolean;
          minorRiverUnsupportedReason?: string;
        }
      | undefined;
    expect(projected?.riverMask?.[0]).toBe(1);
    expect(projected?.riverMask?.[width]).toBe(0);
    expect(projected?.plannedMajorRiverMask?.[0]).toBe(1);
    expect(projected?.plannedMinorRiverMask?.[width]).toBe(1);
    expect(projected?.plannedMajorRiverTileCount).toBe(5);
    expect(projected?.plannedMinorRiverTileCount).toBe(5);
    expect(Array.from(projected?.selectedChainLengths ?? [])).toEqual([5]);
    expect(projected?.longestSelectedChainLength).toBe(5);
    expect(projected?.meanSelectedChainLength).toBe(5);
    expect(projected?.selectedEligibleMajorTileFraction).toBe(1);
    expect(projected?.majorDurableTileCount).toBe(5);
    expect(projected?.majorPerennialTileCount).toBe(5);
    expect(projected?.projectionSignalStatus).toBe("normal-signal");
    expect(projected?.projectionSignalReason).toContain("normal Earthlike");
    expect(readback?.riverMask?.[0]).toBe(1);
    expect(readback?.riverMask?.[width]).toBe(0);
    expect(readback?.terrainNavigableRiverMask?.[0]).toBe(1);
    expect(readback?.engineNavigableRiverMask?.[0]).toBe(1);
    expect(readback?.engineRiverType?.[0]).toBe(RIVER_TYPE_NAVIGABLE);
    expect(readback?.terrainNavigableRiverTileCount).toBe(5);
    expect(readback?.engineRiverTileCount).toBe(5);
    expect(readback?.engineNavigableRiverTileCount).toBe(5);
    expect(readback?.engineMinorRiverTileCount).toBe(0);
    expect(readback?.minorRiverStampingSupported).toBe(true);
    expect(readback?.minorRiverUnsupportedReason).toContain("engineMinorRiverMask");
  });

  it("preserves diagnostic evidence when runtime validation dries a planned sink", () => {
    const syntheticDimensions = { width: 4, height: 4 } as const;
    const size = syntheticDimensions.width * syntheticDimensions.height;
    const seed = 2468;
    const sinkIndex = 1 + syntheticDimensions.width;
    const sinkLakeMask = new Uint8Array(size);
    sinkLakeMask[sinkIndex] = 1;
    const adapter = new RuntimeLakeValidationAdapter({
      ...syntheticDimensions,
      mapInfo: {
        GridWidth: syntheticDimensions.width,
        GridHeight: syntheticDimensions.height,
        MinLatitude: -60,
        MaxLatitude: 60,
        LakeGenerationFrequency: 5,
      },
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createMapContext({
      setup: admitMapSetup({
        mapSeed: seed,
        dimensions: syntheticDimensions,
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      }),
      adapter,
    });
    const flatTerrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT;
    for (let y = 0; y < syntheticDimensions.height; y += 1) {
      for (let x = 0; x < syntheticDimensions.width; x += 1) {
        adapter.setTerrainType(x, y, flatTerrain);
      }
    }

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
        ...syntheticDimensions,
        lakeMask: sinkLakeMask,
        plannedLakeTileCount: 1,
        sinkLakeCount: 1,
      });
      publishTestArtifact(context, mapMorphologyArtifactModules.coastClassification, {
        ...syntheticDimensions,
        baseWaterClass: new Uint8Array(size),
        sourceCoastMask: new Uint8Array(size),
        waterClass: new Uint8Array(size),
        coastRingMask: new Uint8Array(size),
        promotedOceanToCoast: 0,
      });

      LakesStep.run(
        context,
        { projectionReadback: true },
        {},
        buildStepTestDependencies(LakesStep)
      );
      PlotRiversStep.run(
        context,
        {
          selectNavigableRiverTerrain: {
            strategy: "default",
            config: { endpointDischargePercentileMin: 0.94, targetMajorTileFraction: 0.28 },
          },
        },
        { selectNavigableRiverTerrain: selectNavigableRiverTerrain.run },
        buildStepTestDependencies(PlotRiversStep)
      );
    });

    const projection = context.artifacts.get(mapRiversArtifacts.engineProjectionRivers.id) as
      | { sinkMismatchCount?: number }
      | undefined;
    expect(projection?.sinkMismatchCount ?? 0).toBeGreaterThanOrEqual(1);
    expect(adapter.isWater(1, 1)).toBe(false);
  });
});
