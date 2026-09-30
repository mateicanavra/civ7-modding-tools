import { describe, expect, it } from "bun:test";
import { closedLakeProjectionFixture } from "../../../../fixtures/closed-lake-projection.js";
import { type LakeProjectionResult, MockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as hydrographyArtifacts } from "../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
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
 * refuses a partial native footprint before publishing downstream lake evidence.
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
  publishTestArtifact(context, hydrographyArtifacts.lakePlan, closedLakeProjectionFixture(width, height, lakeMask));
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
  it("keeps certified inland water when native lake classification differs", () => {
    class InlandWaterAdapter extends CachedWaterAdapter {
      override isLake(): boolean { return false; }
    }
    const { width, height } = TEST_DIMENSIONS;
    const adapter = new InlandWaterAdapter({ width, height, mapInfo: TEST_MAP_SIZE.mapInfo, mapSizeId: TEST_MAP_SIZE.id, rng: createLabelRng(TEST_MAP_SEED) });
    const context = createContext(adapter, TEST_DIMENSIONS, TEST_MAP_SEED);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[width + 1] = 1;
    const result = executeLakesStep(context, lakeMask);
    expect(result.projection.stampedLakeTileCount).toBe(1);
    expect(result.projection.nonLakeTileCount).toBe(1);
    expect(result.projection.terrainMismatchTileCount).toBe(0);
    expect(readArtifact(context, hydrographyArtifacts.projectedLakes).lakeMask).toEqual(lakeMask);
    const layers = LakesStep.viz!({ observation: result, config: {}, dimensions: TEST_DIMENSIONS });
    const nativeLakeLayer = layers.find((layer) => layer.dataTypeKey === "map.hydrology.lakes.engineLakeMask");
    expect(nativeLakeLayer?.kind).toBe("grid");
    if (nativeLakeLayer?.kind === "grid") expect(nativeLakeLayer.field.values[width + 1]).toBe(0);
  });

  it("refuses wrong terrain even when all certified water was accepted", () => {
    class WrongTerrainAdapter extends CachedWaterAdapter {
      override stampLakes(width: number, height: number, mask: Uint8Array): LakeProjectionResult {
        const result = super.stampLakes(width, height, mask);
        return { ...result, terrainMismatchTileCount: 1 };
      }
    }
    const { width, height } = TEST_DIMENSIONS;
    const adapter = new WrongTerrainAdapter({ width, height, mapInfo: TEST_MAP_SIZE.mapInfo, mapSizeId: TEST_MAP_SIZE.id, rng: createLabelRng(TEST_MAP_SEED) });
    const context = createContext(adapter, TEST_DIMENSIONS, TEST_MAP_SEED);
    const mask = new Uint8Array(width * height);
    mask[width + 1] = 1;
    expect(() => executeLakesStep(context, mask)).toThrow(/coast terrain mismatches/);
    expect(() => readArtifact(context, hydrographyArtifacts.projectedLakes)).toThrow();
  });

  it("projects the entire certified footprint and rejects blockers or native partial acceptance", () => {
    const { width, height } = TEST_DIMENSIONS;
    const lakeMask = new Uint8Array(width * height);
    for (let cell = width + 2; cell < width + 34; cell++) lakeMask[cell] = 1;
    for (const [blocked, rejected] of [[false, false], [true, false], [false, true]] as const) {
      const Adapter = rejected ? RejectingLakeAdapter : CachedWaterAdapter;
      const adapter = new Adapter({ width, height, mapInfo: TEST_MAP_SIZE.mapInfo, mapSizeId: TEST_MAP_SIZE.id, rng: createLabelRng(TEST_MAP_SEED) });
      const context = createContext(adapter, TEST_DIMENSIONS, TEST_MAP_SEED);
      const mountains = new Uint8Array(width * height);
      if (blocked) mountains[width + 3] = 1;
      const run = () => executeLakesStep(context, lakeMask, mountains);
      if (blocked || rejected) {
        expect(run).toThrow(blocked ? /blocking landform/ : /footprint rejected/);
        expect(adapter.calls.stampLakes.length).toBe(blocked ? 0 : 1);
        expect(() => readArtifact(context, hydrographyArtifacts.projectedLakes)).toThrow();
      } else {
        expect(run().projection.stampedLakeTileCount).toBe(32);
        expect(readArtifact(context, hydrographyArtifacts.projectedLakes).lakeMask).toEqual(lakeMask);
      }
    }
  });
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

  it("refuses native projection rejection rather than publishing a clipped physical footprint", () => {
    const { width, height } = TEST_DIMENSIONS;
    const adapter = new RejectingLakeAdapter({ width, height });
    const context = createContext(adapter, TEST_DIMENSIONS, TEST_MAP_SEED);
    const lakeMask = new Uint8Array(width * height);
    lakeMask[width + 1] = 1;
    const before = lakeMask.slice();
    expect(() => executeLakesStep(context, lakeMask)).toThrow(/footprint rejected/);
    expect(adapter.calls.stampLakes).toHaveLength(1);
    expect(adapter.calls.stampLakes[0]!.lakeMask).toEqual(lakeMask);
    expect(lakeMask).toEqual(before);
    expect(() => readArtifact(context, hydrographyArtifacts.projectedLakes)).toThrow();
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

  it.each(["mountain", "volcano"] as const)("refuses overlapping %s truth before stamping any physical lake cell", (blocker) => {
    const { width, height } = TEST_DIMENSIONS;
    const adapter = new CachedWaterAdapter({ width, height });
    const context = createContext(adapter, TEST_DIMENSIONS, TEST_MAP_SEED);
    const lakeMask = new Uint8Array(width * height);
    for (const cell of [width + 2, width + 3, width + 4, width + 12]) lakeMask[cell] = 1;
    const before = lakeMask.slice();
    const mountains = new Uint8Array(width * height);
    const volcanoes = new Uint8Array(width * height);
    (blocker === "mountain" ? mountains : volcanoes)[width + 3] = 1;
    expect(() => executeLakesStep(context, lakeMask, mountains, volcanoes)).toThrow(/blocking landform/);
    expect(adapter.calls.stampLakes).toEqual([]);
    expect(lakeMask).toEqual(before);
    expect(() => readArtifact(context, hydrographyArtifacts.projectedLakes)).toThrow();
  });

  it("stamps disconnected groups and single-cell physical water unchanged without fragment pruning", () => {
    const { width, height } = TEST_DIMENSIONS;
    const adapter = new CachedWaterAdapter({ width, height });
    const context = createContext(adapter, TEST_DIMENSIONS, TEST_MAP_SEED);
    const lakeMask = new Uint8Array(width * height);
    for (const x of [2, 3, 4, 7, 8, 9, 12]) lakeMask[width + x] = 1;
    const before = lakeMask.slice();
    const observation = executeLakesStep(context, lakeMask);
    expect(adapter.calls.stampLakes[0]!.lakeMask).toEqual(before);
    expect(readArtifact(context, hydrographyArtifacts.projectedLakes).lakeMask).toEqual(before);
    expect(lakeMask).toEqual(before);
    expect(observation.projection.plannedLakeTileCount).toBe(7);
    expect(observation.projection.stampedLakeTileCount).toBe(7);
    expect(LakesStep.metrics!({ observation, config: {}, dimensions: TEST_DIMENSIONS })["map.hydrology.lakeProjection"])
      .toMatchObject({ plannedLakeTileCount: 7, stampedLakeTileCount: 7, rejectedLakeTileCount: 0 });
  });
});
