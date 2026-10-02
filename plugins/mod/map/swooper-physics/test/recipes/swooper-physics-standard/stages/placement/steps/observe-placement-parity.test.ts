import { describe, expect, it } from "bun:test";

import {
  type CurrentMapElevationSnapshot,
  type RiverProjectionResult,
  MockAdapter,
} from "@civ7/adapter";
import type { ArtifactValueOf } from "@swooper/mapgen-core/authoring";
import { Value } from "typebox/value";
import { artifacts as hydrographyArtifacts } from "../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { ObservePlacementParityStep } from "../../../../../../src/recipes/standard/stages/placement/steps/observe-placement-parity/step.js";
import { createEmptyWaterFixture } from "../../morphology/features/fixtures/surface-water.js";
import { projectStandardElevation } from "../../../../../../src/recipes/standard/elevation-projection.js";
import { TEST_MAP_LATITUDE_BOUNDS, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";
import { StandardFinalRiverParityMeasurementsSchema } from "../../../../../../src/recipes/standard/metrics/families/hydrology/final-river-parity.js";

type ProjectedRivers = ArtifactValueOf<typeof hydrographyArtifacts.projectedRivers>;
function riverIntent(
  sources: readonly (readonly [number, "MINOR" | "NAVIGABLE"])[] = []
): ProjectedRivers {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const minor = new Uint8Array(width * height),
    major = new Uint8Array(width * height);
  for (const [cell, kind] of sources) (kind === "MINOR" ? minor : major)[cell] = 1;
  return {
    model: "certified-sill-spill",
    width,
    height,
    riverMask: major,
    nativeMinorRiverMask: minor,
    plannedMinorRiverMask: minor,
    plannedMajorRiverMask: major,
    plannedMinorRiverTileCount: sources.filter(([, kind]) => kind === "MINOR").length,
    plannedMajorRiverTileCount: sources.filter(([, kind]) => kind === "NAVIGABLE").length,
    authoredSourceCount: sources.length,
    wetTransitionWrites: [],
    wetTransitionDispositions: [],
    writes: sources.map(([sourceCell, riverClass]) => ({
      sourceCell,
      receiverCell: sourceCell + 1,
      direction: "EAST",
      riverClass,
    })),
  };
}

function createLandAdapter(Adapter: typeof MockAdapter = MockAdapter): MockAdapter {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const adapter = new Adapter({
    width,
    height,
    rng: createLabelRng(TEST_MAP_SEED),
    mapInfo: TEST_MAP_SIZE.mapInfo,
    mapSizeId: TEST_MAP_SIZE.id,
  });
  const flatTerrain = adapter.getTerrainTypeIndex("TERRAIN_FLAT");
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      adapter.setTerrainType(x, y, flatTerrain);
    }
  }
  return adapter;
}

function executeParity(
  adapter: MockAdapter,
  projectedLakeMask: Uint8Array,
  elevation = new Int16Array(TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height),
  seaLevel = 0,
  landMask = new Uint8Array(TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height).fill(
    1
  ),
  projectedRivers: ProjectedRivers = riverIntent()
) {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const size = width * height;
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    }),
    adapter,
  });
  const messages: string[] = [];
  const originalLog = console.log;
  console.log = (message?: unknown) => {
    if (typeof message === "string") messages.push(message);
  };
  try {
    const result = withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyErosionArtifacts.topography, {
        elevation,
        seaLevel,
        landMask,
        externalWaterMask: Uint8Array.from(landMask, (land) => land === 0 ? 1 : 0),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, {
        lakeMask: projectedLakeMask,
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
        ...createEmptyWaterFixture(width, height).hydrography,
        exposedLandMask: Uint8Array.from(landMask, (land, cell) => land === 1 && projectedLakeMask[cell] === 0 ? 1 : 0),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.projectedRivers, projectedRivers);
      const executionResult = ObservePlacementParityStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(ObservePlacementParityStep, stepContext)
      );
      if (executionResult instanceof Promise) {
        throw new Error("Placement parity observation must remain synchronous.");
      }
      return executionResult;
    });
    return {
      result,
      parityMessages: messages.filter((message) =>
        message.startsWith("[SWOOPER_MOD] PLACEMENT_PARITY_V1 ")
      ),
      elevationMessages: messages.filter((message) => message.startsWith("[elevation-projection]")),
      riverMessages: messages.filter((message) =>
        message.startsWith("[SWOOPER_MOD] FINAL_RIVER_PARITY_V1 ")
      ),
    };
  } finally {
    console.log = originalLog;
  }
}

