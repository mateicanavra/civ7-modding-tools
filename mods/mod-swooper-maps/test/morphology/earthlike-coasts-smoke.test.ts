import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, COAST_TERRAIN, OCEAN_TERRAIN } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config.js";

import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import morphologyDomain from "../../src/domain/morphology/ops.js";
import { runOpValidated } from "../support/compiler-helpers.js";

describe("Earthlike coasts (smoke)", () => {
  it("produces a shallow shelf band beyond the shoreline ring while preserving deep ocean", () => {
    const width = 64;
    const height = 40;
    const seed = 12345;

    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -70,
      MaxLatitude: 70,
      PlayersLandmass1: 4,
      PlayersLandmass2: 4,
      StartSectorRows: 4,
      StartSectorCols: 4,
    };

    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
    };

    const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
    const context = createExtendedMapContext({ width, height }, adapter, env);
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
    standardRecipe.run(context, env, realismEarthlikeConfig, { log: () => {} });

    const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
      | { landMask?: Uint8Array; bathymetry?: Int16Array }
      | undefined;
    if (!(topography?.landMask instanceof Uint8Array)) throw new Error("Missing topography.landMask.");
    if (!(topography?.bathymetry instanceof Int16Array)) throw new Error("Missing topography.bathymetry.");

    const coastlineMetrics = context.artifacts.get(morphologyArtifacts.coastlineMetrics.id) as
      | { coastalWater?: Uint8Array; shelfMask?: Uint8Array; distanceToCoast?: Uint16Array }
      | undefined;
    if (!(coastlineMetrics?.coastalWater instanceof Uint8Array)) throw new Error("Missing coastlineMetrics.coastalWater.");
    if (!(coastlineMetrics?.shelfMask instanceof Uint8Array)) throw new Error("Missing coastlineMetrics.shelfMask.");
    if (!(coastlineMetrics?.distanceToCoast instanceof Uint16Array)) throw new Error("Missing coastlineMetrics.distanceToCoast.");

    const beltDrivers = context.artifacts.get(morphologyArtifacts.beltDrivers.id) as
      | { boundaryCloseness?: Uint8Array; boundaryType?: Uint8Array }
      | undefined;
    if (!(beltDrivers?.boundaryCloseness instanceof Uint8Array)) throw new Error("Missing beltDrivers.boundaryCloseness.");
    if (!(beltDrivers?.boundaryType instanceof Uint8Array)) throw new Error("Missing beltDrivers.boundaryType.");

    // Basic “earthlike” guardrails: not all-coast, and shelf extends beyond adjacency ring.
    let waterTiles = 0;
    let coastTiles = 0;
    let oceanTiles = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!adapter.isWater(x, y)) continue;
        waterTiles += 1;
        const terrain = adapter.getTerrainType(x, y);
        if (terrain === COAST_TERRAIN) coastTiles += 1;
        else if (terrain === OCEAN_TERRAIN) oceanTiles += 1;
      }
    }
    expect(waterTiles).toBeGreaterThan(0);
    expect(coastTiles).toBeGreaterThan(0);
    expect(oceanTiles).toBeGreaterThan(0);

    const coastShare = coastTiles / waterTiles;
    // Wide but not “everything is coast”.
    expect(coastShare).toBeGreaterThan(0.02);
    expect(coastShare).toBeLessThan(0.75);

    let shorelineRing = 0;
    let shelfBeyondRing = 0;
    for (let i = 0; i < width * height; i++) {
      const dist = coastlineMetrics.distanceToCoast[i] | 0;
      if ((coastlineMetrics.coastalWater[i] | 0) === 1) shorelineRing += 1;
      if ((coastlineMetrics.shelfMask[i] | 0) === 1 && (coastlineMetrics.coastalWater[i] | 0) === 0 && dist >= 2) {
        shelfBeyondRing += 1;
      }
    }
    expect(shorelineRing).toBeGreaterThan(0);
    // Our “wow factor”: shelf extends out into water beyond the guaranteed shoreline ring.
    expect(shelfBeyondRing).toBeGreaterThan(0);
    expect(shelfBeyondRing).toBeLessThan(Math.max(1, Math.floor(waterTiles * 0.7)));

    // Margin-aware narrowing/widening: active margins should not have wide shelves far offshore,
    // while passive areas should still produce some shelf beyond 2 tiles.
    const { computeShelfMask } = morphologyDomain.ops;
    const shelfExplain = runOpValidated(
      computeShelfMask,
      {
        width,
        height,
        landMask: topography.landMask,
        bathymetry: topography.bathymetry,
        distanceToCoast: coastlineMetrics.distanceToCoast,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
      },
      { strategy: "default", config: {} }
    );

    let activeFarFromCoast = 0;
    let activeShelfFar = 0;
    let passiveShelfFar = 0;
    for (let i = 0; i < width * height; i++) {
      if ((topography.landMask[i] | 0) === 1) continue;
      const dist = coastlineMetrics.distanceToCoast[i] | 0;
      if (dist < 3) continue;

      const isActive = (shelfExplain.activeMarginMask[i] | 0) === 1;
      const isShelf = (coastlineMetrics.shelfMask[i] | 0) === 1;

      if (isActive) {
        activeFarFromCoast += 1;
        if (isShelf) activeShelfFar += 1;
      } else {
        if (isShelf) passiveShelfFar += 1;
      }
    }

    // These assertions are chosen to be robust: if there is active-margin water far from coasts,
    // it should remain ocean; passive shelves should still exist out at distance >= 3 somewhere.
    expect(passiveShelfFar).toBeGreaterThan(0);
    if (activeFarFromCoast > 0) {
      expect(activeShelfFar).toBe(0);
    }
  });
});
