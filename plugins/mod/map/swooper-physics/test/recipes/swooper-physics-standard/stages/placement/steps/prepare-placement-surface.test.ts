import { describe, expect, it } from "bun:test";

import { type CurrentMapElevationSnapshot, MockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  runAdmittedOperationForTest,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifacts as hydrographyArtifacts } from "../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../src/domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as morphologyCoastsArtifacts } from "../../../../../../src/domain/morphology/modules/coasts/artifacts/index.js";
import morphology from "../../../../../../src/domain/morphology/router.js";
import { projectStandardElevation } from "../../../../../../src/recipes/standard/elevation-projection.js";
import { PreparePlacementSurfaceStep } from "../../../../../../src/recipes/standard/stages/placement/steps/prepare-placement-surface/step.js";
import { createEmptyWaterFixture } from "../../morphology/features/fixtures/surface-water.js";
import { TEST_MAP_LATITUDE_BOUNDS, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../setup.js";

const { width, height } = TEST_MAP_SIZE.dimensions;
const size = width * height;

class PreparationAdapter extends MockAdapter {
  readonly events: string[] = [];
  readonly currentElevation = new Float64Array(size).fill(456.75);
  readonly selectionReads: number[] = [];
  receivedRequest?: readonly number[];
  elevationAtCliffs?: Float64Array;
  terrainAtCliffs?: Int32Array;
  snapshot?: CurrentMapElevationSnapshot;
  snapshotOverride?: CurrentMapElevationSnapshot;
  validationMutation?: () => void;
  cliffMutation?: () => void;
  lakeOverride?: (x: number, y: number) => boolean;
  private selecting = false;
  private boundaryReadCount = 0;

  override validateAndFixTerrain(): void {
    this.events.push("validate");
    super.validateAndFixTerrain();
    this.validationMutation?.();
  }

  override setTerrainType(x: number, y: number, terrainType: number): void {
    this.events.push(`terrain:${y * this.width + x}`);
    super.setTerrainType(x, y, terrainType);
  }

  override readCurrentMapTerrainTypes(): Int32Array {
    this.events.push(`boundary:${++this.boundaryReadCount}`);
    return super.readCurrentMapTerrainTypes();
  }

  override readCurrentMapElevationSnapshot(): CurrentMapElevationSnapshot {
    this.events.push("elevation-snapshot");
    this.selecting = true;
    this.snapshot = this.snapshotOverride ?? {
      source: "mock",
      status: "available",
      width: this.width,
      height: this.height,
      values: Float64Array.from(this.currentElevation),
    };
    return this.snapshot;
  }

  override isWater(x: number, y: number): boolean {
    if (this.selecting) this.selectionReads.push(y * this.width + x);
    return super.isWater(x, y);
  }

  override isLake(x: number, y: number): boolean {
    return this.lakeOverride ? this.lakeOverride(x, y) : super.isLake(x, y);
  }

  override setElevation(values: readonly number[]): void {
    this.events.push("setElevation");
    this.selecting = false;
    this.receivedRequest = values;
    super.setElevation(values);
    this.currentElevation.set(values);
  }

  override recalculateAreas(): void {
    this.events.push("recalculateAreas");
    super.recalculateAreas();
  }

  override generateCliffsFromElevation(): void {
    this.events.push("generateCliffsFromElevation");
    this.elevationAtCliffs = Float64Array.from(this.currentElevation);
    this.terrainAtCliffs = super.readCurrentMapTerrainTypes();
    super.generateCliffsFromElevation();
    this.cliffMutation?.();
  }

  override storeWaterData(): void {
    this.events.push("storeWaterData");
    super.storeWaterData();
  }
}

function createFixture() {
  const adapter = new PreparationAdapter({
    width,
    height,
    mapInfo: TEST_MAP_SIZE.mapInfo,
    mapSizeId: TEST_MAP_SIZE.id,
    rng: createLabelRng(TEST_MAP_SEED),
  });
  for (let index = 0; index < size; index += 1) {
    adapter.setTerrainType(
      index % width,
      Math.floor(index / width),
      adapter.getTerrainTypeIndex("TERRAIN_FLAT")
    );
  }
  const context = createMapContext({
    setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    }),
    adapter,
  });
  const topography = {
    elevation: new Int16Array(size).fill(30),
    seaLevel: 20,
    landMask: new Uint8Array(size).fill(1),
    externalWaterMask: new Uint8Array(size),
    bathymetry: new Int16Array(size),
  };
  const projectedLakes = { lakeMask: new Uint8Array(size) };
  const shelf = {
    shelfMask: new Uint8Array(size),
    coastalLand: new Uint8Array(size),
    coastalWater: new Uint8Array(size),
    distanceToCoast: new Uint16Array(size),
  };
  adapter.events.length = 0;
  return { adapter, context, topography, projectedLakes, shelf };
}

