import { describe, expect, it } from "bun:test";

import { type CurrentMapElevationSnapshot, MockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { artifacts as hydrographyArtifacts } from "../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { BuildElevationStep } from "../../../../../../../src/recipes/standard/stages/morphology/elevation/steps/build-elevation/step.js";
import { projectStandardElevation } from "../../../../../../../src/recipes/standard/elevation-projection.js";
import { TEST_MAP_SEED } from "../../../../../../setup.js";
import { createEmptyWaterFixture } from "../../features/fixtures/surface-water.js";
import { closedLakeProjectionFixture } from "../../../../fixtures/closed-lake-projection.js";

const SYNTHETIC_BOUNDED_DRIFT_DIMENSIONS = { width: 10, height: 10 } as const;
const SYNTHETIC_EXCESSIVE_DRIFT_DIMENSIONS = { width: 4, height: 3 } as const;
const SYNTHETIC_READBACK_DIMENSIONS = { width: 3, height: 3 } as const;

function publishBuildElevationInputs(
  context: ReturnType<typeof createMapContext>,
  width: number,
  height: number,
  landMask: Uint8Array,
  projectedLakeMask: Uint8Array,
  elevation = new Int16Array(width * height),
  seaLevel = 0,
  externalWaterMask = Uint8Array.from(landMask, (land) => land === 1 ? 0 : 1)
): void {
  const size = width * height;
  publishTestArtifact(context, morphologyLandformsArtifacts.topography, {
    elevation,
    seaLevel,
    landMask,
    externalWaterMask,
    bathymetry: new Int16Array(size),
  });
  publishTestArtifact(context, hydrographyArtifacts.hydrography, {
    ...createEmptyWaterFixture(width, height).hydrography,
    exposedLandMask: Uint8Array.from(externalWaterMask, (external, cell) => external === 0 && projectedLakeMask[cell] === 0 ? 1 : 0),
  });
  publishTestArtifact(context, hydrographyArtifacts.projectedLakes, {
    lakeMask: projectedLakeMask,
  });
  publishTestArtifact(context, hydrographyArtifacts.lakePlan, closedLakeProjectionFixture(width, height, projectedLakeMask));
}

function executeBuildElevation(
  context: ReturnType<typeof createMapContext>,
  width: number,
  height: number,
  landMask: Uint8Array,
  projectedLakeMask = new Uint8Array(width * height),
  elevation = new Int16Array(width * height),
  seaLevel = 0,
  externalWaterMask = Uint8Array.from(landMask, (land) => land === 1 ? 0 : 1)
) {
  return withMapContextExecutionForTest(context, (stepContext) => {
    publishBuildElevationInputs(
      stepContext,
      width,
      height,
      landMask,
      projectedLakeMask,
      elevation,
      seaLevel,
      externalWaterMask
    );
    const observation = BuildElevationStep.run(
      stepContext,
      {},
      {},
      buildStepTestDependencies(BuildElevationStep, stepContext)
    );
    if (observation instanceof Promise)
      throw new Error("Elevation projection must remain synchronous.");
    return observation;
  });
}

class ExplicitElevationAdapter extends MockAdapter {
  readonly elevationEvents: string[] = [];

  buildElevation(): void {
    throw new Error("Stock buildElevation must never overwrite explicit elevation.");
  }

  override setElevation(values: readonly number[]): void {
    this.elevationEvents.push("setElevation");
    super.setElevation(values);
  }

  override generateCliffsFromElevation(): void {
    this.elevationEvents.push("generateCliffsFromElevation");
    super.generateCliffsFromElevation();
  }

  override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
    this.elevationEvents.push("readCurrentMapElevationSnapshot");
    return super.readCurrentMapElevationSnapshot();
  }
}

class DriftAfterBuildElevationAdapter extends ExplicitElevationAdapter {
  override setElevation(values: readonly number[]): void {
    super.setElevation(values);
    // Simulate engine drift: cached water tables say "water" even though terrain remains land.
    this.setWater(0, 0, true);
  }
}

class ExcessiveDriftAfterBuildElevationAdapter extends ExplicitElevationAdapter {
  override setElevation(values: readonly number[]): void {
    super.setElevation(values);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setWater(x, y, true);
      }
    }
  }
}

class ReliefAfterBuildElevationAdapter extends ExplicitElevationAdapter {
  stampContinentsCalls = 0;
  storeWaterDataCalls = 0;

  override setElevation(values: readonly number[]): void {
    super.setElevation(values);
    // Simulate engine terrain differentiation without any water drift.
    this.setTerrainType(1, 1, this.getTerrainTypeIndex("TERRAIN_HILL"));
  }

