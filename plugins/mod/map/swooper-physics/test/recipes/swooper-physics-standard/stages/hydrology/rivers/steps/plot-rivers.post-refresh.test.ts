import { describe, expect, it } from "bun:test";
import { MockAdapter, type RiverFinalizationArgs, type RiverWriteIntent } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0, RIVER_TYPE_NAVIGABLE } from "@civ7/map-policy";
import { artifacts as hydrographyArtifacts } from "../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "../../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlotRiversStep } from "../../../../../../../src/recipes/standard/stages/hydrology/rivers/steps/plot-rivers/step.js";
import { TEST_MAP_LATITUDE_BOUNDS, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../setup.js";

type LakeDrift = Readonly<{ cell: number; marineCell: number; lost: "water" | "terrain" | "lake"; at: "validate" | "restore" | "cliffs" | "area" | "cache" }>;

class RiverCacheRefreshAdapter extends MockAdapter {
  private cachedWater: Uint8Array;
  lakeDrift?: LakeDrift;
  nativeLakeClass = true;
  private lakeDrifted = false;
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
    if (this.lakeDrifted && this.lakeDrift?.lost === "water" && this.idx2(x, y) === this.lakeDrift.cell) return false;
    return this.cachedWater[this.idx2(x, y)] === 1;
  }

  override isLake(x: number, y: number): boolean {
    if (!this.nativeLakeClass) return false;
    if (this.lakeDrifted && this.lakeDrift?.lost === "lake" && this.idx2(x, y) === this.lakeDrift.cell) return false;
    return super.isLake(x, y);
  }

  override getTerrainType(x: number, y: number): number {
    if (this.lakeDrifted && this.lakeDrift?.lost === "terrain" && this.idx2(x, y) === this.lakeDrift.cell)
      return CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN;
    return super.getTerrainType(x, y);
  }

  override setTerrainType(x: number, y: number, terrainType: number): void {
    super.setTerrainType(x, y, terrainType);
    if (this.lakeDrift?.at === "restore" && this.idx2(x, y) === this.lakeDrift.marineCell && terrainType === CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST) {
      this.callOrder.push("restoreCoastTerrain");
      this.lakeDrifted = true;
    }
  }

  override validateAndFixTerrain(): void {
    this.callOrder.push("validateAndFixTerrain");
    if (this.lakeDrift?.at === "validate") this.lakeDrifted = true;
    if (this.lakeDrift?.at === "restore") this.setTerrainType(this.lakeDrift.marineCell % this.width, Math.floor(this.lakeDrift.marineCell / this.width), CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT);
  }

  override modelRivers(minLength: number, maxLength: number, navigableTerrain: number): void {
    this.callOrder.push("modelRivers");
    super.modelRivers(minLength, maxLength, navigableTerrain);
  }

  override setRiverInfo(intent: RiverWriteIntent): void {
    this.callOrder.push("setRiverInfo");
    super.setRiverInfo(intent);
  }

  override finalizeRivers(args: RiverFinalizationArgs): void {
    this.callOrder.push("finalizeRivers");
    super.finalizeRivers(args);
  }

  override recalculateAreas(): void {
    this.callOrder.push("recalculateAreas");
    if (this.lakeDrift?.at === "area") this.lakeDrifted = true;
  }

  override generateCliffsFromElevation(): void {
    this.callOrder.push("generateCliffsFromElevation");
    super.generateCliffsFromElevation();
    if (this.lakeDrift?.at === "cliffs") this.lakeDrifted = true;
  }

  override storeWaterData(): void {
    this.callOrder.push("storeWaterData");
    this.refreshCachedWaterFromTerrain();
    if (this.lakeDrift?.at === "cache") this.lakeDrifted = true;
  }
}

