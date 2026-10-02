import { createEmptyWaterFixture } from "../../../morphology/features/fixtures/surface-water.js";
import { describe, expect, it } from "bun:test";
import { MockAdapter, type RiverFinalizationArgs, type RiverWriteIntent } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0, RIVER_TYPE_NAVIGABLE } from "@civ7/map-policy";
import { artifacts as hydrographyArtifacts } from "../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "../../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as morphologyCoastsArtifacts } from "../../../../../../../src/domain/morphology/modules/coasts/artifacts/index.js";
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

type LakeDrift = Readonly<{ cell: number; marineCell: number; lost: "water" | "terrain" | "lake"; at: "validate" | "restore" | "area" | "cache" }>;

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
  }

  override storeWaterData(): void {
    this.callOrder.push("storeWaterData");
    this.refreshCachedWaterFromTerrain();
    if (this.lakeDrift?.at === "cache") this.lakeDrifted = true;
  }
}

describe("map-rivers/plot-rivers", () => {
  it("preflights complete dry/wet plans, writes only qualified outlets, and preserves finalization and maintenance order", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const source = width + 4;
    const lake = source + 2;
    const marine = source + 5;
    const terrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    const cases: { blocker: boolean; drift?: LakeDrift; nativeLakeClass?: boolean; multiCell?: boolean;
      preflightFailure?: "lake-water" | "lake-terrain" | "receiver-water" | "partial-acceptance" }[] = [
      { blocker: false }, { blocker: true }, { blocker: false, nativeLakeClass: false },
      { blocker: false, nativeLakeClass: false, multiCell: true },
    ];
    for (const preflightFailure of ["lake-water", "lake-terrain", "receiver-water", "partial-acceptance"] as const) {
      cases.push({ blocker: false, multiCell: true, preflightFailure });
    }
    for (const at of ["validate", "restore", "area", "cache"] as const) {
      for (const lost of ["water", "terrain", "lake"] as const) cases.push({ blocker: false, drift: { cell: lake, marineCell: marine, at, lost } });
    }
    for (const { blocker, drift, nativeLakeClass = true, multiCell = false, preflightFailure } of cases) {
      const adapter = new RiverCacheRefreshAdapter({ width, height, mapInfo: TEST_MAP_SIZE.mapInfo, mapSizeId: TEST_MAP_SIZE.id, rng: createLabelRng(TEST_MAP_SEED) });
      const context = createMapContext({ setup: admitMapSetup({ mapSeed: TEST_MAP_SEED, dimensions: { width, height }, latitudeBounds: TEST_MAP_LATITUDE_BOUNDS }), adapter });
      for (let cell = 0; cell < size; cell++) adapter.setTerrainType(cell % width, Math.floor(cell / width), terrain.TERRAIN_FLAT);
      const landMask = new Uint8Array(size).fill(1);
      landMask[marine] = 0;
      const lakeMask = new Uint8Array(size);
      const wetCells = multiCell ? [lake, lake + width] : [lake];
      for (const cell of wetCells) {
        lakeMask[cell] = 1;
        adapter.setTerrainType(cell % width, Math.floor(cell / width), terrain.TERRAIN_COAST);
      }
      adapter.setTerrainType(marine % width, 1, terrain.TERRAIN_COAST);
      adapter.setTerrainType(source % width, 1, terrain.TERRAIN_HILL);
      if (blocker) adapter.setTerrainType((source + 4) % width, 1, terrain.TERRAIN_MOUNTAIN);
      adapter.stampLakes(width, height, lakeMask);
      const acceptedLakeMask = lakeMask.slice();
      if (preflightFailure === "partial-acceptance") acceptedLakeMask[lake + width] = 0;
      if (preflightFailure === "lake-water" || preflightFailure === "lake-terrain") {
        adapter.setTerrainType(lake % width, 2, preflightFailure === "lake-water" ? terrain.TERRAIN_FLAT : terrain.TERRAIN_OCEAN);
        adapter.storeWaterData();
      }
      if (preflightFailure === "receiver-water") {
        adapter.setTerrainType((lake + 1) % width, 1, terrain.TERRAIN_COAST);
        adapter.storeWaterData();
      }
      adapter.nativeLakeClass = nativeLakeClass;
      adapter.lakeDrift = drift;
      adapter.callOrder.length = 0;
      const riverClass = new Uint8Array(size);
      const flowDir = new Int32Array(size).fill(-1);
      for (let cell = source; cell < marine; cell++) {
        flowDir[cell] = cell + 1;
        if (cell !== lake) riverClass[cell] = cell === source ? 1 : 2;
      }
      const bodyId = lake + 1;
      const componentId = bodyId;
      const flux = { incomingOverflow: 1, dryRunoff: 0, wetPrecipitation: 1, wetDemand: 1, balance: 1 };
      const memberCells = [...wetCells, lake + 1].sort((a, b) => a - b);
      const transfers = [{ componentId, cellA: lake, cellB: lake + 1, bodyA: bodyId, bodyB: 0, signedDischarge: 1 }];
      if (multiCell) transfers.push({ componentId, cellA: lake, cellB: lake + width, bodyA: bodyId, bodyB: bodyId, signedDischarge: 0 });
      const run = () => withMapContextExecutionForTest(context, (stepContext) => {
        publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
          model: "certified-sill-spill", runoff: Array<number>(size).fill(0), discharge: Array<number>(size).fill(0),
          riverClass, flowDir, basinId: new Int32Array(size), terminalType: new Uint8Array(size),
          exposedLandMask: Uint8Array.from(landMask, (land, cell) => land === 1 && lakeMask[cell] === 0 ? 1 : 0),
        });
        publishTestArtifact(stepContext, hydrographyArtifacts.riverNetwork, {
          model: "certified-sill-spill", upstreamArea: new Int32Array(size), streamOrderProxy: new Uint8Array(size), mouthType: new Uint8Array(size), slopeClass: new Uint8Array(size), flowPermanenceProxy: new Uint8Array(size), mouthBodyId: new Int32Array(size),
        });
        publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, {
          model: "certified-sill-spill", width, height, lakeMask, plannedLakeTileCount: wetCells.length,
          bodyId: Int32Array.from(lakeMask, (value) => value * bodyId), waterSurface: Array.from(lakeMask),
          componentId: Int32Array.from({ length: size }, (_, cell) => memberCells.includes(cell) ? componentId : 0),
          pools: [{ poolId: 1, componentId, leafIds: [1], catchmentCells: memberCells, wetCells, state: "open", level: 1,
            flux, outflow: 1, unresolvedResidual: 0, closure: null }],
          bodies: [{ bodyId, componentId, poolId: 1, wetCells, level: 1, flux, outflow: 1, unresolvedResidual: 0 }],
          components: [{ componentId, poolId: 1, bodyIds: [bodyId], memberCells, junctionCells: [lake + 1],
            anchorCell: lake + 1, level: 1, state: "open", flux, outflow: 1, unresolvedResidual: 0, terminalId: marine + 1 }],
          transfers,
          ports: [{ kind: "adjacent", componentId, fromCell: lake + 1, toCell: lake + 2, destination: "dry-reach", destinationComponentId: 0, discharge: 1 }],
          terminals: [{ terminalId: marine + 1, role: "marine", anchorCell: marine, componentId: 0 }],
          marineExits: [{ fromCell: marine - 1, marineCell: marine, discharge: 1 }], boundaryExits: [],
          conservation: { dryRunoff: 1, wetPrecipitation: 1, wetDemand: 1, marineDischarge: 1, boundaryDischarge: 0,
            externalDischarge: 1, unresolvedResidual: 0, normalizedUnresolvedResidual: 0, residual: 0, roundoffBound: 0 },
        });
        publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, { lakeMask: acceptedLakeMask });
        publishTestArtifact(stepContext, morphologyErosionArtifacts.topography, { elevation: new Int16Array(size), seaLevel: 0, landMask, externalWaterMask: Uint8Array.from(landMask, (land) => land === 0 ? 1 : 0), bathymetry: new Int16Array(size) });
        publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf, { shelfMask: Uint8Array.from(landMask, (value) => 1 - value), coastalLand: new Uint8Array(size), coastalWater: Uint8Array.from(landMask, (value) => 1 - value), distanceToCoast: new Uint16Array(size) });
        publishTestArtifact(stepContext, morphologyCoastsArtifacts.resolvedCoastline, {
          coastalLand: new Uint8Array(size),
          coastalWater: Uint8Array.from(landMask, (value) => 1 - value),
          distanceToCoast: new Uint16Array(size),
        });
        PlotRiversStep.run(stepContext, {}, {}, buildStepTestDependencies(PlotRiversStep, stepContext));
      });
      if (blocker || preflightFailure) {
        expect(run).toThrow(/blocked by native terrain|preflight.*certified accepted|complete accepted/);
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
          [lake, "NAVIGABLE", "EAST"],
        ]);
        expect(adapter.calls.finalizeRivers).toEqual([[false, 25, 2, 2]]);
        expect(adapter.callOrder).not.toContain("modelRivers");
        expect(adapter.callOrder).toEqual(["setRiverInfo", "setRiverInfo", "setRiverInfo", "setRiverInfo", "setRiverInfo", "finalizeRivers", "validateAndFixTerrain", "recalculateAreas", "storeWaterData"]);
        const projected = readArtifact(context, hydrographyArtifacts.projectedRivers);
        expect(projected.model).toBe("certified-sill-spill");
        if (projected.model !== "certified-sill-spill") throw new Error("Expected authored projection.");
        expect(projected.authoredSourceCount).toBe(4);
        expect(projected.writes).toHaveLength(4);
        expect(projected.wetTransitionWrites).toEqual([{ bodyId, role: "outlet", sourceCell: lake,
          receiverCell: lake + 1, direction: "EAST", riverClass: "NAVIGABLE" }]);
        expect(projected.nativeMinorRiverMask[source]).toBe(1);
        expect(projected.riverMask[lake]).toBe(0);
        expect(adapter.getTerrainType(lake % width, 1)).toBe(terrain.TERRAIN_COAST);
        expect(adapter.isLake(lake % width, 1)).toBe(nativeLakeClass);
      }
      expect(adapter.calls.setElevation).toEqual([]);
      expect(adapter.calls.generateCliffsFromElevation).toBe(0);
      if (!blocker && !preflightFailure) {
        const areas = adapter.callOrder.indexOf("recalculateAreas");
        expect(areas).toBeGreaterThan(adapter.callOrder.indexOf("finalizeRivers"));
        expect(areas).toBeGreaterThan(adapter.callOrder.indexOf("validateAndFixTerrain"));
        if (drift?.at === "restore") expect(areas).toBeGreaterThan(adapter.callOrder.indexOf("restoreCoastTerrain"));
        expect(areas).toBeLessThan(adapter.callOrder.lastIndexOf("storeWaterData"));
      }
    }
    expect(PlotRiversStep.contract.engine).not.toContain("readCurrentMapElevationSnapshot");
    expect(PlotRiversStep.contract.engine).not.toContain("setElevation");
    expect(PlotRiversStep.contract.engine).not.toContain("generateCliffsFromElevation");
    expect(PlotRiversStep.contract.engine).not.toContain("isLake");
  });
  it("projects every physical dry source without a second quota and refreshes downstream caches", () => {
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
    const discharge = Array<number>(size).fill(0);
    const riverClass = new Uint8Array(size);
    const flowDir = new Int32Array(size).fill(-1);
    for (let x = 0; x < width - 1; x++) {
      const index = x;
      discharge[index] = x + 1;
      riverClass[index] = RIVER_CLASS_MAJOR;
      flowDir[index] = x + 1;
    }
    for (let x = 0; x < width - 1; x++) {
      const index = width + x;
      discharge[index] = 100 + x;
      riverClass[index] = RIVER_CLASS_MINOR;
      flowDir[index] = width + x + 1;
    }

    expect(adapter.getTerrainType(0, 0)).toBe(flatTerrain);

    withMapContextExecutionForTest(context, (stepContext) => {
      const fixture = createEmptyWaterFixture(width, height);
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
        ...fixture.hydrography, discharge, riverClass, flowDir,
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.riverNetwork, fixture.riverNetwork);
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, fixture.lakePlan);
      publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, { lakeMask: new Uint8Array(size) });
      publishTestArtifact(stepContext, morphologyErosionArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size).fill(1),
        externalWaterMask: new Uint8Array(size),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf, {
        shelfMask: new Uint8Array(size),
        coastalLand: new Uint8Array(size),
        coastalWater: new Uint8Array(size),
        distanceToCoast: new Uint16Array(size),
      });
      publishTestArtifact(stepContext, morphologyCoastsArtifacts.resolvedCoastline, {
        coastalLand: new Uint8Array(size),
        coastalWater: new Uint8Array(size),
        distanceToCoast: new Uint16Array(size),
      });

      PlotRiversStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(PlotRiversStep, stepContext)
      );
    });

    expect(adapter.callOrder).toEqual([
      ...Array<string>(2 * (width - 1)).fill("setRiverInfo"),
      "finalizeRivers", "validateAndFixTerrain", "recalculateAreas", "storeWaterData",
    ]);
    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(adapter.calls.setElevation).toEqual([]);
    expect(adapter.calls.finalizeRivers).toEqual([[false, 25, 2, 2]]);
    expect(adapter.getTerrainType(0, 0)).toBe(navigableRiverTerrain);
    expect(adapter.getTerrainType(width - 2, 0)).toBe(navigableRiverTerrain);
    expect(adapter.getTerrainType(width - 1, 0)).toBe(flatTerrain);
    expect(adapter.getTerrainType(0, 1)).toBe(flatTerrain);

    const projected = readArtifact(context, hydrographyArtifacts.projectedRivers);
    expect(projected.model).toBe("certified-sill-spill");
    const readback = adapter.readRiverProjection(width, height, projected.riverMask);
    expect(projected.riverMask[0]).toBe(1);
    expect(projected.riverMask[width]).toBe(0);
    expect(projected.plannedMajorRiverMask[0]).toBe(1);
    expect(projected.plannedMinorRiverMask[width]).toBe(1);
    expect(projected.plannedMajorRiverTileCount).toBe(width - 1);
    expect(projected.plannedMinorRiverTileCount).toBe(width - 1);
    expect(projected.authoredSourceCount).toBe(2 * (width - 1));
    expect(projected.writes).toHaveLength(2 * (width - 1));
    expect(projected.writes.map(({ sourceCell }) => sourceCell)).toEqual([
      ...Array.from({ length: width - 1 }, (_, cell) => cell),
      ...Array.from({ length: width - 1 }, (_, cell) => width + cell),
    ]);
    expect(projected.wetTransitionWrites).toEqual([]);
    expect(readback.terrainNavigableRiverMask[0]).toBe(1);
    expect(readback.engineNavigableRiverMask[0]).toBe(1);
    expect(readback.engineRiverType[0]).toBe(RIVER_TYPE_NAVIGABLE);
    expect(readback.terrainNavigableRiverTileCount).toBe(width - 1);
    expect(readback.engineRiverTileCount).toBe(2 * (width - 1));
    expect(readback.engineNavigableRiverTileCount).toBe(width - 1);
    expect(readback.engineMinorRiverTileCount).toBe(width - 1);
    expect(readback.minorRiverStampingSupported).toBe(true);
    expect(readback.engineMinorRiverMask[width]).toBe(1);
  });
});
