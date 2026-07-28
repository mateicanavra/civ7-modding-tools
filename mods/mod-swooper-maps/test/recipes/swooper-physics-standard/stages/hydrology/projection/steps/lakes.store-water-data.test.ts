import { describe, expect, it } from "bun:test";
import { type LakeProjectionResult, MockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { LakesStep } from "../../../../../../../src/recipes/standard/stages/hydrology/projection/steps/lakes/step.js";
import { TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../setup.js";

type TestContext = ReturnType<typeof createMapContext>;

const TEST_DIMENSIONS = TEST_MAP_SIZE.dimensions;

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

function seedLakeProjectionInputs(
  context: TestContext,
  lakeMask: Uint8Array,
  mountainMask: Uint8Array = new Uint8Array(
    context.setup.dimensions.width * context.setup.dimensions.height
  ),
  volcanoMask: Uint8Array = new Uint8Array(
    context.setup.dimensions.width * context.setup.dimensions.height
  )
): void {
  const { width, height } = context.setup.dimensions;
  const size = width * height;
  publishTestArtifact(context, hydrographyArtifacts.lakePlan, {
    width,
    height,
    lakeMask,
    plannedLakeTileCount: lakeMask.reduce((count, value) => count + (value === 1 ? 1 : 0), 0),
    sinkLakeCount: lakeMask.reduce((count, value) => count + (value === 1 ? 1 : 0), 0),
  });
  publishTestArtifact(context, morphologyLandformsArtifacts.mountains, {
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
  publishTestArtifact(context, morphologyLandformsArtifacts.volcanoes, {
    volcanoMask,
    volcanoes: Array.from(volcanoMask.entries())
      .filter(([, present]) => present === 1)
      .map(([tileIndex]) => ({
        tileIndex,
        kind: "intraplate" as const,
        strength01: 0,
      })),
  });
}

function executeLakesStep(
  context: TestContext,
  lakeMask: Uint8Array,
  mountainMask?: Uint8Array,
  volcanoMask?: Uint8Array
): Exclude<ReturnType<typeof LakesStep.run>, Promise<unknown>> {
  return withMapContextExecutionForTest(context, (stepContext) => {
    seedLakeProjectionInputs(stepContext, lakeMask, mountainMask, volcanoMask);
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
    const { width, height } = TEST_DIMENSIONS;
    const seed = TEST_MAP_SEED;
    const adapter = new CachedWaterAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      rng: createLabelRng(seed),
    });
    const context = createContext(adapter, TEST_DIMENSIONS, seed);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[1 + width] = 1;
    expect(adapter.isWater(1, 1)).toBe(false);

    const result = executeLakesStep(context, lakeMask);

    expect(adapter.callOrder.slice(-3)).toEqual([
      "stampLakes",
      "recalculateAreas",
      "storeWaterData",
    ]);
    expect(adapter.isWater(1, 1)).toBe(true);

    expect(result.projection.nonLakeTileCount).toBe(0);
    expect(result.projection.terrainMismatchTileCount).toBe(0);
    const projectedLakes = readArtifact(context, hydrographyArtifacts.projectedLakes);
    expect(projectedLakes.lakeMask).toEqual(lakeMask);
  });

  it("records projection rejection as diagnostics without throwing", () => {
    const { width, height } = TEST_DIMENSIONS;
    const seed = TEST_MAP_SEED;
    const adapter = new RejectingLakeAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      rng: createLabelRng(seed),
    });
    const context = createContext(adapter, TEST_DIMENSIONS, seed);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[1 + width] = 1;
    const observation = executeLakesStep(context, lakeMask);

    expect(observation.projection.rejectedLakeTileCount).toBe(1);
    expect(observation.projection.nonLakeTileCount).toBe(1);
    expect(observation.projection.terrainMismatchTileCount).toBe(0);
    const projectedLakes = readArtifact(context, hydrographyArtifacts.projectedLakes);
    expect(projectedLakes.lakeMask[1 + width]).toBe(0);
    expect(projectedLakes.lakeMask.reduce((count, value) => count + value, 0)).toBe(0);

    const projectViz = LakesStep.viz;
    if (!projectViz) throw new Error("Expected the lakes step to expose its evidence projector");
    const dataTypeKeys = projectViz({
      observation,
      config: {},
      dimensions: TEST_DIMENSIONS,
    }).map(({ dataTypeKey }) => dataTypeKey);
    expect(dataTypeKeys).toContain("map.hydrology.lakes.engineLakeMask");
    expect(dataTypeKeys).toContain("map.hydrology.lakes.rejectedLakeMask");
  });

  it("stamps the projected lake mask instead of calling engine lake generation", () => {
    const { width, height } = TEST_DIMENSIONS;
    const seed = TEST_MAP_SEED;
    const adapter = new CachedWaterAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      rng: createLabelRng(seed),
    });
    const context = createContext(adapter, TEST_DIMENSIONS, seed);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[2 + width] = 1;
    lakeMask[3 + width] = 1;
    executeLakesStep(context, lakeMask);

    expect(adapter.calls.generateLakes).toEqual([]);
    expect(Array.from(adapter.calls.stampLakes.at(-1)?.lakeMask ?? [])).toEqual(
      Array.from(lakeMask)
    );
  });

  it("protects final Morphology landforms from lake projection and measures the candidates", () => {
    const { width, height } = TEST_DIMENSIONS;
    const adapter = new CachedWaterAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      rng: createLabelRng(TEST_MAP_SEED),
    });
    const context = createContext(adapter, TEST_DIMENSIONS, TEST_MAP_SEED);
    const mountainTile = 2 + width;
    const volcanoTile = 3 + width;
    const plainLakeTile = 4 + width;
    const lakeMask = new Uint8Array(width * height);
    lakeMask[mountainTile] = 1;
    lakeMask[volcanoTile] = 1;
    lakeMask[plainLakeTile] = 1;
    const mountainMask = new Uint8Array(width * height);
    mountainMask[mountainTile] = 1;
    const volcanoMask = new Uint8Array(width * height);
    volcanoMask[volcanoTile] = 1;

    const observation = executeLakesStep(context, lakeMask, mountainMask, volcanoMask);

    const projectedCandidates = adapter.calls.stampLakes.at(-1)?.lakeMask;
    expect(projectedCandidates).toBeInstanceOf(Uint8Array);
    expect(observation.plannedLakeMask[mountainTile]).toBe(1);
    expect(projectedCandidates?.[mountainTile]).toBe(0);
    expect(observation.plannedLakeMask[volcanoTile]).toBe(1);
    expect(projectedCandidates?.[volcanoTile]).toBe(0);
    expect(projectedCandidates?.[plainLakeTile]).toBe(1);
    const projectedLakes = readArtifact(context, hydrographyArtifacts.projectedLakes);
    expect(projectedLakes.lakeMask[mountainTile]).toBe(0);
    expect(projectedLakes.lakeMask[volcanoTile]).toBe(0);
    expect(projectedLakes.lakeMask[plainLakeTile]).toBe(1);
    expect(observation.projection.plannedLakeTileCount).toBe(1);
    expect(observation.morphologyProtectedLakeTileCount).toBe(2);
    expect(
      observation.projection.plannedLakeTileCount + observation.morphologyProtectedLakeTileCount
    ).toBe(3);
    expect(
      observation.projection.stampedLakeTileCount + observation.projection.rejectedLakeTileCount
    ).toBe(observation.projection.plannedLakeTileCount);

    const projectMetrics = LakesStep.metrics;
    if (!projectMetrics) throw new Error("Expected the lakes step to measure projection evidence");
    const metrics = projectMetrics({
      observation,
      config: {},
      dimensions: TEST_DIMENSIONS,
    });
    expect(metrics["map.hydrology.lakeProjection"]).toEqual(
      expect.objectContaining({
        plannedLakeTileCount: 1,
        morphologyProtectedLakeTileCount: 2,
      })
    );
  });
});
