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
  seaLevel = 0
): void {
  const size = width * height;
  publishTestArtifact(context, morphologyLandformsArtifacts.topography, {
    elevation,
    seaLevel,
    landMask,
    bathymetry: new Int16Array(size),
  });
  publishTestArtifact(context, hydrographyArtifacts.projectedLakes, {
    lakeMask: projectedLakeMask,
  });
}

function executeBuildElevation(
  context: ReturnType<typeof createMapContext>,
  width: number,
  height: number,
  landMask: Uint8Array,
  projectedLakeMask = new Uint8Array(width * height),
  elevation = new Int16Array(width * height),
  seaLevel = 0
) {
  return withMapContextExecutionForTest(context, (stepContext) => {
    publishBuildElevationInputs(
      stepContext,
      width,
      height,
      landMask,
      projectedLakeMask,
      elevation,
      seaLevel
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
  override generateCliffsFromElevation(): void {
    super.generateCliffsFromElevation();
    // Simulate engine drift: cached water tables say "water" even though terrain remains land.
    this.setWater(0, 0, true);
  }
}

class ExcessiveDriftAfterBuildElevationAdapter extends ExplicitElevationAdapter {
  override generateCliffsFromElevation(): void {
    super.generateCliffsFromElevation();
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

  override generateCliffsFromElevation(): void {
    super.generateCliffsFromElevation();
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
  } = {}
) {
  class NativeLakeAdapter extends ExplicitElevationAdapter {
    override getElevation(x: number, y: number): number {
      return super.getElevation(x, y) + (x === 0 && y === 0 ? 10 : 0);
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

    override generateCliffsFromElevation(): void {
      super.generateCliffsFromElevation();
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
      adapter.getTerrainTypeIndex(index === 0 ? "TERRAIN_COAST" : "TERRAIN_FLAT")
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
  it("writes immutable physics-derived heights before cliffs and exact observation", () => {
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
      "generateCliffsFromElevation",
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
    expect(adapter.calls.generateCliffsFromElevation).toBe(1);
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
    ).toThrow("1 non-lake numeric mismatches");
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

  for (const { name, options, error } of [
    { name: "newly classified native lake", options: { beforeLake: false } },
    { name: "physical land hidden by native lake classification", options: { physicalLand: true } },
    { name: "native lake with changed terrain", options: { changeTerrain: true } },
    { name: "native lake without preexisting water", options: { beforeWater: false } },
    { name: "native lake no longer classified as water", options: { afterWater: false } },
    {
      name: "ordinary ocean numeric drift",
      options: { beforeLake: false, afterLake: false },
      error: "1 non-lake numeric mismatches",
    },
  ]) {
    it(`refuses ${name}`, () => {
      const { context, landMask, lakeMask, width, height } =
        createUnplannedNativeLakeFixture(options);
      const originalLog = console.log;
      console.log = () => {};
      try {
        expect(() => executeBuildElevation(context, width, height, landMask, lakeMask)).toThrow(
          error ?? "unqualified unplanned native-lake numeric mismatch at plot 0"
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
        this.phase = 1;
      }

      override generateCliffsFromElevation(): void {
        super.generateCliffsFromElevation();
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
        "1 non-lake numeric mismatches"
      );
      expect(adapter.elevationEvents).toEqual([
        "setElevation",
        "generateCliffsFromElevation",
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

  it("allows bounded post-cliff land/water drift and logs the policy report", () => {
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

    expect(adapter.calls.generateCliffsFromElevation).toBe(1);
    expect(logs.some((line) => line.includes("WATER_DRIFT_POLICY_V1"))).toBe(true);
    expect(logs.some((line) => line.includes('"mismatchCount":1'))).toBe(true);
    expect(logs.some((line) => line.includes('"withinPolicy":true'))).toBe(true);
  });

  it("fails when post-cliff drift exceeds the policy budget", () => {
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

    expect(adapter.calls.generateCliffsFromElevation).toBe(1);
  });

  it("keeps post-cliff terrain when no water drift is detected", () => {
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

    expect(adapter.calls.generateCliffsFromElevation).toBe(1);
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

    expect(adapter.calls.generateCliffsFromElevation).toBe(1);
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

    expect(adapter.calls.generateCliffsFromElevation).toBe(1);
    expect(adapter.isWater(0, 0)).toBe(false);
  });
});