describe("map-rivers/plot-rivers", () => {
  it("writes every certified class, finalizes once, then generates cliffs on restored river terrain before cache refresh", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const source = width + 4;
    const lake = source + 2;
    const marine = source + 5;
    const terrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    const cases: { blocker: boolean; drift?: LakeDrift; nativeLakeClass?: boolean }[] = [{ blocker: false }, { blocker: true }, { blocker: false, nativeLakeClass: false }];
    for (const at of ["validate", "restore", "cliffs", "area", "cache"] as const) {
      for (const lost of ["water", "terrain", "lake"] as const) cases.push({ blocker: false, drift: { cell: lake, marineCell: marine, at, lost } });
    }
    for (const { blocker, drift, nativeLakeClass = true } of cases) {
      const adapter = new RiverCacheRefreshAdapter({ width, height, mapInfo: TEST_MAP_SIZE.mapInfo, mapSizeId: TEST_MAP_SIZE.id, rng: createLabelRng(TEST_MAP_SEED) });
      const context = createMapContext({ setup: admitMapSetup({ mapSeed: TEST_MAP_SEED, dimensions: { width, height }, latitudeBounds: TEST_MAP_LATITUDE_BOUNDS }), adapter });
      for (let cell = 0; cell < size; cell++) adapter.setTerrainType(cell % width, Math.floor(cell / width), terrain.TERRAIN_FLAT);
      const landMask = new Uint8Array(size).fill(1);
      landMask[marine] = 0;
      const lakeMask = new Uint8Array(size);
      lakeMask[lake] = 1;
      adapter.setTerrainType(lake % width, 1, terrain.TERRAIN_COAST);
      adapter.setTerrainType(marine % width, 1, terrain.TERRAIN_COAST);
      adapter.setTerrainType(source % width, 1, terrain.TERRAIN_HILL);
      if (blocker) adapter.setTerrainType((source + 4) % width, 1, terrain.TERRAIN_MOUNTAIN);
      adapter.stampLakes(width, height, lakeMask);
      adapter.nativeLakeClass = nativeLakeClass;
      adapter.lakeDrift = drift;
      adapter.callOrder.length = 0;
      const riverClass = new Uint8Array(size);
      const flowDir = new Int32Array(size).fill(-1);
      for (let cell = source; cell < marine; cell++) {
        flowDir[cell] = cell + 1;
        if (cell !== lake) riverClass[cell] = cell === source ? 1 : 2;
      }
      const run = () => withMapContextExecutionForTest(context, (stepContext) => {
        publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
          model: "certified-sill-spill", runoff: Array<number>(size).fill(0), discharge: Array<number>(size).fill(0),
          riverClass, flowDir, basinId: new Int32Array(size), terminalType: new Uint8Array(size),
        });
        publishTestArtifact(stepContext, hydrographyArtifacts.riverNetwork, {
          model: "certified-sill-spill", upstreamArea: new Int32Array(size), streamOrderProxy: new Uint8Array(size), mouthType: new Uint8Array(size), slopeClass: new Uint8Array(size), flowPermanenceProxy: new Uint8Array(size), mouthBodyId: new Int32Array(size),
        });
        publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, {
          model: "certified-sill-spill", width, height, lakeMask, plannedLakeTileCount: 1,
          bodyId: Int32Array.from(lakeMask), waterSurface: new Int16Array(size),
          bodies: [{ nodeId: 1, wetCells: [lake], spillElevation: 0, outletCell: lake, receiverCell: lake + 1, connectorCells: [lake + 1], flux: { incomingOverflow: 1, dryRunoff: 0, wetPrecipitation: 1, wetDemand: 1, balance: 1 }, outflow: 1, floorCell: lake, floorElevation: -1 }],
          certificates: [{ nodeId: 1, spillBalance: 1 }], marineExits: [{ fromCell: marine - 1, marineCell: marine, discharge: 1 }], conservation: { dryRunoff: 1, wetPrecipitation: 1, wetDemand: 1, externalDischarge: 1, residual: 0, roundoffBound: 0 },
        });
        publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, { lakeMask });
        publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, { elevation: new Int16Array(size), seaLevel: 0, landMask, bathymetry: new Int16Array(size) });
        publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf, { shelfMask: Uint8Array.from(landMask, (value) => 1 - value), coastalLand: new Uint8Array(size), coastalWater: Uint8Array.from(landMask, (value) => 1 - value), distanceToCoast: new Uint16Array(size) });
        PlotRiversStep.run(stepContext, { projection: { model: "authored-network" } }, {}, buildStepTestDependencies(PlotRiversStep, stepContext));
      });
      if (blocker) {
        expect(run).toThrow(/blocked by native terrain/);
        expect(adapter.calls.setRiverInfo).toEqual([]);
        expect(adapter.calls.finalizeRivers).toEqual([]);
      } else if (drift && drift.lost !== "lake") {
        expect(run).toThrow(/post-maintenance.*certified accepted lake footprint lost/);
        expect(adapter.calls.finalizeRivers).toEqual([[false, 25, 2, 2]]);
        expect(adapter.callOrder.slice(-2)).toEqual(["recalculateAreas", "storeWaterData"]);
        if (drift.lost === "terrain") expect(adapter.isWater(lake % width, 1)).toBe(true);
      } else if (drift) {
        expect(run).not.toThrow();
        expect(adapter.isLake(lake % width, 1)).toBe(false);
        expect(adapter.isWater(lake % width, 1)).toBe(true);
        expect(adapter.getTerrainType(lake % width, 1)).toBe(terrain.TERRAIN_COAST);
        expect(adapter.calls.finalizeRivers).toEqual([[false, 25, 2, 2]]);
      } else {
        run();
        expect(adapter.calls.setRiverInfo.map(({ x, y, riverClass, direction }) => [y * width + x, riverClass, direction])).toEqual([
          [source, "MINOR", "EAST"], [source + 1, "NAVIGABLE", "EAST"], [source + 3, "NAVIGABLE", "EAST"], [source + 4, "NAVIGABLE", "EAST"],
        ]);
        expect(adapter.calls.finalizeRivers).toEqual([[false, 25, 2, 2]]);
        expect(adapter.callOrder).not.toContain("modelRivers");
        expect(adapter.callOrder).toEqual(["setRiverInfo", "setRiverInfo", "setRiverInfo", "setRiverInfo", "finalizeRivers", "validateAndFixTerrain", "generateCliffsFromElevation", "recalculateAreas", "storeWaterData"]);
        const projected = readArtifact(context, hydrographyArtifacts.projectedRivers);
        expect(projected.model).toBe("certified-sill-spill");
        expect(projected.nativeMinorRiverMask[source]).toBe(1);
        expect(projected.riverMask[lake]).toBe(0);
        expect(adapter.getTerrainType(lake % width, 1)).toBe(terrain.TERRAIN_COAST);
        expect(adapter.isLake(lake % width, 1)).toBe(nativeLakeClass);
      }
      expect(adapter.calls.setElevation).toEqual([]);
      expect(adapter.calls.generateCliffsFromElevation).toBe(blocker ? 0 : 1);
      if (!blocker) {
        const cliffs = adapter.callOrder.indexOf("generateCliffsFromElevation");
        expect(cliffs).toBeGreaterThan(adapter.callOrder.indexOf("finalizeRivers"));
        expect(cliffs).toBeGreaterThan(adapter.callOrder.indexOf("validateAndFixTerrain"));
        if (drift?.at === "restore") expect(cliffs).toBeGreaterThan(adapter.callOrder.indexOf("restoreCoastTerrain"));
        expect(cliffs).toBeLessThan(adapter.callOrder.indexOf("recalculateAreas"));
        expect(cliffs).toBeLessThan(adapter.callOrder.lastIndexOf("storeWaterData"));
      }
    }
    expect(PlotRiversStep.contract.engine).not.toContain("readCurrentMapElevationSnapshot");
    expect(PlotRiversStep.contract.engine).not.toContain("setElevation");
  });
  it("stamps MapGen-projected navigable rivers and refreshes downstream caches", () => {
    expect(hydrographyArtifacts.projectedRivers.id).toBe(
      "artifact:map.rivers.projectedRivers"
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
        model: "legacy-sink-budget",
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
        model: "legacy-sink-budget",
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
        model: "legacy-sink-budget",
        width,
        height,
        lakeMask: new Uint8Array(size),
        plannedLakeTileCount: 0,
        sinkLakeCount: 0,
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, { lakeMask: new Uint8Array(size) });
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
        { projection: { model: "legacy-procedural", endpointDischargePercentileMin: 0.94, targetMajorTileFraction: 0.28 } },
        {},
        buildStepTestDependencies(PlotRiversStep, stepContext)
      );
    });

    expect(adapter.callOrder).toEqual([
      "modelRivers",
      "validateAndFixTerrain",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(adapter.calls.setElevation).toEqual([]);
    expect(adapter.calls.finalizeRivers).toEqual([]);
    expect(adapter.getTerrainType(0, 0)).toBe(navigableRiverTerrain);
    expect(adapter.getTerrainType(width - 1, 0)).toBe(navigableRiverTerrain);
    expect(adapter.getTerrainType(0, 1)).toBe(flatTerrain);

    const projected = readArtifact(context, hydrographyArtifacts.projectedRivers);
    if (projected.model !== "legacy-sink-budget") throw new Error("Expected legacy projection.");
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