  override stampContinents(): void {
    this.stampContinentsCalls += 1;
  }

  override storeWaterData(): void {
    this.storeWaterDataCalls += 1;
  }
}

function createExactProjectionFixture(adapter: ExplicitElevationAdapter) {
  const { width, height } = adapter;
  const landMask = Uint8Array.from([0, 1, 1, 1, 1, 1]);
  const lakeMask = Uint8Array.from([0, 0, 0, 0, 1, 0]);
  const elevation = Int16Array.from([-20, 5, 6, 8, 10, 15]);
  const seaLevel = 5;
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }),
    adapter,
  });
  for (let index = 0; index < landMask.length; index++) {
    const terrain =
      landMask[index] !== 1
        ? "TERRAIN_OCEAN"
        : lakeMask[index] === 1
          ? "TERRAIN_COAST"
          : "TERRAIN_FLAT";
    adapter.setTerrainType(
      index % width,
      Math.floor(index / width),
      adapter.getTerrainTypeIndex(terrain)
    );
  }
  adapter.stampLakes(width, height, lakeMask);
  return { context, landMask, lakeMask, elevation, seaLevel };
}

function executeExactProjectionFixture(adapter: ExplicitElevationAdapter) {
  const fixture = createExactProjectionFixture(adapter);
  return {
    ...fixture,
    observation: executeBuildElevation(
      fixture.context,
      adapter.width,
      adapter.height,
      fixture.landMask,
      fixture.lakeMask,
      fixture.elevation,
      fixture.seaLevel
    ),
  };
}

function createUnplannedNativeLakeFixture(
  options: {
    beforeLake?: boolean;
    afterLake?: boolean;
    beforeWater?: boolean;
    afterWater?: boolean;
    physicalLand?: boolean;
    changeTerrain?: boolean;
    terrain?: "TERRAIN_COAST" | "TERRAIN_OCEAN";
    adjustment?: number;
  } = {}
) {
  class NativeLakeAdapter extends ExplicitElevationAdapter {
    override getElevation(x: number, y: number): number {
      return super.getElevation(x, y) + (x === 0 && y === 0 ? (options.adjustment ?? 10) : 0);
    }

    override isLake(x: number, y: number): boolean {
      if (x !== 0 || y !== 0) return super.isLake(x, y);
      return this.calls.setElevation.length === 0
        ? (options.beforeLake ?? true)
        : (options.afterLake ?? true);
    }

    override isWater(x: number, y: number): boolean {
      if (x !== 0 || y !== 0) return super.isWater(x, y);
      return this.calls.setElevation.length === 0
        ? (options.beforeWater ?? true)
        : (options.afterWater ?? true);
    }

    override setElevation(values: readonly number[]): void {
      super.setElevation(values);
      if (options.changeTerrain)
        this.setTerrainType(0, 0, this.getTerrainTypeIndex("TERRAIN_OCEAN"));
    }

    override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
      return { ...super.readCurrentMapElevationSnapshot(), source: "native" };
    }
  }
  const width = 10;
  const height = 10;
  const adapter = new NativeLakeAdapter({ width, height });
  const landMask = new Uint8Array(width * height).fill(1);
  landMask[0] = options.physicalLand ? 1 : 0;
  for (let index = 0; index < landMask.length; index += 1) {
    adapter.setTerrainType(
      index % width,
      Math.floor(index / width),
      adapter.getTerrainTypeIndex(index === 0 ? (options.terrain ?? "TERRAIN_COAST") : "TERRAIN_FLAT")
    );
  }
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }),
    adapter,
  });
  const lakeMask = new Uint8Array(width * height);
  return { adapter, context, landMask, lakeMask, width, height };
}