function executePreparation(fixture: ReturnType<typeof createFixture>) {
  const { context, topography, projectedLakes, shelf } = fixture;
  return withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, morphologyErosionArtifacts.topography, topography);
    publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf, shelf);
    publishTestArtifact(stepContext, hydrographyArtifacts.projectedLakes, projectedLakes);
    const exposedLandMask = Uint8Array.from(topography.landMask, (land, cell) => land === 1 && projectedLakes.lakeMask[cell] === 0 ? 1 : 0);
    publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
      ...createEmptyWaterFixture(width, height).hydrography,
      exposedLandMask,
    });
    publishTestArtifact(stepContext, morphologyCoastsArtifacts.resolvedCoastline, {
      ...runAdmittedOperationForTest(morphology.coasts.ops.computeCoastalAdjacency,
        { width, height, landMask: exposedLandMask }, { strategy: "wrapped-hex-adjacency", config: {} }),
      distanceToCoast: new Uint16Array(size),
    });
    const deps = buildStepTestDependencies(PreparePlacementSurfaceStep, stepContext);
    const before = structuredClone({
      topography: deps.artifacts.topography.read(),
      shelf: deps.artifacts.shelf.read(),
      projectedLakes: deps.artifacts.projectedLakes.read(),
    });
    const observation = PreparePlacementSurfaceStep.run(stepContext, {}, {}, deps);
    if (observation instanceof Promise)
      throw new Error("Surface preparation must remain synchronous.");
    return {
      observation,
      before,
      after: {
        topography: deps.artifacts.topography.read(),
        shelf: deps.artifacts.shelf.read(),
        projectedLakes: deps.artifacts.projectedLakes.read(),
      },
    };
  });
}

