import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import {
  COAST_TERRAIN,
  createExtendedMapContext,
  FLAT_TERRAIN,
  OCEAN_TERRAIN,
} from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { mapMorphologyArtifacts } from "../../src/recipes/standard/stages/map-morphology/artifacts.js";
import plotCoasts from "../../src/recipes/standard/stages/map-morphology/steps/plotCoasts.js";
import plotContinents from "../../src/recipes/standard/stages/map-morphology/steps/plotContinents.js";
import { buildTestDeps } from "../support/step-deps.js";

describe("map-morphology/plot-coasts", () => {
  it("stamps coast from the shelf + shoreline ring; ring promotes only land-adjacent ocean (no distance band)", () => {
    const width = 4;
    const height = 3;
    const seed = 1234;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    const size = width * height;
    // Land only at (0,0). Source coast = a shoreline-ring water tile (1,0) + a shelf tile (2,1).
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    const coastalWater = new Uint8Array(size).fill(0);
    coastalWater[1] = 1; // (1,0)
    const shelfMask = new Uint8Array(size).fill(0);
    shelfMask[6] = 1; // (2,1)

    context.artifacts.set("artifact:morphology.topography", { landMask });
    context.artifacts.set("artifact:morphology.coastlineMetrics", {
      coastalLand: new Uint8Array(size),
      coastalWater,
      shelfMask,
      distanceToCoast: new Uint16Array(size),
    });

    plotCoasts.run(context as any, {}, {} as any, buildTestDeps(plotCoasts));

    // Land stays land; source coast (shoreline ring + shelf) becomes COAST.
    expect(adapter.getTerrainType(0, 0)).toBe(FLAT_TERRAIN);
    expect(adapter.getTerrainType(1, 0)).toBe(COAST_TERRAIN); // coastalWater (1,0)
    expect(adapter.getTerrainType(2, 1)).toBe(COAST_TERRAIN); // shelfMask (2,1)
    // The coast-ring guarantee promotes a land-adjacent ocean tile (0,1) to coast.
    expect(adapter.getTerrainType(0, 1)).toBe(COAST_TERRAIN);
    // But an ocean tile two tiles from land (2,0) is NOT promoted -- there is no distance band,
    // even though it neighbours coast tiles (1,0) and (2,1). This is the key regression guard.
    expect(adapter.getTerrainType(2, 0)).toBe(OCEAN_TERRAIN);

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
    const width = 4;
    const height = 3;
    const seed = 4321;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);
    const size = width * height;
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    const coastalWater = new Uint8Array(size).fill(0);
    coastalWater[1] = 1;
    const shelfMask = new Uint8Array(size).fill(0);
    const shelfIndex = 6;
    shelfMask[shelfIndex] = 1;

    context.artifacts.set("artifact:morphology.topography", { landMask });
    context.artifacts.set("artifact:morphology.coastlineMetrics", {
      coastalLand: new Uint8Array(size),
      coastalWater,
      shelfMask,
      distanceToCoast: new Uint16Array(size),
    });

    plotCoasts.run(context as any, {}, {} as any, buildTestDeps(plotCoasts));
    expect(adapter.getTerrainType(2, 1)).toBe(COAST_TERRAIN);

    const originalValidate = adapter.validateAndFixTerrain.bind(adapter);
    adapter.validateAndFixTerrain = () => {
      originalValidate();
      adapter.setTerrainType(2, 1, OCEAN_TERRAIN);
    };

    plotContinents.run(context as any, {}, {} as any, buildTestDeps(plotContinents));

    expect(adapter.getTerrainType(2, 1)).toBe(COAST_TERRAIN);
    const snapshot = context.artifacts.get(
      mapMorphologyArtifacts.continentValidationTerrainSnapshot.id
    ) as { terrain?: Uint8Array } | undefined;
    expect(snapshot?.terrain?.[shelfIndex]).toBe(COAST_TERRAIN);
  });
});
