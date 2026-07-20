import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifacts as mapMorphologyArtifacts } from "../../../../../../../src/recipes/standard/stages/map-morphology/artifacts/index.js";
import { PlotCoastsStep } from "../../../../../../../src/recipes/standard/stages/map-morphology/steps/plot-coasts/step.js";
import { PlotContinentsStep } from "../../../../../../../src/recipes/standard/stages/map-morphology/steps/plot-continents/step.js";
import { artifactModules as morphologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";

const SYNTHETIC_DIMENSIONS = { width: 4, height: 3 } as const;

function shelfFixture(size: number, shelfMask: Uint8Array, coastalWater: Uint8Array) {
  return {
    shelfMask,
    coastalLand: new Uint8Array(size),
    coastalWater,
    distanceToCoast: new Uint16Array(size),
    activeMarginMask: new Uint8Array(size),
    depthGateMask: Uint8Array.from(shelfMask),
    nearshoreCandidateMask: Uint8Array.from(coastalWater),
    shelfBreakDepthByTile: new Int16Array(size),
    shallowCutoff: 0,
  };
}

describe("map-morphology/plot-coasts", () => {
  it("stamps coast from the shelf + shoreline ring; ring promotes only land-adjacent ocean (no distance band)", () => {
    const { width, height } = SYNTHETIC_DIMENSIONS;
    const seed = 1234;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: SYNTHETIC_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
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
    shelfMask[6] = 1; // (2,1)

    withMapContextExecutionForTest(context, () => {
      publishTestArtifact(context, morphologyArtifactModules.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(
        context,
        morphologyArtifactModules.shelf,
        shelfFixture(size, shelfMask, coastalWater)
      );

      PlotCoastsStep.run(context as any, {}, {} as any, buildStepTestDependencies(PlotCoastsStep));
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

    const coastClassification = context.artifacts.get(
      mapMorphologyArtifacts.coastClassification.id
    ) as
      | {
          baseWaterClass?: Uint8Array;
          sourceCoastMask?: Uint8Array;
          waterClass?: Uint8Array;
          coastRingMask?: Uint8Array;
        }
      | undefined;
    // Source coast = shelf ∪ shoreline ring; the ring tile (0,1)=idx4 is NOT a source coast tile.
    expect(coastClassification?.sourceCoastMask?.[1]).toBe(1);
    expect(coastClassification?.sourceCoastMask?.[6]).toBe(1);
    expect(coastClassification?.sourceCoastMask?.[4]).toBe(0);
    expect(coastClassification?.sourceCoastMask?.[2]).toBe(0);
    // Final water class: ring tile (0,1) is coast; the non-adjacent tile (2,0) stays ocean.
    expect(coastClassification?.waterClass?.[4]).toBe(1);
    expect(coastClassification?.waterClass?.[2]).toBe(2);
    // The ring mask marks the land-adjacent promotion, not the source coast.
    expect(coastClassification?.coastRingMask?.[4]).toBe(1);
    expect(coastClassification?.coastRingMask?.[2]).toBe(0);

    // expandCoasts is intentionally not invoked by this step.
    expect((adapter as any).calls?.expandCoasts?.length ?? 0).toBe(0);
  });

  it("restores shelf coast terrain after downstream terrain maintenance rewrites it", () => {
    const { width, height } = SYNTHETIC_DIMENSIONS;
    const seed = 4321;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: SYNTHETIC_DIMENSIONS,
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    });

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
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
    const shelfIndex = 6;
    shelfMask[shelfIndex] = 1;

    withMapContextExecutionForTest(context, () => {
      publishTestArtifact(context, morphologyArtifactModules.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask,
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(
        context,
        morphologyArtifactModules.shelf,
        shelfFixture(size, shelfMask, coastalWater)
      );

      PlotCoastsStep.run(context as any, {}, {} as any, buildStepTestDependencies(PlotCoastsStep));
      expect(adapter.getTerrainType(2, 1)).toBe(coastTerrain);

      const originalValidate = adapter.validateAndFixTerrain.bind(adapter);
      adapter.validateAndFixTerrain = () => {
        originalValidate();
        adapter.setTerrainType(2, 1, oceanTerrain);
      };

      PlotContinentsStep.run(
        context as any,
        {},
        {} as any,
        buildStepTestDependencies(PlotContinentsStep)
      );
    });

    expect(adapter.getTerrainType(2, 1)).toBe(coastTerrain);
    const snapshot = context.artifacts.get(
      mapMorphologyArtifacts.continentValidationTerrainSnapshot.id
    ) as { terrain?: Uint8Array } | undefined;
    expect(snapshot?.terrain?.[shelfIndex]).toBe(coastTerrain);
  });
});
