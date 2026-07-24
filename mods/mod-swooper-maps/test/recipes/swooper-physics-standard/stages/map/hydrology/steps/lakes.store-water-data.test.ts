import { describe, expect, it } from "bun:test";
import { type LakeProjectionResult, MockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readValidatedArtifact } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifacts as mapHydrologyArtifacts } from "../../../../../../../src/recipes/standard/stages/map/hydrology/artifacts/index.js";
import { LakesStep } from "../../../../../../../src/recipes/standard/stages/map/hydrology/steps/lakes/step.js";

type TestContext = ReturnType<typeof createMapContext>;

const SYNTHETIC_CACHE_DIMENSIONS = { width: 4, height: 3 } as const;
const SYNTHETIC_PROJECTION_DIMENSIONS = { width: 6, height: 5 } as const;

/**
 * Cache-backed adapter double.
 *
 * The real engine can answer water queries from cached topology, so this double
 * makes lake stamping fail unless the adapter boundary refreshes water data
 * after terrain mutation.
 */
class CachedWaterAdapter extends MockAdapter {
  private cachedWater: Uint8Array;
  readonly callOrder: string[] = [];

  constructor(config: ConstructorParameters<typeof MockAdapter>[0]) {
    super(config);
    this.cachedWater = new Uint8Array(Math.max(0, this.width * this.height));
  }

  private idx2(x: number, y: number): number {
    return y * this.width + x;
  }

  override isWater(x: number, y: number): boolean {
    return this.cachedWater[this.idx2(x, y)] === 1;
  }

  override stampLakes(width: number, height: number, lakeMask: Uint8Array): LakeProjectionResult {
    this.callOrder.push("stampLakes");
    return super.stampLakes(width, height, lakeMask);
  }

  override recalculateAreas(): void {
    this.callOrder.push("recalculateAreas");
  }

  override storeWaterData(): void {
    this.callOrder.push("storeWaterData");

    const coast = this.getTerrainTypeIndex("TERRAIN_COAST");
    const ocean = this.getTerrainTypeIndex("TERRAIN_OCEAN");
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const terrain = this.getTerrainType(x, y) | 0;
        this.cachedWater[this.idx2(x, y)] = terrain === coast || terrain === ocean ? 1 : 0;
      }
    }
  }
}

/**
 * Readback-rejecting adapter double.
 *
 * This keeps the test focused on the projection contract: `map-hydrology/lakes`
 * records rejections as diagnostics and does not turn engine disagreement into
 * Hydrology model evidence or a runtime throw.
 */
class RejectingLakeAdapter extends MockAdapter {
  override stampLakes(width: number, height: number, lakeMask: Uint8Array): LakeProjectionResult {
    this.calls.stampLakes.push({ width, height, lakeMask });
    const size = width * height;
    const rejectedLakeMask = new Uint8Array(size);
    const nonLakeMask = new Uint8Array(size);
    let plannedLakeTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (lakeMask[i] !== 1) continue;
      rejectedLakeMask[i] = 1;
      nonLakeMask[i] = 1;
      plannedLakeTileCount += 1;
    }
    return {
      width,
      height,
      plannedLakeMask: lakeMask,
      stampedLakeMask: new Uint8Array(size),
      rejectedLakeMask,
      engineTerrain: new Int32Array(size),
      engineWaterMask: new Uint8Array(size),
      engineLakeMask: new Uint8Array(size),
      engineAreaId: new Int32Array(size),
      engineElevation: new Int16Array(size),
      terrainMismatchMask: new Uint8Array(size),
      nonWaterMask: rejectedLakeMask,
      nonLakeMask,
      plannedLakeTileCount,
      stampedLakeTileCount: 0,
      rejectedLakeTileCount: plannedLakeTileCount,
      terrainMismatchTileCount: 0,
      nonWaterTileCount: plannedLakeTileCount,
      nonLakeTileCount: plannedLakeTileCount,
    };
  }
}

function createContext(
  adapter: MockAdapter,
  syntheticDimensions: Readonly<{ width: number; height: number }>,
  seed: number
): TestContext {
  const { width, height } = syntheticDimensions;
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: seed,
      dimensions: syntheticDimensions,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }),
    adapter,
  });
  const flatTerrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      adapter.setTerrainType(x, y, flatTerrain);
    }
  }
  return context;
}

function seedLakePlan(
  context: TestContext,
  lakeMask: Uint8Array,
  mountainMask: Uint8Array = new Uint8Array(
    context.setup.dimensions.width * context.setup.dimensions.height
  )
): void {
  const { width, height } = context.setup.dimensions;
  const size = width * height;
  publishTestArtifact(context, morphologyArtifacts.topography, {
    elevation: new Int16Array(size),
    seaLevel: 0,
    landMask: new Uint8Array(size).fill(1),
    bathymetry: new Int16Array(size),
  });
  publishTestArtifact(context, hydrographyArtifacts.lakePlan, {
    width,
    height,
    lakeMask,
    plannedLakeTileCount: lakeMask.reduce((count, value) => count + (value === 1 ? 1 : 0), 0),
    sinkLakeCount: lakeMask.reduce((count, value) => count + (value === 1 ? 1 : 0), 0),
  });
  publishTestArtifact(context, morphologyArtifacts.mountains, {
    mountainMask,
    mountainRegionMask: Uint8Array.from(mountainMask),
    mountainRegionIdByTile: Int32Array.from(mountainMask, (value) => (value === 1 ? 0 : -1)),
    hillMask: new Uint8Array(size),
    foothillMask: new Uint8Array(size),
    roughLandMask: new Uint8Array(size),
    orogenyPotential: new Uint8Array(size),
    fracturePotential: new Uint8Array(size),
    roughnessPotential: new Uint8Array(size),
  });
}

