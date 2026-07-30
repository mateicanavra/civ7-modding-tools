import { describe, expect, it } from "bun:test";
import { MockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0, RIVER_TYPE_NAVIGABLE } from "@civ7/map-policy";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlotRiversStep } from "../../../../../../../src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/step.js";
import { TEST_MAP_LATITUDE_BOUNDS, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../setup.js";

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

describe("map-rivers/plot-rivers", () => {
  it("stamps MapGen-projected navigable rivers and refreshes downstream caches", () => {
    expect(hydrographyArtifacts.projectedNavigableRivers.id).toBe(
      "artifact:map.rivers.projectedNavigableRivers"
    );

    const { width, height } = TEST_MAP_SIZE.dimensions;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    });

    const adapter = new RiverCacheRefreshAdapter({
      ...TEST_MAP_SIZE.dimensions,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      rng: createLabelRng(TEST_MAP_SEED),
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

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
        runoff: new Float32Array(size),
        discharge,
        riverClass,
        flowDir,
        sinkMask: new Uint8Array(size),
        outletMask: new Uint8Array(size),
        basinId: new Int32Array(size).fill(-1),
        routingElevation: new Float32Array(size),
        depressionDepth: new Float32Array(size),
        terminalType: new Uint8Array(size),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.riverNetwork, {
        upstreamArea: Int32Array.from({ length: size }, (_value, index) =>
          index < width ? index + 1 : 1
        ),
        streamOrderProxy: new Uint8Array(size),
        mouthType: Uint8Array.from({ length: size }, (_value, index) => (index < width ? 1 : 0)),
        slopeClass: new Uint8Array(size),
        flowPermanenceProxy: Uint8Array.from({ length: size }, (_value, index) =>
          index < width ? 3 : index < width * 2 ? 2 : 0
        ),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, {
        width,
        height,
        lakeMask: new Uint8Array(size),
        plannedLakeTileCount: 0,
        sinkLakeCount: 0,
      });
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size).fill(1),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf, {
        shelfMask: new Uint8Array(size),
        coastalLand: new Uint8Array(size),
        coastalWater: new Uint8Array(size),
        distanceToCoast: new Uint16Array(size),
      });

      PlotRiversStep.run(
        stepContext,
        { endpointDischargePercentileMin: 0.94, targetMajorTileFraction: 0.28 },
        {},
        buildStepTestDependencies(PlotRiversStep, stepContext)
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
    expect(adapter.getTerrainType(width - 1, 0)).toBe(navigableRiverTerrain);
    expect(adapter.getTerrainType(0, 1)).toBe(flatTerrain);

    const projected = readValidatedArtifact(context, hydrographyArtifacts.projectedNavigableRivers);
    const readback = adapter.readRiverProjection(width, height, projected.riverMask);
    expect(projected.riverMask[0]).toBe(1);
    expect(projected.riverMask[width]).toBe(0);
    expect(projected.plannedMajorRiverMask[0]).toBe(1);
    expect(projected.plannedMinorRiverMask[width]).toBe(1);
    expect(projected.plannedMajorRiverTileCount).toBe(width);
    expect(projected.plannedMinorRiverTileCount).toBe(width);
    expect(Array.from(projected.selectedChainLengths)).toEqual([width]);
    expect(projected.longestSelectedChainLength).toBe(width);
    expect(projected.meanSelectedChainLength).toBe(width);
    expect(projected.selectedEligibleMajorTileFraction).toBe(1);
    expect(projected.majorDurableTileCount).toBe(width);
    expect(projected.majorPerennialTileCount).toBe(width);
    expect(projected.projectionSignalStatus).toBe("normal-signal");
    expect(projected.projectionSignalReason).toContain("normal Earthlike");
    expect(readback.terrainNavigableRiverMask[0]).toBe(1);
    expect(readback.engineNavigableRiverMask[0]).toBe(1);
    expect(readback.engineRiverType[0]).toBe(RIVER_TYPE_NAVIGABLE);
    expect(readback.terrainNavigableRiverTileCount).toBe(width);
    expect(readback.engineRiverTileCount).toBe(width);
    expect(readback.engineNavigableRiverTileCount).toBe(width);
    expect(readback.engineMinorRiverTileCount).toBe(0);
    expect(readback.minorRiverStampingSupported).toBe(true);
    expect(readback.minorRiverUnsupportedReason).toContain("engineMinorRiverMask");
  });
});