describe("map-elevation/build-elevation", () => {
  it("writes newly dry initially wet finite ground and qualifies retained initially wet lake leveling", () => {
    class ResolvedNativeAdapter extends ExplicitElevationAdapter {
      override getElevation(x: number, y: number): number {
        return super.getElevation(x, y) + (x === 2 && y === 0 ? 0.25 : 0);
      }
      override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
        return { ...super.readCurrentMapElevationSnapshot(), source: "native" };
      }
    }
    const width = 3, height = 2;
    const adapter = new ResolvedNativeAdapter({ width, height });
    const landMask = Uint8Array.of(0, 0, 0, 1, 1, 1);
    const externalWaterMask = Uint8Array.of(1, 0, 0, 0, 0, 0);
    const lakeMask = Uint8Array.of(0, 0, 1, 0, 0, 0);
    const elevation = Int16Array.of(-20, -5, -8, 1, 2, 3);
    const context = createMapContext({ adapter, setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED, dimensions: { width, height }, latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    }) });
    for (let cell = 0; cell < landMask.length; cell++) {
      const terrain = externalWaterMask[cell] === 1 ? "TERRAIN_OCEAN" : lakeMask[cell] === 1 ? "TERRAIN_COAST" : "TERRAIN_FLAT";
      adapter.setTerrainType(cell % width, Math.floor(cell / width), adapter.getTerrainTypeIndex(terrain));
    }
    const before = landMask.slice();
    const observation = executeBuildElevation(context, width, height, landMask, lakeMask, elevation, 0, externalWaterMask);
    expect(observation.intended[0]).toBe(0);
    expect(observation.intended[1]).toBe(128);
    expect(observation.expectedLandMask[1]).toBe(1);
    expect(observation.expectedLandMask[2]).toBe(0);
    expect(adapter.isWater(1, 0)).toBe(false);
    expect(adapter.isWater(2, 0)).toBe(true);
    expect(observation.elevationProjection).toMatchObject({ acceptedInlandWaterAdjustmentCount: 1, nonLakeMismatchCount: 0 });
    expect(landMask).toEqual(before);
  });
  for (const phase of ["write", "cliffs", "area"] as const) {
    for (const lost of ["water", "terrain"] as const) {
      it(`preserves physical projection ${phase} ownership and accepted-water policy for ${lost} loss`, () => {
        class LakeDriftAdapter extends ExplicitElevationAdapter {
          private changed = false;
          private areaCalls = 0;
          beginProjection(): void {
            this.changed = false;
            this.areaCalls = 0;
          }
          override setElevation(values: readonly number[]): void {
            super.setElevation(values);
            if (phase === "write") this.changed = true;
          }
          override generateCliffsFromElevation(): void {
            super.generateCliffsFromElevation();
            if (phase === "cliffs") this.changed = true;
          }
          override recalculateAreas(): void {
            super.recalculateAreas();
            if (++this.areaCalls === 2 && phase === "area") this.changed = true;
          }
          override isWater(x: number, y: number): boolean {
            return this.changed && lost === "water" && x === 1 && y === 1 ? false : super.isWater(x, y);
          }
          override getTerrainType(x: number, y: number): number {
            return this.changed && lost === "terrain" && x === 1 && y === 1
              ? this.getTerrainTypeIndex("TERRAIN_OCEAN") : super.getTerrainType(x, y);
          }
        }
        {
          const width = 10;
          const height = 10;
          const adapter = new LakeDriftAdapter({ width, height });
          const context = createMapContext({ setup: admitMapSetup({ mapSeed: TEST_MAP_SEED, dimensions: { width, height }, latitudeBounds: { topLatitude: 60, bottomLatitude: -60 } }), adapter });
          const landMask = new Uint8Array(width * height).fill(1);
          const lakeMask = new Uint8Array(width * height);
          lakeMask[11] = 1;
          for (let cell = 0; cell < landMask.length; cell++) adapter.setTerrainType(cell % width, Math.floor(cell / width), adapter.getTerrainTypeIndex(cell === 11 ? "TERRAIN_COAST" : "TERRAIN_FLAT"));
          adapter.stampLakes(width, height, lakeMask);
          adapter.beginProjection();
          const run = () => executeBuildElevation(context, width, height, landMask, lakeMask, new Int16Array(width * height), 0);
          if (phase !== "cliffs") expect(run).toThrow(/post-build.*certified accepted lake footprint lost/);
          else expect(run).not.toThrow();
          expect(adapter.calls.generateCliffsFromElevation).toBe(0);
        }
      });
    }
  }

  it.each([
    { before: false, after: false, error: 0, expected: null },
    { before: true, after: false, error: 0, expected: null },
    { before: false, after: false, error: 0.25, expected: null },
    { before: true, after: false, error: 0.25, expected: "unqualified accepted inland-water numeric mismatch" },
    { before: false, after: true, error: 0.25, expected: "unqualified accepted inland-water numeric mismatch" },
  ])("keeps physical coast water independent of native class and qualifies numeric exceptions: %j", (state) => {
    class ClassifiedWaterAdapter extends ExplicitElevationAdapter {
      override isLake(x: number, y: number): boolean {
        if (x !== 1 || y !== 1) return super.isLake(x, y);
        return this.calls.setElevation.length === 0 ? state.before : state.after;
      }
      override getElevation(x: number, y: number): number {
        return super.getElevation(x, y) + (x === 1 && y === 1 ? state.error : 0);
      }
    }
    const adapter = new ClassifiedWaterAdapter({ width: 3, height: 2 });
    const fixture = createExactProjectionFixture(adapter);
    const run = () => executeBuildElevation(fixture.context, 3, 2, fixture.landMask, fixture.lakeMask, fixture.elevation, fixture.seaLevel);
    if (state.expected) expect(run).toThrow(state.expected);
    else {
      const result = run();
      expect(result.elevationProjection.mismatchCount).toBe(state.error === 0 ? 0 : 1);
      expect(result.elevationProjection.acceptedInlandWaterAdjustmentCount).toBe(state.error === 0 ? 0 : 1);
      expect(result.elevationProjection.lakeAdjustmentCount).toBe(0);
      expect(result.elevationProjection.nonLakeMismatchCount).toBe(0);
      expect(adapter.isWater(1, 1)).toBe(true);
      expect(adapter.getTerrainType(1, 1)).toBe(adapter.getTerrainTypeIndex("TERRAIN_COAST"));
      expect(adapter.isLake(1, 1)).toBe(false);
    }
    expect(Array.from(fixture.lakeMask)).toEqual([0, 0, 0, 0, 1, 0]);
  });
  it("writes elevation once and leaves cliffs to finalized authored rivers", () => {
    const adapter = new ExplicitElevationAdapter({ width: 3, height: 2 });
    const fixture = createExactProjectionFixture(adapter);
    executeBuildElevation(fixture.context, 3, 2, fixture.landMask, fixture.lakeMask,
      fixture.elevation, fixture.seaLevel);
    expect(adapter.elevationEvents).toEqual(["setElevation", "readCurrentMapElevationSnapshot"]);
    expect(adapter.calls.setElevation).toHaveLength(1);
    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(adapter.calls.setRiverInfo).toEqual([]);
    expect(adapter.calls.finalizeRivers).toEqual([]);
  });

  it("retains the certified accepted-lake numeric leveling exception with stable water and lake identity", () => {
    class LeveledLakeAdapter extends ExplicitElevationAdapter {
      override getElevation(x: number, y: number): number {
        return super.getElevation(x, y) + (x === 1 && y === 1 ? 0.25 : 0);
      }
    }
    const adapter = new LeveledLakeAdapter({ width: 3, height: 2 });
    const fixture = createExactProjectionFixture(adapter);
    adapter.stampLakes(3, 2, fixture.lakeMask);
    const observation = executeBuildElevation(fixture.context, 3, 2, fixture.landMask, fixture.lakeMask, fixture.elevation, fixture.seaLevel);
    expect(observation.elevationProjection.lakeAdjustmentCount).toBe(1);
    expect(observation.elevationProjection.nonLakeMismatchCount).toBe(0);
  });

  it.each(["land-before", "land-after", "terrain-before", "terrain-after", "original-water"] as const)(
    "refuses an accepted-mask numeric adjustment with unqualified %s with complete physical footprint guards",
    (mutation) => {
      class UnqualifiedAcceptedAdapter extends ExplicitElevationAdapter {
        override isLake(): boolean { return false; }
        override isWater(x: number, y: number): boolean {
          const after = this.calls.setElevation.length > 0;
          if (x === 1 && y === 1 && mutation === (after ? "land-after" : "land-before")) return false;
          return super.isWater(x, y);
        }
        override getTerrainType(x: number, y: number): number {
          const after = this.calls.setElevation.length > 0;
          if (x === 1 && y === 1 && mutation === (after ? "terrain-after" : "terrain-before"))
            return this.getTerrainTypeIndex("TERRAIN_OCEAN");
          return super.getTerrainType(x, y);
        }
        override getElevation(x: number, y: number): number {
          return super.getElevation(x, y) + (x === 1 && y === 1 ? 0.25 : 0);
        }
      }
      const adapter = new UnqualifiedAcceptedAdapter({ width: 3, height: 2 });
      const fixture = createExactProjectionFixture(adapter);
      if (mutation === "original-water") fixture.landMask[4] = 0;
      expect(() => executeBuildElevation(fixture.context, 3, 2, fixture.landMask, fixture.lakeMask,
        fixture.elevation, fixture.seaLevel)).toThrow();
    }
  );

  it("accepts stable inland coast-water numeric changes without a body-uniformity admission rule", () => {
    class CoastWaterAdapter extends ExplicitElevationAdapter {
      override isLake(): boolean { return false; }
      override getElevation(x: number, y: number): number {
        return super.getElevation(x, y) + (y === 1 && x < 2 ? x + 0.25 : 0);
      }
    }
    const adapter = new CoastWaterAdapter({ width: 3, height: 2 });
    const fixture = createExactProjectionFixture(adapter);
    fixture.lakeMask[3] = 1;
    adapter.setTerrainType(0, 1, adapter.getTerrainTypeIndex("TERRAIN_COAST"));
    const result = executeBuildElevation(fixture.context, 3, 2, fixture.landMask, fixture.lakeMask,
      fixture.elevation, fixture.seaLevel);
    expect(result.elevationProjection).toMatchObject({
      mismatchCount: 2, acceptedInlandWaterAdjustmentCount: 2, lakeAdjustmentCount: 0,
      nonLakeMismatchCount: 0, unplannedNativeLakeMismatchCount: 0,
    });
    expect(result.engine.elevation[3]).not.toBe(result.engine.elevation[4]);
    expect(Array.from(fixture.lakeMask)).toEqual([0, 0, 0, 1, 1, 0]);
  });
  it("writes immutable physics-derived heights before exact observation without early cliff mutation", () => {
    const adapter = new ExplicitElevationAdapter({ width: 3, height: 2 });
    const { observation, elevation, landMask, lakeMask, seaLevel } =
      executeExactProjectionFixture(adapter);
    const intended = projectStandardElevation({
      elevation,
      landMask,
      acceptedLakeMask: lakeMask,
      seaLevel,
    });
    expect(adapter.elevationEvents).toEqual([
      "setElevation",
      "readCurrentMapElevationSnapshot",
    ]);
    expect(BuildElevationStep.contract.engine).not.toContain("buildElevation");
    expect(adapter.calls.setElevation).toEqual([intended]);
    expect(Array.from(observation.engine.elevation)).toEqual(intended);
    expect(Array.from(elevation)).toEqual([-20, 5, 6, 8, 10, 15]);
    expect(Array.from(landMask)).toEqual([0, 1, 1, 1, 1, 1]);
    expect(observation.elevationProjection).toMatchObject({
      phase: "post-write",
      source: "mock",
      status: "mock-only",
      mismatchCount: 0,
      nonLakeMismatchCount: 0,
      lakeAdjustmentCount: 0,
      unplannedNativeLakeMismatchCount: 0,
    });
    const metrics = BuildElevationStep.metrics?.({
      observation,
      config: {},
      dimensions: { width: 3, height: 2 },
    });
    expect(metrics?.["map.elevation.postWrite"]).toBe(observation.elevationProjection);
  });

  it("refuses unavailable immediate numeric evidence after dispatch", () => {
    class UnavailableReadbackAdapter extends ExplicitElevationAdapter {
      override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
        return {
          source: "mock",
          status: "unavailable",
          width: this.width,
          height: this.height,
          reason: "getter-unavailable",
        };
      }
    }
    const adapter = new UnavailableReadbackAdapter({ width: 3, height: 2 });
    expect(() => executeExactProjectionFixture(adapter)).toThrow(
      "requires available exact numeric readback"
    );
    expect(adapter.calls.setElevation.length).toBe(1);
    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
  });

  it("refuses fractional non-lake readback drift instead of truncating or tolerating it", () => {
    class DriftingReadbackAdapter extends ExplicitElevationAdapter {
      override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
        const snapshot = super.readCurrentMapElevationSnapshot();
        if (snapshot.status === "available") snapshot.values[1]! += 0.25;
        return snapshot;
      }
    }
    expect(() =>
      executeExactProjectionFixture(new DriftingReadbackAdapter({ width: 3, height: 2 }))
    ).toThrow("unqualified external-water numeric mismatch at plot 1");
  });

  it("records stable preexisting native-lake leveling without changing authored intent or masks", () => {
    const { adapter, context, landMask, lakeMask, width, height } =
      createUnplannedNativeLakeFixture();
    const originalLog = console.log;
    console.log = () => {};
    try {
      const observation = executeBuildElevation(context, width, height, landMask, lakeMask);
      expect(observation.elevationProjection).toMatchObject({
        status: "observed",
        mismatchCount: 1,
        lakeAdjustmentCount: 0,
        unplannedNativeLakeMismatchCount: 1,
        nonLakeMismatchCount: 0,
        maximumAbsoluteError: 10,
        examples: [{ plotIndex: 0, intended: 0, observed: 10 }],
      });
      expect(observation.intended[0]).toBe(0);
      expect(adapter.calls.setElevation[0]?.[0]).toBe(0);
      expect(observation.engine.elevation[0]).toBe(10);
      expect(landMask[0]).toBe(0);
      expect(Array.from(lakeMask)).toEqual(new Array(width * height).fill(0));
    } finally {
      console.log = originalLog;
    }
  });

  for (const terrain of ["TERRAIN_COAST", "TERRAIN_OCEAN"] as const) {
    for (const adjustment of [10, 0.25, -128]) {
      it(`observes stable original ${terrain} adjustment ${adjustment} without requiring lake classification`, () => {
        const { adapter, context, landMask, lakeMask, width, height } =
          createUnplannedNativeLakeFixture({ beforeLake: false, afterLake: false, terrain, adjustment });
        const originalLog = console.log;
        console.log = () => {};
        try {
          const observation = executeBuildElevation(context, width, height, landMask, lakeMask);
          expect(observation.intended[0]).toBe(0);
          expect(adapter.calls.setElevation[0]?.[0]).toBe(0);
          expect(observation.engine.elevation[0]).toBe(adjustment);
          expect(observation.elevationProjection).toMatchObject({
            mismatchCount: 1, nonLakeMismatchCount: 1, lakeAdjustmentCount: 0,
            unplannedNativeLakeMismatchCount: 0, acceptedInlandWaterAdjustmentCount: 0,
            maximumAbsoluteError: Math.abs(adjustment),
          });
          expect(landMask[0]).toBe(0);
          expect(Array.from(lakeMask)).toEqual(new Array(width * height).fill(0));
        } finally {
          console.log = originalLog;
        }
      });
    }
  }

  for (const { name, options } of [
    { name: "newly classified native lake", options: { beforeLake: false } },
    { name: "physical land hidden by native lake classification", options: { physicalLand: true } },
    { name: "native lake with changed terrain", options: { changeTerrain: true } },
    { name: "native lake without preexisting water", options: { beforeWater: false } },
    { name: "native lake no longer classified as water", options: { afterWater: false } },
    {
      name: "non-lake water hiding physical land",
      options: { beforeLake: false, afterLake: false, physicalLand: true },
    },
    {
      name: "non-lake water changing terrain",
      options: { beforeLake: false, afterLake: false, changeTerrain: true },
    },
    {
      name: "non-lake water disappearing",
      options: { beforeLake: false, afterLake: false, afterWater: false },
    },
    {
      name: "non-lake water appearing during the write",
      options: { beforeLake: false, afterLake: false, beforeWater: false },
    },
    {
      name: "native lake becoming non-lake water",
      options: { beforeLake: true, afterLake: false },
    },
  ]) {
    it(`refuses ${name}`, () => {
      const { context, landMask, lakeMask, width, height } =
        createUnplannedNativeLakeFixture(options);
      const originalLog = console.log;
      console.log = () => {};
      try {
        expect(() => executeBuildElevation(context, width, height, landMask, lakeMask)).toThrow(
          "unqualified external-water numeric mismatch at plot 0"
        );
      } finally {
        console.log = originalLog;
      }
    });
  }

  it("observes accepted-lake leveling separately and emits complete bounded native evidence", () => {
    class NativeLakeReadbackAdapter extends ExplicitElevationAdapter {
      override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
        const snapshot = super.readCurrentMapElevationSnapshot();
        if (snapshot.status === "available") snapshot.values[4]! -= 0.25;
        return { ...snapshot, source: "native" };
      }
    }
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (message?: unknown) => {
      if (typeof message === "string") logs.push(message);
    };
    try {
      const { observation, lakeMask } = executeExactProjectionFixture(
        new NativeLakeReadbackAdapter({ width: 3, height: 2 })
      );
      expect(observation.elevationProjection).toMatchObject({
        source: "native",
        status: "observed",
        mismatchCount: 1,
        nonLakeMismatchCount: 0,
        lakeAdjustmentCount: 1,
        unplannedNativeLakeMismatchCount: 0,
      });
      const numericLogs = logs.filter((line) => line.startsWith("[elevation-projection]"));
      expect(numericLogs.length).toBeGreaterThan(0);
      expect(numericLogs.every((line) => line.length <= 900)).toBe(true);
      expect(decodeBoundedJsonLogSeries(numericLogs, "[elevation-projection]")[0]?.payload).toEqual(
        {
          phase: "post-write",
          intended: observation.intended,
          mapSeed: TEST_MAP_SEED,
          dimensions: { width: 3, height: 2 },
          observed: Array.from(observation.engine.elevation),
          acceptedLakeMask: Array.from(lakeMask),
          observedLakeMask: Array.from(lakeMask),
          measurements: observation.elevationProjection,
        }
      );
      logs.length = 0;
      executeExactProjectionFixture(new ExplicitElevationAdapter({ width: 3, height: 2 }));
      expect(logs.some((line) => line.startsWith("[elevation-projection]"))).toBe(false);
      expect(logs.some((line) => line.startsWith("[elevation-projection-surfaces]"))).toBe(false);
    } finally {
      console.log = originalLog;
    }
  });

  it("logs complete native numeric evidence before refusing drift without temporary isolation reads", () => {
    class NativeDriftReadbackAdapter extends ExplicitElevationAdapter {
      private phase = 0;

      override setElevation(values: readonly number[]): void {
        super.setElevation(values);
        this.phase = 2;
        this.setTerrainType(0, 0, this.getTerrainTypeIndex("TERRAIN_FLAT"));
      }

      override getElevation(x: number, y: number): number {
        const plotIndex = y * this.width + x;
        const intended = super.getElevation(x, y);
        if (this.phase === 0 || plotIndex > 48) return intended;
        return intended + (plotIndex === 0 ? 10 : this.phase);
      }

      override isLake(x: number, y: number): boolean {
        const plotIndex = y * this.width + x;
        return plotIndex === 0 ? this.phase < 2 : plotIndex <= 48;
      }

      override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
        return { ...super.readCurrentMapElevationSnapshot(), source: "native" };
      }
    }
    const width = 10;
    const height = 10;
    const adapter = new NativeDriftReadbackAdapter({ width, height });
    const landMask = new Uint8Array(width * height).fill(1);
    landMask[0] = 0;
    const lakeMask = new Uint8Array(width * height);
    lakeMask.fill(1, 1, 49);
    const context = createMapContext({
      setup: admitMapSetup({
        mapSeed: TEST_MAP_SEED,
        dimensions: { width, height },
        latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
      }),
      adapter,
    });
    for (let index = 0; index < landMask.length; index += 1) {
      adapter.setTerrainType(
        index % width,
        Math.floor(index / width),
        adapter.getTerrainTypeIndex(
          index === 0 ? "TERRAIN_OCEAN" : lakeMask[index] === 1 ? "TERRAIN_COAST" : "TERRAIN_FLAT"
        )
      );
    }
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (message?: unknown) => {
      if (typeof message === "string") logs.push(message);
    };
    try {
      expect(() => executeBuildElevation(context, width, height, landMask, lakeMask)).toThrow(
        "unqualified external-water numeric mismatch at plot 0"
      );
      expect(adapter.elevationEvents).toEqual([
        "setElevation",
        "readCurrentMapElevationSnapshot",
      ]);
      expect(BuildElevationStep.contract.engine).toContain("readCurrentMapLakeMask");
      expect(logs.some((line) => line.startsWith("[elevation-projection-surfaces]"))).toBe(false);
      const numericLogs = logs.filter((line) => line.startsWith("[elevation-projection]"));
      expect(numericLogs.length).toBeGreaterThan(1);
      expect(numericLogs.every((line) => line.length <= 900)).toBe(true);
      expect(
        decodeBoundedJsonLogSeries(numericLogs, "[elevation-projection]")[0]?.payload
      ).toMatchObject({
        phase: "post-write",
        mapSeed: TEST_MAP_SEED,
        dimensions: { width, height },
        intended: Array.from({ length: width * height }, (_, index) => (index === 0 ? 0 : 128)),
        observed: Array.from({ length: width * height }, (_, index) =>
          index === 0 ? 10 : index <= 48 ? 130 : 128
        ),
        acceptedLakeMask: Array.from(lakeMask),
        measurements: { mismatchCount: 49, nonLakeMismatchCount: 1, lakeAdjustmentCount: 48 },
      });
    } finally {
      console.log = originalLog;
    }
  });

  it("allows bounded post-write land/water drift and logs the policy report", () => {
    const { width, height } = SYNTHETIC_BOUNDED_DRIFT_DIMENSIONS;
    const mapInfo = { GridWidth: width, GridHeight: height };
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: SYNTHETIC_BOUNDED_DRIFT_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new DriftAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(TEST_MAP_SEED),
    });
    const context = createMapContext({ setup, adapter });
    const { TERRAIN_FLAT: flatTerrain, TERRAIN_OCEAN: oceanTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;

    const size = width * height;
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    // Seed the plotted terrain snapshot: flat land where landMask=1, ocean otherwise.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        adapter.setTerrainType(x, y, landMask[idx] === 1 ? flatTerrain : oceanTerrain);
        adapter.setWater(x, y, landMask[idx] !== 1);
      }
    }

    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args: unknown[]) => {
      logs.push(args.join(" "));
    };

    try {
      executeBuildElevation(context, width, height, landMask);
    } finally {
      console.log = originalLog;
    }

    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(logs.some((line) => line.includes("WATER_DRIFT_POLICY_V1"))).toBe(true);
    expect(logs.some((line) => line.includes('"mismatchCount":1'))).toBe(true);
    expect(logs.some((line) => line.includes('"withinPolicy":true'))).toBe(true);
  });

  it("fails when post-write drift exceeds the policy budget", () => {
    const { width, height } = SYNTHETIC_EXCESSIVE_DRIFT_DIMENSIONS;
    const mapInfo = { GridWidth: width, GridHeight: height };
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: SYNTHETIC_EXCESSIVE_DRIFT_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new ExcessiveDriftAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(TEST_MAP_SEED),
    });
    const context = createMapContext({ setup, adapter });
    const flatTerrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, flatTerrain);
        adapter.setWater(x, y, false);
      }
    }

    const originalLog = console.log;
    console.log = () => {};
    try {
      expect(() =>
        executeBuildElevation(context, width, height, new Uint8Array(width * height).fill(1))
      ).toThrow(/map-elevation\/build-elevation.*land\/water drift .*exceeds policy max/);
    } finally {
      console.log = originalLog;
    }

    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
  });

  it("keeps post-write terrain when no water drift is detected", () => {
    const { width, height } = SYNTHETIC_READBACK_DIMENSIONS;
    const mapInfo = { GridWidth: width, GridHeight: height };
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: SYNTHETIC_READBACK_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(TEST_MAP_SEED),
    });
    const context = createMapContext({ setup, adapter });
    const { TERRAIN_FLAT: flatTerrain, TERRAIN_HILL: hillTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, flatTerrain);
      }
    }
    executeBuildElevation(context, width, height, new Uint8Array(width * height).fill(1));

    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(adapter.getTerrainType(1, 1)).toBe(hillTerrain);
    expect(adapter.stampContinentsCalls).toBe(0);
    expect(adapter.storeWaterDataCalls).toBe(0);
  });

  it("rejects unexplained engine water before elevation mutates the surface", () => {
    const { width, height } = SYNTHETIC_READBACK_DIMENSIONS;
    const mapInfo = { GridWidth: width, GridHeight: height };
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: SYNTHETIC_READBACK_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });
    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(TEST_MAP_SEED),
    });
    const context = createMapContext({ setup, adapter });
    const flatTerrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) adapter.setTerrainType(x, y, flatTerrain);
    }
    adapter.setWater(0, 0, true);

    const originalLog = console.log;
    console.log = () => {};
    try {
      expect(() =>
        executeBuildElevation(context, width, height, new Uint8Array(width * height).fill(1))
      ).toThrow(/map-elevation\/build-elevation\/pre-build.*exceeds policy max/);
    } finally {
      console.log = originalLog;
    }

    expect(adapter.calls.setElevation).toEqual([]);
    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
  });

  it("treats engine-accepted lakes as expected water during elevation readback", () => {
    const { width, height } = SYNTHETIC_READBACK_DIMENSIONS;
    const mapInfo = { GridWidth: width, GridHeight: height };
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: SYNTHETIC_READBACK_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(TEST_MAP_SEED),
    });
    const context = createMapContext({ setup, adapter });
    const { TERRAIN_COAST: coastTerrain, TERRAIN_FLAT: flatTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    const lakeMask = new Uint8Array(width * height);
    lakeMask[0] = 1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        adapter.setTerrainType(x, y, lakeMask[idx] === 1 ? coastTerrain : flatTerrain);
        adapter.setWater(x, y, lakeMask[idx] === 1);
      }
    }
    executeBuildElevation(context, width, height, new Uint8Array(width * height).fill(1), lakeMask);

    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(adapter.isWater(0, 0)).toBe(true);
  });

  it("does not turn rejected lake intent into expected engine water", () => {
    const { width, height } = SYNTHETIC_READBACK_DIMENSIONS;
    const mapInfo = { GridWidth: width, GridHeight: height };
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: SYNTHETIC_READBACK_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = new ReliefAfterBuildElevationAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(TEST_MAP_SEED),
    });
    const context = createMapContext({ setup, adapter });
    const flatTerrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        adapter.setTerrainType(x, y, flatTerrain);
        adapter.setWater(x, y, false);
      }
    }
    executeBuildElevation(context, width, height, new Uint8Array(width * height).fill(1));

    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(adapter.isWater(0, 0)).toBe(false);
  });
});
