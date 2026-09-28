import { describe, expect, it } from "bun:test";

import { type CurrentMapElevationSnapshot, MockAdapter } from "@civ7/adapter";
import { artifacts as hydrographyArtifacts } from "../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { decodeBoundedJsonLogSeries } from "@swooper/mapgen-core/lib/log";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";

import { ObservePlacementParityStep } from "../../../../../../src/recipes/standard/stages/placement/steps/observe-placement-parity/step.js";
import { projectStandardElevation } from "../../../../../../src/recipes/standard/elevation-projection.js";
import { TEST_MAP_LATITUDE_BOUNDS, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

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
  )
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
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation,
        seaLevel,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, {
        lakeMask: projectedLakeMask,
      });
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
    };
  } finally {
    console.log = originalLog;
  }
}

describe("placement/observe-placement-parity", () => {
  it("reports exact final non-lake drift, accepted and unplanned lake adjustments without rewriting or failing the run", () => {
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
    const landMask = new Uint8Array(size).fill(1);
    landMask[2] = 0;
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
      mismatchCount: 3,
      nonLakeMismatchCount: 1,
      lakeAdjustmentCount: 1,
      unplannedNativeLakeMismatchCount: 1,
    });
    expect(lakeMask[2]).toBe(0);
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