function executeLakesStep(
  context: TestContext,
  lakeMask: Uint8Array,
  mountainMask?: Uint8Array
): Exclude<ReturnType<typeof LakesStep.run>, Promise<unknown>> {
  return withMapContextExecutionForTest(context, (stepContext) => {
    seedLakePlan(stepContext, lakeMask, mountainMask);
    const result = LakesStep.run(
      stepContext,
      {},
      {},
      buildStepTestDependencies(LakesStep, stepContext)
    );
    if (result instanceof Promise) {
      throw new Error("The lakes step must remain synchronous.");
    }
    return result;
  });
}

describe("map-hydrology/lakes", () => {
  it("refreshes engine water caches after stamping planned lakes", () => {
    const { width, height } = SYNTHETIC_CACHE_DIMENSIONS;
    const seed = 1234;
    const adapter = new CachedWaterAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 },
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createContext(adapter, SYNTHETIC_CACHE_DIMENSIONS, seed);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[1 + width] = 1;
    expect(adapter.isWater(1, 1)).toBe(false);

    executeLakesStep(context, lakeMask);

    expect(adapter.callOrder.slice(-3)).toEqual([
      "stampLakes",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(adapter.isWater(1, 1)).toBe(true);

    const projection = readValidatedArtifact(context, mapHydrologyArtifacts.engineProjectionLakes);
    expect(projection.nonLakeTileCount).toBe(0);
    expect(projection.terrainMismatchTileCount).toBe(0);
  });

  it("records projection rejection as diagnostics without throwing", () => {
    const { width, height } = SYNTHETIC_CACHE_DIMENSIONS;
    const seed = 4321;
    const adapter = new RejectingLakeAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 },
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createContext(adapter, SYNTHETIC_CACHE_DIMENSIONS, seed);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[1 + width] = 1;
    const result = executeLakesStep(context, lakeMask);

    const projection = readValidatedArtifact(context, mapHydrologyArtifacts.engineProjectionLakes);
    expect(projection.sinkMismatchCount).toBe(1);
    expect(projection.nonLakeTileCount).toBe(1);
    expect(projection.terrainMismatchTileCount).toBe(0);

    const projectViz = LakesStep.viz;
    if (!projectViz) throw new Error("Expected the lakes step to expose its evidence projector");
    const dataTypeKeys = projectViz({
      result,
      config: {},
      dimensions: SYNTHETIC_CACHE_DIMENSIONS,
    }).map(({ dataTypeKey }) => dataTypeKey);
    expect(dataTypeKeys).toContain("map.hydrology.lakes.engineLakeMask");
    expect(dataTypeKeys).toContain("map.hydrology.lakes.rejectedLakeMask");
  });

  it("stamps the projected lake mask instead of calling engine lake generation", () => {
    const { width, height } = SYNTHETIC_PROJECTION_DIMENSIONS;
    const seed = 9876;
    const adapter = new CachedWaterAdapter({
      width,
      height,
      mapInfo: {
        GridWidth: width,
        GridHeight: height,
        MinLatitude: -60,
        MaxLatitude: 60,
        LakeGenerationFrequency: 25,
      },
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createContext(adapter, SYNTHETIC_PROJECTION_DIMENSIONS, seed);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[2 + width] = 1;
    lakeMask[3 + width] = 1;
    executeLakesStep(context, lakeMask);

    expect(adapter.calls.generateLakes).toEqual([]);
    expect(Array.from(adapter.calls.stampLakes.at(-1)?.lakeMask ?? [])).toEqual(
      Array.from(lakeMask)
    );
  });

  it("does not stamp planned lakes over mountain spines", () => {
    const { width, height } = SYNTHETIC_PROJECTION_DIMENSIONS;
    const seed = 2468;
    const adapter = new CachedWaterAdapter({
      width,
      height,
      mapInfo: { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 },
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createContext(adapter, SYNTHETIC_PROJECTION_DIMENSIONS, seed);
    const mountainTile = 2 + width;
    const plainLakeTile = 3 + width;
    const lakeMask = new Uint8Array(width * height);
    lakeMask[mountainTile] = 1;
    lakeMask[plainLakeTile] = 1;
    const mountainMask = new Uint8Array(width * height);
    mountainMask[mountainTile] = 1;
    executeLakesStep(context, lakeMask, mountainMask);

    const stamped = adapter.calls.stampLakes.at(-1)?.lakeMask;
    expect(stamped).toBeInstanceOf(Uint8Array);
    expect(stamped?.[mountainTile]).toBe(0);
    expect(stamped?.[plainLakeTile]).toBe(1);

    const projection = readValidatedArtifact(context, mapHydrologyArtifacts.engineProjectionLakes);
    expect(projection.plannedLakeMask[mountainTile]).toBe(1);
    expect(projection.morphologyProtectedLakeTileCount).toBe(1);
  });
});