describe("placement/prepare-placement-surface", () => {
  it("generates cliffs after restoring wet requests and retaining exact dry and wonder edits without changing physical artifacts", () => {
    const fixture = createFixture();
    const { adapter, topography, projectedLakes } = fixture;
    const wetCells = [width + 2, width + 4, width + 6];
    for (const index of wetCells) {
      projectedLakes.lakeMask[index] = 1;
      adapter.setTerrainType(index % width, 1, adapter.getTerrainTypeIndex("TERRAIN_COAST"));
    }
    topography.elevation[wetCells[0]!] = 43;
    topography.elevation[wetCells[1]!] = -20;
    topography.elevation[wetCells[2]!] = 73;
    adapter.currentElevation[wetCells[0]!] = 18;
    adapter.currentElevation[wetCells[1]!] = -256.75;
    adapter.currentElevation[wetCells[2]!] = 0;
    const dryEdits = [788, 875.125, 137.375, -9.25, 0, 12.125, -0];
    for (const [offset, value] of dryEdits.entries())
      adapter.currentElevation[width + 8 + offset] = value;
    adapter.setFeatureType(8, 1, {
      Feature: adapter.getFeatureTypeIndex("FEATURE_KILIMANJARO"),
      Direction: 0,
      Elevation: adapter.currentElevation[width + 8]!,
    });
    adapter.setTerrainType(9, 1, adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER"));
    // Contradictory native lake identity does not select either side of the elevation request.
    adapter.lakeOverride = (x, y) => y === 1 && x === 8;
    const originalCurrent = Float64Array.from(adapter.currentElevation);
    const originalInputs = structuredClone({ topography, projectedLakes, shelf: fixture.shelf });
    const originalProjection = projectStandardElevation({
      ...topography,
      acceptedLakeMask: projectedLakes.lakeMask,
    });
    const expected = Array.from(originalCurrent);
    for (const index of wetCells) expected[index] = originalProjection[index]!;
    adapter.events.length = 0;

    const result = executePreparation(fixture);

    expect(adapter.calls.setElevation).toEqual([expected]);
    expect(adapter.elevationAtCliffs).toEqual(Float64Array.from(expected));
    expect(adapter.terrainAtCliffs?.[width + 9]).toBe(
      adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER")
    );
    expect(Array.isArray(adapter.receivedRequest)).toBe(true);
    expect(adapter.receivedRequest).not.toBe(originalProjection);
    expect(adapter.receivedRequest).not.toBe(
      adapter.snapshot?.status === "available" ? adapter.snapshot.values : undefined
    );
    expect(adapter.snapshot).toMatchObject({
      source: "mock",
      status: "available",
      values: originalCurrent,
    });
    expect(adapter.selectionReads).toEqual(Array.from({ length: size }, (_, index) => index));
    for (const [offset, value] of dryEdits.entries()) {
      expect(Object.is(adapter.calls.setElevation[0]![width + 8 + offset], value)).toBe(true);
    }
    expect(adapter.getFeatureType(8, 1)).toBe(adapter.getFeatureTypeIndex("FEATURE_KILIMANJARO"));
    expect(adapter.getTerrainType(9, 1)).toBe(
      adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER")
    );
    expect(result.after).toEqual(result.before);
    expect({ topography, projectedLakes, shelf: fixture.shelf }).toEqual(originalInputs);
    expect(adapter.events).toEqual([
      "boundary:1",
      "validate",
      "storeWaterData",
      "boundary:2",
      "elevation-snapshot",
      "setElevation",
      "generateCliffsFromElevation",
      "recalculateAreas",
      "storeWaterData",
      "boundary:3",
    ]);
    expect(adapter.calls.generateCliffsFromElevation).toBe(1);
    expect(PreparePlacementSurfaceStep.contract.engine).toContain("generateCliffsFromElevation");
    expect(adapter.calls.setRiverInfo).toEqual([]);
    expect(adapter.calls.finalizeRivers).toEqual([]);
  });

  it.each(["water", "terrain", "lake"] as const)(
    "preserves the accepted lake footprint against cliff-generated %s drift",
    (lost) => {
      const fixture = createFixture();
      const { adapter, projectedLakes } = fixture;
      const lakeCell = width + 2;
      const coast = adapter.getTerrainTypeIndex("TERRAIN_COAST");
      const ocean = adapter.getTerrainTypeIndex("TERRAIN_OCEAN");
      projectedLakes.lakeMask[lakeCell] = 1;
      adapter.stampLakes(width, height, projectedLakes.lakeMask);
      expect(adapter.isLake(2, 1)).toBe(true);
      const readWater = adapter.isWater.bind(adapter);
      const readTerrain = adapter.getTerrainType.bind(adapter);
      adapter.cliffMutation = () => {
        if (lost === "water") {
          Reflect.set(adapter, "isWater", (x: number, y: number) =>
            y * width + x === lakeCell ? false : readWater(x, y)
          );
        } else if (lost === "terrain") {
          Reflect.set(adapter, "getTerrainType", (x: number, y: number) =>
            y * width + x === lakeCell ? ocean : readTerrain(x, y)
          );
        } else {
          adapter.lakeOverride = () => false;
        }
      };
      adapter.events.length = 0;

      if (lost === "lake") {
        const { observation } = executePreparation(fixture);
        expect(observation.afterMaintenance.lakeMask[lakeCell]).toBe(0);
        expect(observation.afterMaintenance.waterMask[lakeCell]).toBe(1);
        expect(observation.afterMaintenance.terrain[lakeCell]).toBe(coast);
      } else {
        expect(() => executePreparation(fixture)).toThrow(
          /placement\/prepare-surface\/after-maintenance.*certified accepted lake footprint lost/
        );
        if (lost === "terrain") expect(adapter.isWater(2, 1)).toBe(true);
        if (lost === "water") expect(adapter.getTerrainType(2, 1)).toBe(coast);
      }
      expect(adapter.calls.setElevation).toHaveLength(1);
      expect(adapter.calls.generateCliffsFromElevation).toBe(1);
      expect(adapter.events).toEqual([
        "boundary:1",
        "validate",
        "storeWaterData",
        "boundary:2",
        "elevation-snapshot",
        "setElevation",
        "generateCliffsFromElevation",
        "recalculateAreas",
        "storeWaterData",
        "boundary:3",
      ]);
    }
  );

  it("returns independent ordinary requests on repeated deterministic preparation", () => {
    const first = createFixture();
    const second = createFixture();
    executePreparation(first);
    executePreparation(second);
    expect(first.adapter.receivedRequest).toEqual(second.adapter.receivedRequest);
    expect(first.adapter.receivedRequest).not.toBe(second.adapter.receivedRequest);
    expect(first.adapter.receivedRequest).not.toBe(first.topography.elevation);
    expect(first.adapter.receivedRequest).not.toBe(first.adapter.currentElevation);
  });

  it("selects settled water after validation and wrapped coast restoration, before the existing refresh", () => {
    const fixture = createFixture();
    const { adapter, topography, projectedLakes, shelf } = fixture;
    const restoredWater = width * 2;
    const wrappedWater = width * 4 - 1;
    const becomesWater = width * 2 + 4;
    const becomesDry = width * 2 + 8;
    topography.landMask.fill(0);
    topography.landMask[restoredWater + 1] = 1;
    topography.landMask[width * 3] = 1;
    topography.landMask[becomesWater] = 1;
    topography.landMask[becomesDry] = 1;
    for (let cell = 0; cell < size; cell++) {
      if (topography.landMask[cell] === 0) {
        topography.externalWaterMask[cell] = 1;
        topography.elevation[cell] = topography.seaLevel;
      }
    }
    shelf.coastalWater[restoredWater] = 1;
    for (let index = 0; index < size; index += 1) {
      adapter.setTerrainType(
        index % width,
        Math.floor(index / width),
        adapter.getTerrainTypeIndex(
          topography.landMask[index] === 1 ? "TERRAIN_FLAT" : "TERRAIN_OCEAN"
        )
      );
    }
    projectedLakes.lakeMask[becomesWater] = 1;
    adapter.setTerrainType(becomesDry % width, 2, adapter.getTerrainTypeIndex("TERRAIN_COAST"));
    adapter.validationMutation = () => {
      adapter.setTerrainType(restoredWater % width, 2, adapter.getTerrainTypeIndex("TERRAIN_FLAT"));
      adapter.setTerrainType(wrappedWater % width, 3, adapter.getTerrainTypeIndex("TERRAIN_FLAT"));
      adapter.setTerrainType(becomesWater % width, 2, adapter.getTerrainTypeIndex("TERRAIN_COAST"));
      adapter.setTerrainType(becomesDry % width, 2, adapter.getTerrainTypeIndex("TERRAIN_FLAT"));
      adapter.currentElevation[restoredWater] = -128;
      adapter.currentElevation[wrappedWater] = -19.75;
      adapter.currentElevation[becomesWater] = -64.5;
      adapter.currentElevation[becomesDry] = 788.125;
    };
    adapter.events.length = 0;

    const { observation } = executePreparation(fixture);

    expect(observation.beforeValidate.waterMask[becomesWater]).toBe(0);
    expect(observation.beforeValidate.waterMask[becomesDry]).toBe(1);
    expect(observation.afterValidate.waterMask[restoredWater]).toBe(1);
    expect(observation.afterValidate.waterMask[becomesWater]).toBe(1);
    expect(observation.afterValidate.waterMask[becomesDry]).toBe(0);
    expect(adapter.calls.setElevation[0]![restoredWater]).toBe(0);
    expect(adapter.calls.setElevation[0]![becomesWater]).toBe(228);
    expect(adapter.calls.setElevation[0]![becomesDry]).toBe(788.125);
    expect(adapter.calls.setElevation[0]![wrappedWater]).toBe(0);
    expect(adapter.getTerrainType(width - 1, 3)).toBe(adapter.getTerrainTypeIndex("TERRAIN_COAST"));
    const lastTerrainWrite = adapter.events.reduce(
      (last, event, index) => (event.startsWith("terrain:") ? index : last),
      -1
    );
    expect(lastTerrainWrite).toBeLessThan(adapter.events.indexOf("boundary:2"));
    expect(adapter.events.indexOf("boundary:2")).toBeLessThan(
      adapter.events.indexOf("elevation-snapshot")
    );
    expect(adapter.events.indexOf("elevation-snapshot")).toBeLessThan(
      adapter.events.indexOf("setElevation")
    );
    expect(adapter.events.slice(-5)).toEqual([
      "setElevation",
      "generateCliffsFromElevation",
      "recalculateAreas",
      "storeWaterData",
      "boundary:3",
    ]);
    expect(adapter.calls.setElevation).toHaveLength(1);
    expect(adapter.calls.generateCliffsFromElevation).toBe(1);
    expect(adapter.elevationAtCliffs).toEqual(Float64Array.from(adapter.calls.setElevation[0]!));
    expect(adapter.terrainAtCliffs?.[restoredWater]).toBe(adapter.getTerrainTypeIndex("TERRAIN_COAST"));
    expect(adapter.terrainAtCliffs?.[wrappedWater]).toBe(adapter.getTerrainTypeIndex("TERRAIN_COAST"));
  });

  it.each([
    "unavailable",
    "width",
    "height",
    "short",
    "long",
  ] as const)("refuses a %s current elevation snapshot before the added setter or area refresh", (invalid) => {
    const fixture = createFixture();
    const { adapter } = fixture;
    adapter.snapshotOverride =
      invalid === "unavailable"
        ? { source: "native", status: "unavailable", width, height, reason: "read-failed" }
        : {
            source: "mock",
            status: "available",
            width: invalid === "width" ? width + 1 : width,
            height: invalid === "height" ? height + 1 : height,
            values: new Float64Array(
              size + (invalid === "short" ? -1 : invalid === "long" ? 1 : 0)
            ),
          };
    expect(() => executePreparation(fixture)).toThrow(
      invalid === "unavailable" ? /unavailable/ : /dimensions and cardinality/
    );
    expect(adapter.calls.setElevation).toEqual([]);
    expect(adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(adapter.events).not.toContain("recalculateAreas");
    expect(adapter.events.at(-1)).toBe("elevation-snapshot");
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])("refuses a nonfinite current sample %s even on wet cells before writing", (invalid) => {
    for (const wet of [false, true]) {
      const fixture = createFixture();
      const { adapter } = fixture;
      const values = Float64Array.from(adapter.currentElevation);
      values[size - 1] = invalid;
      adapter.snapshotOverride = { source: "mock", status: "available", width, height, values };
      if (wet)
        adapter.setTerrainType(width - 1, height - 1, adapter.getTerrainTypeIndex("TERRAIN_COAST"));
      expect(() => executePreparation(fixture)).toThrow(/Current elevation is not finite/);
      expect(adapter.calls.setElevation).toEqual([]);
      expect(adapter.calls.generateCliffsFromElevation).toBe(0);
      expect(adapter.events).not.toContain("recalculateAreas");
    }
  });

  it("propagates a thrown snapshot read unchanged without writing or refreshing areas", () => {
    const fixture = createFixture();
    const failure = new Error("native elevation reader failed");
    Reflect.set(fixture.adapter, "readCurrentMapElevationSnapshot", () => {
      throw failure;
    });
    let received: unknown;
    try {
      executePreparation(fixture);
    } catch (error) {
      received = error;
    }
    expect(received).toBe(failure);
    expect(fixture.adapter.calls.setElevation).toEqual([]);
    expect(fixture.adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(fixture.adapter.events).not.toContain("recalculateAreas");
    expect(fixture.adapter.events.at(-1)).toBe("boundary:2");
  });

  it.each([
    0,
    1,
    undefined,
    null,
    "false",
    Number.NaN,
  ])("refuses raw nonboolean water %j despite coerced diagnostic masks, before writing", (invalid) => {
    const fixture = createFixture();
    Reflect.set(fixture.adapter, "isWater", (x: number, y: number) =>
      x === width - 1 && y === height - 1 ? invalid : false
    );
    expect(() => executePreparation(fixture)).toThrow(/Current water read is not boolean/);
    expect(fixture.adapter.calls.setElevation).toEqual([]);
    expect(fixture.adapter.calls.generateCliffsFromElevation).toBe(0);
    expect(fixture.adapter.events).not.toContain("recalculateAreas");
  });

  it("admits the immutable projection before native validation rather than falling back to current heights", () => {
    const fixture = createFixture();
    fixture.topography.elevation.fill(32_767);
    fixture.topography.seaLevel = -32_768;
    expect(() => executePreparation(fixture)).toThrow(/Native projection exceeds 65535/);
    expect(fixture.adapter.events).not.toContain("validate");
    expect(fixture.adapter.calls.setElevation).toEqual([]);
    expect(fixture.adapter.calls.generateCliffsFromElevation).toBe(0);
  });
});
