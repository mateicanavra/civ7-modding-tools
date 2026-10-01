import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import {
  CIV7_BROWSER_TABLES_V0,
  deriveCiv7CoastProjection,
  WATER_CLASS_COAST,
  WATER_CLASS_LAND,
  WATER_CLASS_OCEAN,
} from "@civ7/map-policy";
import { createEmptyWaterFixture } from "../../features/fixtures/surface-water.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../src/domain/hydrology/modules/hydrography/artifacts/index.js";
import morphology from "../../../../../../../src/domain/morphology/router.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyCoastsArtifacts } from "../../../../../../../src/domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  runAdmittedOperationForTest,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { PlotCoastsStep } from "../../../../../../../src/recipes/standard/stages/morphology/projection/steps/plot-coasts/step.js";
import { PlotContinentsStep } from "../../../../../../../src/recipes/standard/stages/morphology/projection/steps/plot-continents/step.js";
import { TEST_MAP_LATITUDE_BOUNDS, TEST_MAP_SEED, TEST_MAP_SIZE } from "../../../../../../setup.js";

function shelfFixture(size: number, shelfMask: Uint8Array, coastalWater: Uint8Array) {
  return {
    shelfMask,
    coastalLand: new Uint8Array(size),
    coastalWater,
    distanceToCoast: new Uint16Array(size),
  };
}