describe("placement/observe-placement-parity", () => {
  it("emits complete final source classes and detects later MINOR/NAV changes without repair or abort", () => {
    class LateMutationAdapter extends MockAdapter {
      lateTypes = new Map<number, number>();
      override getRiverType(x: number, y: number): number {
        return this.lateTypes.get(y * this.width + x) ?? super.getRiverType(x, y);
      }
    }
    const adapter = createLandAdapter(LateMutationAdapter) as LateMutationAdapter;
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const first = width + 1,
      second = width + 3,
      third = width + 5,
      extra = width + 7;
    const intent = riverIntent([
      [first, "MINOR"],
      [second, "NAVIGABLE"],
      [third, "MINOR"],
    ]);
    for (const write of intent.writes)
      adapter.setRiverInfo({
        x: write.sourceCell % width,
        y: 1,
        direction: write.direction,
        riverClass: write.riverClass,
      });
    adapter.finalizeRivers([false, 25, 2, 2]);
    const minorType = adapter.getRiverType(first % width, 1),
      majorType = adapter.getRiverType(second % width, 1),
      noneType = adapter.getRiverType(0, 0);
    const observe = () =>
      executeParity(
        adapter,
        new Uint8Array(width * height),
        undefined,
        undefined,
        undefined,
        intent
      );
    const stable = observe();
    expect(stable.result.finalRiverParity).toMatchObject({
      status: "observed",
      missingSourceCount: 0,
      extraSourceCount: 0,
      wrongClassCount: 0,
      navigableTerrainMismatchCount: 0,
    });
    expect(stable.riverMessages.length).toBeGreaterThan(0);
    adapter.lateTypes.set(first, noneType);
    adapter.lateTypes.set(second, minorType);
    adapter.lateTypes.set(third, majorType);
    adapter.lateTypes.set(extra, majorType);
    adapter.setTerrainType(second % width, 1, adapter.getTerrainTypeIndex("TERRAIN_FLAT"));
    adapter.setTerrainType(
      extra % width,
      1,
      adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER")
    );
    const changed = observe();
    expect(changed.result.finalRiverParity).toMatchObject({
      status: "observed",
      intendedMinorSourceCount: 2,
      intendedNavigableSourceCount: 1,
      intendedSourceRows: [
        [first, "MINOR"],
        [second, "NAVIGABLE"],
        [third, "MINOR"],
      ],
      observedSourceRows: [
        [second, "MINOR"],
        [third, "NAVIGABLE"],
        [extra, "NAVIGABLE"],
      ],
      missingSourceCount: 1,
      extraSourceCount: 1,
      wrongClassCount: 2,
      navigableTerrainMismatchCount: 2,
      missingSourceCells: [first],
      extraSourceCells: [extra],
      wrongClassCells: [second, third],
      navigableTerrainMismatchCells: [second, extra],
    });
    expect(
      Value.Check(StandardFinalRiverParityMeasurementsSchema, changed.result.finalRiverParity)
    ).toBe(true);
    expect(changed.riverMessages.every((line) => line.length <= 900)).toBe(true);
    expect(
      decodeBoundedJsonLogSeries(changed.riverMessages, "FINAL_RIVER_PARITY_V1")[0]?.payload
    ).toEqual({
      mapSeed: TEST_MAP_SEED,
      dimensions: { width, height },
      ...changed.result.finalRiverParity,
    });
    expect(
      ObservePlacementParityStep.metrics?.({
        observation: changed.result,
        config: {},
        dimensions: { width, height },
      })?.["map.rivers.finalParity"]
    ).toBe(changed.result.finalRiverParity);
    expect(adapter.calls.setRiverInfo).toHaveLength(3);
    expect(adapter.calls.finalizeRivers).toHaveLength(1);
  });

  it("records unavailable final metadata instead of invented zero mismatches", () => {
    class UnsupportedAdapter extends MockAdapter {
      override readRiverProjection(
        width: number,
        height: number,
        mask: ArrayLike<number>
      ): RiverProjectionResult {
        return {
          ...super.readRiverProjection(width, height, mask),
          minorRiverStampingSupported: false,
          minorRiverUnsupportedReason: "type path missing",
        };
      }
    }
    class FailedAdapter extends MockAdapter {
      override readRiverProjection(): RiverProjectionResult {
        throw new Error("native read failed");
      }
    }
    for (const Adapter of [UnsupportedAdapter, FailedAdapter]) {
      const adapter = createLandAdapter(Adapter);
      const { width, height } = TEST_MAP_SIZE.dimensions;
      const { result, riverMessages } = executeParity(
        adapter,
        new Uint8Array(width * height),
        undefined,
        undefined,
        undefined,
        riverIntent([[width + 1, "MINOR"]])
      );
      expect(result.finalRiverParity).toMatchObject({
        status: "unavailable",
        intendedMinorSourceCount: 1,
      });
      expect(result.finalRiverParity).not.toHaveProperty("missingSourceCount");
      expect(result.finalRiverParity).not.toHaveProperty("observedSourceRows");
      expect(Value.Check(StandardFinalRiverParityMeasurementsSchema, result.finalRiverParity)).toBe(
        true
      );
      expect(riverMessages.length).toBeGreaterThan(0);
    }
  });

  it("reads and emits final river evidence even for an empty authored network", () => {
    class CountingRiverReadAdapter extends MockAdapter {
      readCount = 0;
      override readRiverProjection(): RiverProjectionResult {
        this.readCount++;
        const { width, height } = TEST_MAP_SIZE.dimensions;
        return super.readRiverProjection(width, height, new Uint8Array(width * height));
      }
    }
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = createLandAdapter(CountingRiverReadAdapter) as CountingRiverReadAdapter;
    const result = executeParity(adapter, new Uint8Array(width * height));
    expect(adapter.readCount).toBe(1);
    expect(result.result.finalRiverParity).toMatchObject({
      status: "observed",
      intendedMinorSourceCount: 0,
      intendedNavigableSourceCount: 0,
      observedMinorSourceCount: 0,
      observedNavigableSourceCount: 0,
      missingSourceCount: 0,
      extraSourceCount: 0,
      wrongClassCount: 0,
      navigableTerrainMismatchCount: 0,
    });
    expect(Value.Check(StandardFinalRiverParityMeasurementsSchema, result.result.finalRiverParity)).toBe(true);
    expect(result.riverMessages.length).toBeGreaterThan(0);
  });

  it("reports final land drift, accepted lake/coast-water and unplanned lake adjustments without rewriting", () => {
    class NativeSnapshotAdapter extends MockAdapter {
      override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
        return { ...super.readCurrentMapElevationSnapshot(), source: "native" };
      }
    }
    const adapter = createLandAdapter(NativeSnapshotAdapter);
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const elevation = new Int16Array(size).fill(30);
    const seaLevel = 20;
    const lakeMask = new Uint8Array(size);
    lakeMask[1] = 1;
    const observedLakeMask = Uint8Array.from(lakeMask);
    observedLakeMask[2] = 1;
    adapter.stampLakes(width, height, observedLakeMask);
    lakeMask[3] = 1;
    adapter.setTerrainType(3, 0, adapter.getTerrainTypeIndex("TERRAIN_COAST"));
    const landMask = new Uint8Array(size).fill(1);
    landMask[2] = 0;
    elevation[2] = seaLevel;
    const intended = projectStandardElevation({
      elevation,
      seaLevel,
      landMask,
      acceptedLakeMask: lakeMask,
    });
    const observed = [...intended];
    observed[0]! += 0.125;
    observed[1]! -= 0.5;
    observed[2] = 10;
    observed[3]! -= 0.75;
    adapter.setElevation(observed);
    const { result, elevationMessages } = executeParity(
      adapter,
      lakeMask,
      elevation,
      seaLevel,
      landMask
    );
    expect(result.elevationProjection).toMatchObject({
      phase: "final",
      source: "native",
      status: "observed",
      mismatchCount: 4,
      nonLakeMismatchCount: 1,
      lakeAdjustmentCount: 1,
      acceptedInlandWaterAdjustmentCount: 1,
      unplannedNativeLakeMismatchCount: 1,
    });
    expect(lakeMask[2]).toBe(0);
    expect(lakeMask[3]).toBe(1);
    expect(adapter.isLake(3, 0)).toBe(false);
    expect(landMask[2]).toBe(0);
    expect(intended[2]).toBe(0);
    expect(adapter.calls.setElevation).toEqual([observed]);
    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(elevationMessages.length).toBeGreaterThan(0);
    expect(elevationMessages.every((line) => line.length <= 900)).toBe(true);
    expect(
      decodeBoundedJsonLogSeries(elevationMessages, "[elevation-projection]")[0]?.payload
    ).toEqual({
      phase: "final",
      mapSeed: TEST_MAP_SEED,
      dimensions: { width, height },
      intended,
      observed,
      acceptedLakeMask: Array.from(lakeMask),
      observedLakeMask: Array.from(observedLakeMask),
      measurements: result.elevationProjection,
    });
    const metrics = ObservePlacementParityStep.metrics?.({
      observation: result,
      config: {},
      dimensions: { width, height },
    });
    expect(metrics?.["map.elevation.final"]).toBe(result.elevationProjection);
    expect(result.engineObservation.elevation).toEqual(Float64Array.from(observed));
    const projections = ObservePlacementParityStep.viz?.({
      observation: result,
      config: {},
      dimensions: { width, height },
    });
    const numericProjection = projections?.find(
      (projection) => projection.dataTypeKey === "map.placement.engine.elevation"
    );
    expect(numericProjection).toMatchObject({
      kind: "grid",
      field: { format: "f32", values: Float32Array.from(observed) },
    });
  });

  it("keeps unavailable terminal numeric evidence explicit while preserving water metrics", () => {
    class UnavailableSnapshotAdapter extends MockAdapter {
      override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
        return {
          source: "native",
          status: "unavailable",
          width: this.width,
          height: this.height,
          reason: "read-failed",
          plotIndex: 1,
        };
      }
    }
    const adapter = createLandAdapter(UnavailableSnapshotAdapter);
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const { result, elevationMessages } = executeParity(adapter, new Uint8Array(width * height));
    expect(result.elevationProjection).toMatchObject({
      phase: "final",
      source: "native",
      status: "unavailable",
      reason: "read-failed",
      plotIndex: 1,
    });
    expect(result.placementParity.waterDriftCount).toBe(0);
    expect(elevationMessages).toEqual([]);
    expect(result.engineObservation.elevation).toBeUndefined();
    const projections = ObservePlacementParityStep.viz?.({
      observation: result,
      config: {},
      dimensions: { width, height },
    });
    expect(
      projections?.some((projection) => projection.dataTypeKey === "map.placement.engine.elevation")
    ).toBe(false);
  });

  it("treats accepted lakes as projected water while detecting unexplained terminal water", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = createLandAdapter();
    const unexpectedWater = width + 1;
    const acceptedLake = width + 2;
    const projectedLakeMask = new Uint8Array(width * height);
    projectedLakeMask[acceptedLake] = 1;
    adapter.stampLakes(width, height, projectedLakeMask);
    adapter.setTerrainType(1, 1, adapter.getTerrainTypeIndex("TERRAIN_OCEAN"));

    const { result, parityMessages, elevationMessages } = executeParity(adapter, projectedLakeMask);
    expect(result.elevationProjection).toMatchObject({ source: "mock", status: "mock-only" });
    expect(elevationMessages).toEqual([]);

    expect(result.placementParity).toEqual({
      version: 1,
      waterDriftCount: 1,
      acceptedLakeTileCount: 1,
      finalLakeWaterDriftCount: 0,
      finalLakeClassificationDriftCount: 0,
    });
    expect(result.waterDrift[unexpectedWater]).toBe(2);
    expect(result.waterDrift[acceptedLake]).toBe(0);
    expect(Array.from(result.waterDrift).filter((value) => value !== 0)).toEqual([2]);
    expect(decodeBoundedJsonLogSeries(parityMessages, "PLACEMENT_PARITY_V1")[0]?.payload).toEqual(
      result.placementParity
    );
  });

  it("retains native non-lake classification as evidence without inventing physical water loss", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = createLandAdapter();
    const acceptedLake = width + 1;
    const projectedLakeMask = new Uint8Array(width * height);
    projectedLakeMask[acceptedLake] = 1;
    adapter.setTerrainType(1, 1, adapter.getTerrainTypeIndex("TERRAIN_COAST"));

    const { result } = executeParity(adapter, projectedLakeMask);

    expect(result.placementParity).toEqual({
      version: 1,
      waterDriftCount: 0,
      acceptedLakeTileCount: 1,
      finalLakeWaterDriftCount: 0,
      finalLakeClassificationDriftCount: 1,
    });
    expect(result.engineObservation.landMask[acceptedLake]).toBe(0);
    expect(adapter.isLake(1, 1)).toBe(false);
    expect(projectedLakeMask[acceptedLake]).toBe(1);
  });

  it("reports dried and declassified accepted lakes from the same terminal surface", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const adapter = createLandAdapter();
    const stableLake = width + 1;
    const declassifiedLake = width + 2;
    const driedLake = width + 3;
    const projectedLakeMask = new Uint8Array(width * height);
    projectedLakeMask[stableLake] = 1;
    projectedLakeMask[declassifiedLake] = 1;
    projectedLakeMask[driedLake] = 1;
    const engineLakeMask = new Uint8Array(width * height);
    engineLakeMask[stableLake] = 1;
    adapter.stampLakes(width, height, engineLakeMask);
    adapter.setTerrainType(2, 1, adapter.getTerrainTypeIndex("TERRAIN_COAST"));

    const { result } = executeParity(adapter, projectedLakeMask);

    expect(result.placementParity).toEqual({
      version: 1,
      waterDriftCount: 1,
      acceptedLakeTileCount: 3,
      finalLakeWaterDriftCount: 1,
      finalLakeClassificationDriftCount: 2,
    });
    expect(result.waterDrift[stableLake]).toBe(0);
    expect(result.waterDrift[declassifiedLake]).toBe(0);
    expect(result.waterDrift[driedLake]).toBe(1);
  });
});