describe("map-morphology/plot-coasts", () => {
  it("uses resolved marine shoreline rather than a historical shore beside now-wet finite ground", () => {
    const width = 8, height = 4, size = width * height;
    const landMask = new Uint8Array(size);
    landMask[1] = 1;
    const externalWaterMask = new Uint8Array(size).fill(1);
    externalWaterMask[1] = externalWaterMask[18] = 0;
    const lakeMask = new Uint8Array(size);
    lakeMask[1] = 1;
    const exposedLandMask = new Uint8Array(size);
    exposedLandMask[18] = 1;
    const coastline = (land: Uint8Array) => runAdmittedOperationForTest(
      morphology.coasts.ops.computeCoastalAdjacency,
      { width, height, landMask: land }, { strategy: "wrapped-hex-adjacency", config: {} }
    );
    const historical = coastline(landMask), resolved = coastline(exposedLandMask);
    expect(historical.coastalWater[2]).toBe(1);
    expect(resolved.coastalWater[2]).toBe(0);
    const adapter = createMockAdapter({ width, height });
    const context = createMapContext({ adapter, setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED, dimensions: { width, height }, latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    }) });
    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        landMask, externalWaterMask, elevation: new Int16Array(size).fill(-10),
        bathymetry: new Int16Array(size).fill(-10), seaLevel: 0,
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
        ...createEmptyWaterFixture(width, height).hydrography, exposedLandMask,
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan,
        createEmptyWaterFixture(width, height, lakeMask).lakePlan);
      publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf,
        shelfFixture(size, new Uint8Array(size), historical.coastalWater));
      publishTestArtifact(stepContext, morphologyCoastsArtifacts.resolvedCoastline, {
        ...resolved, distanceToCoast: new Uint16Array(size),
      });
      PlotCoastsStep.run(stepContext, {}, {}, buildStepTestDependencies(PlotCoastsStep, stepContext));
      PlotContinentsStep.run(stepContext, {}, {}, buildStepTestDependencies(PlotContinentsStep, stepContext));
    });
    expect(adapter.getTerrainType(2, 0)).toBe(CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN);
    expect(adapter.getTerrainType(1, 0)).toBe(CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST);
    expect(adapter.isWater(2, 2)).toBe(false);
  });
  it("projects newly dry initial water as land and retained finite initial water as complete coast", () => {
    const width = 4, height = 3, size = width * height;
    const initialLand = new Uint8Array(size);
    const externalWaterMask = new Uint8Array(size);
    externalWaterMask[0] = 1;
    const lakeMask = new Uint8Array(size);
    lakeMask[2] = 1;
    const exposedLandMask = new Uint8Array(size).fill(1);
    exposedLandMask[0] = exposedLandMask[2] = 0;
    const adapter = createMockAdapter({ width, height });
    const context = createMapContext({ adapter, setup: admitMapSetup({
      mapSeed: TEST_MAP_SEED, dimensions: { width, height }, latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    }) });
    const before = initialLand.slice();
    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        landMask: initialLand, externalWaterMask, elevation: new Int16Array(size).fill(-10),
        bathymetry: new Int16Array(size).fill(-10), seaLevel: 0,
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
        ...createEmptyWaterFixture(width, height).hydrography, exposedLandMask,
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, createEmptyWaterFixture(width, height, lakeMask).lakePlan);
      publishTestArtifact(stepContext, morphologyShelfArtifacts.shelf,
        shelfFixture(size, new Uint8Array(size).fill(1), new Uint8Array(size).fill(1)));
      publishTestArtifact(stepContext, morphologyCoastsArtifacts.resolvedCoastline, {
        ...runAdmittedOperationForTest(morphology.coasts.ops.computeCoastalAdjacency,
          { width, height, landMask: exposedLandMask }, { strategy: "wrapped-hex-adjacency", config: {} }),
        distanceToCoast: new Uint16Array(size),
      });
      PlotCoastsStep.run(stepContext, {}, {}, buildStepTestDependencies(PlotCoastsStep, stepContext));
      PlotContinentsStep.run(stepContext, {}, {}, buildStepTestDependencies(PlotContinentsStep, stepContext));
    });
    expect(adapter.isWater(1, 0)).toBe(false);
    expect(adapter.getTerrainType(1, 0)).toBe(CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_FLAT);
    expect(adapter.isWater(2, 0)).toBe(true);
    expect(adapter.getTerrainType(2, 0)).toBe(CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST);
    expect(initialLand).toEqual(before);
  });
  it("projects an oceanic island's coast ring without converting the surrounding smooth abyss", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size);
    const bathymetry = new Int16Array(size).fill(-80);
    const island = Math.floor(height / 2) * width + Math.floor(width / 2);
    landMask[island] = 1;
    bathymetry[island] = 0;
    const { coastalWater } = runAdmittedOperationForTest(
      morphology.coasts.ops.computeCoastalAdjacency,
      { width, height, landMask },
      { strategy: "wrapped-hex-adjacency", config: {} }
    );
    const { shelfMask, depthGateMask } = runAdmittedOperationForTest(
      morphology.shelf.ops.computeShelfMask,
      {
        width,
        height,
        landMask,
        crustType: new Uint8Array(size), // the volcanic island and its floor are oceanic
        bathymetry,
        distanceToCoast: new Uint16Array(size),
        boundaryCloseness: new Uint8Array(size),
        boundaryType: new Uint8Array(size),
      },
      {
        strategy: "physical-break-connectivity",
        config: { breakGradient: 8, breakGradientScale: 1, activeClosenessThreshold: 0.45 },
      }
    );
    const projection = deriveCiv7CoastProjection({
      width,
      height,
      landMask,
      shelfMask,
      coastalWater,
    });
    // Ring projection must remain independent of continental flood eligibility.
    const ringOnlyProjection = deriveCiv7CoastProjection({
      width,
      height,
      landMask,
      shelfMask: new Uint8Array(size),
      coastalWater,
    });

    expect(depthGateMask.some((value) => value === 1)).toBe(false);
    expect(Array.from(shelfMask)).toEqual(Array.from(coastalWater));
    expect(projection.waterClass).toEqual(ringOnlyProjection.waterClass);
    expect(projection.waterClass[island]).toBe(WATER_CLASS_LAND);
    expect(projection.waterClass[island + 1]).toBe(WATER_CLASS_COAST);
    expect(projection.waterClass[island + 2]).toBe(WATER_CLASS_OCEAN);
    expect(projection.waterClass.filter((value) => value === WATER_CLASS_COAST)).toHaveLength(6);
    expect(projection.waterClass.filter((value) => value === WATER_CLASS_OCEAN)).toHaveLength(
      size - 7
    );
  });

  it("stamps coast from the shelf + shoreline ring; ring promotes only land-adjacent ocean (no distance band)", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    });

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      rng: createLabelRng(TEST_MAP_SEED),
    });
    const context = createMapContext({ setup, adapter });
    const {
      TERRAIN_COAST: coastTerrain,
      TERRAIN_FLAT: flatTerrain,
      TERRAIN_OCEAN: oceanTerrain,
    } = CIV7_BROWSER_TABLES_V0.terrainTypeIndices;

    const size = width * height;
    // Land only at (0,0). Source coast = a shoreline-ring water tile (1,0) + a shelf tile (2,1).
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    const coastalWater = new Uint8Array(size).fill(0);
    coastalWater[1] = 1; // (1,0)
    const shelfMask = new Uint8Array(size).fill(0);
    shelfMask[width + 2] = 1; // (2,1)

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask,
        externalWaterMask: Uint8Array.from(landMask, (land) => land === 1 ? 0 : 1),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(
        stepContext,
        morphologyShelfArtifacts.shelf,
        shelfFixture(size, shelfMask, coastalWater)
      );

      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
        ...createEmptyWaterFixture(width, height).hydrography, exposedLandMask: landMask,
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, createEmptyWaterFixture(width, height).lakePlan);
      publishTestArtifact(stepContext, morphologyCoastsArtifacts.resolvedCoastline, {
        ...runAdmittedOperationForTest(morphology.coasts.ops.computeCoastalAdjacency,
          { width, height, landMask }, { strategy: "wrapped-hex-adjacency", config: {} }),
        distanceToCoast: new Uint16Array(size),
      });
      PlotCoastsStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(PlotCoastsStep, stepContext)
      );
    });

    // Land stays land; source coast (shoreline ring + shelf) becomes COAST.
    expect(adapter.getTerrainType(0, 0)).toBe(flatTerrain);
    expect(adapter.getTerrainType(1, 0)).toBe(coastTerrain); // coastalWater (1,0)
    expect(adapter.getTerrainType(2, 1)).toBe(coastTerrain); // shelfMask (2,1)
    // The coast-ring guarantee promotes a land-adjacent ocean tile (0,1) to coast.
    expect(adapter.getTerrainType(0, 1)).toBe(coastTerrain);
    // But an ocean tile two tiles from land (2,0) is NOT promoted -- there is no distance band,
    // even though it neighbours coast tiles (1,0) and (2,1). This is the key regression guard.
    expect(adapter.getTerrainType(2, 0)).toBe(oceanTerrain);

    // expandCoasts is intentionally not invoked by this step.
    expect(adapter.calls.expandCoasts).toHaveLength(0);
  });

  it("restores shelf coast terrain after downstream terrain maintenance rewrites it", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const setup = admitMapSetup({
      mapSeed: TEST_MAP_SEED,
      dimensions: TEST_MAP_SIZE.dimensions,
      latitudeBounds: TEST_MAP_LATITUDE_BOUNDS,
    });

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo: TEST_MAP_SIZE.mapInfo,
      mapSizeId: TEST_MAP_SIZE.id,
      rng: createLabelRng(TEST_MAP_SEED),
    });
    const context = createMapContext({ setup, adapter });
    const { TERRAIN_COAST: coastTerrain, TERRAIN_OCEAN: oceanTerrain } =
      CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    const coastalWater = new Uint8Array(size).fill(0);
    coastalWater[1] = 1;
    const shelfMask = new Uint8Array(size).fill(0);
    const shelfIndex = width + 2;
    shelfMask[shelfIndex] = 1;

    withMapContextExecutionForTest(context, (stepContext) => {
      publishTestArtifact(stepContext, morphologyLandformsArtifacts.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask,
        externalWaterMask: Uint8Array.from(landMask, (land) => land === 1 ? 0 : 1),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(
        stepContext,
        morphologyShelfArtifacts.shelf,
        shelfFixture(size, shelfMask, coastalWater)
      );

      publishTestArtifact(stepContext, hydrographyArtifacts.hydrography, {
        ...createEmptyWaterFixture(width, height).hydrography, exposedLandMask: landMask,
      });
      publishTestArtifact(stepContext, hydrographyArtifacts.lakePlan, createEmptyWaterFixture(width, height).lakePlan);
      publishTestArtifact(stepContext, morphologyCoastsArtifacts.resolvedCoastline, {
        ...runAdmittedOperationForTest(morphology.coasts.ops.computeCoastalAdjacency,
          { width, height, landMask }, { strategy: "wrapped-hex-adjacency", config: {} }),
        distanceToCoast: new Uint16Array(size),
      });
      PlotCoastsStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(PlotCoastsStep, stepContext)
      );
      expect(adapter.getTerrainType(2, 1)).toBe(coastTerrain);

      const originalValidate = adapter.validateAndFixTerrain.bind(adapter);
      adapter.validateAndFixTerrain = () => {
        originalValidate();
        adapter.setTerrainType(2, 1, oceanTerrain);
      };

      PlotContinentsStep.run(
        stepContext,
        {},
        {},
        buildStepTestDependencies(PlotContinentsStep, stepContext)
      );
    });

    expect(adapter.getTerrainType(2, 1)).toBe(coastTerrain);
  });
});
