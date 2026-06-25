import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { COAST_TERRAIN, createExtendedMapContext, OCEAN_TERRAIN } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import morphologyDomain from "../../src/domain/morphology/ops.js";
import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config.js";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
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

    const adapter = createMockAdapter({
      width,
      height,
      mapInfo,
      mapSizeId: 1,
      rng: createLabelRng(seed),
    });
    const context = createExtendedMapContext({ width, height }, adapter, env);
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
    standardRecipe.run(context, env, realismEarthlikeConfig, { log: () => {} });

    const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
      | { landMask?: Uint8Array; bathymetry?: Int16Array }
      | undefined;
    if (!(topography?.landMask instanceof Uint8Array))
      throw new Error("Missing topography.landMask.");
    if (!(topography?.bathymetry instanceof Int16Array))
      throw new Error("Missing topography.bathymetry.");

    // The shelf + post-island coastline live in the morphology-shelf artifact now.
    const shelf = context.artifacts.get(morphologyArtifacts.shelf.id) as
      | { coastalWater?: Uint8Array; shelfMask?: Uint8Array; distanceToCoast?: Uint16Array }
      | undefined;
    if (!(shelf?.coastalWater instanceof Uint8Array))
      throw new Error("Missing shelf.coastalWater.");
    if (!(shelf?.shelfMask instanceof Uint8Array)) throw new Error("Missing shelf.shelfMask.");
    if (!(shelf?.distanceToCoast instanceof Uint16Array))
      throw new Error("Missing shelf.distanceToCoast.");

    const beltDrivers = context.artifacts.get(morphologyArtifacts.beltDrivers.id) as
      | { boundaryCloseness?: Uint8Array; boundaryType?: Uint8Array }
      | undefined;
    if (!(beltDrivers?.boundaryCloseness instanceof Uint8Array))
      throw new Error("Missing beltDrivers.boundaryCloseness.");
    if (!(beltDrivers?.boundaryType instanceof Uint8Array))
      throw new Error("Missing beltDrivers.boundaryType.");

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
    expect(coastShare).toBeLessThan(0.98);

    let shorelineRing = 0;
    let shelfBeyondRing = 0;
    for (let i = 0; i < width * height; i++) {
      const dist = shelf.distanceToCoast[i] | 0;
      if ((shelf.coastalWater[i] | 0) === 1) shorelineRing += 1;
      if ((shelf.shelfMask[i] | 0) === 1 && (shelf.coastalWater[i] | 0) === 0 && dist >= 2) {
        shelfBeyondRing += 1;
      }
    }
    expect(shorelineRing).toBeGreaterThan(0);
    // Our “wow factor”: shelf extends out into water beyond the guaranteed shoreline ring.
    expect(shelfBeyondRing).toBeGreaterThan(0);
    expect(shelfBeyondRing).toBeLessThan(Math.max(1, Math.floor(waterTiles * 0.7)));

    // Margin-aware physics: active (convergent/transform) margins must use a SHALLOWER
    // shelf-break depth than passive margins -> a narrower shelf where the seafloor allows.
    // We assert the physical LEVER (the per-tile break depth), not a tile-distance outcome:
    // the cap-free shelf narrows active margins by depth, so the visible contrast scales with
    // how strongly the generated bathymetry deepens at active margins (currently weakly
    // correlated -- a foundation/seafloor concern -- so a far-offshore share comparison is
    // confounded and is intentionally not asserted here).
    const { computeShelfMask } = morphologyDomain.ops;
    const shelfExplain = runOpValidated(
      computeShelfMask,
      {
        width,
        height,
        landMask: topography.landMask,
        bathymetry: topography.bathymetry,
        distanceToCoast: shelf.distanceToCoast,
        boundaryCloseness: beltDrivers.boundaryCloseness,
        boundaryType: beltDrivers.boundaryType,
      },
      { strategy: "default", config: {} }
    );

    let activeBreakSum = 0;
    let activeBreakN = 0;
    let passiveBreakSum = 0;
    let passiveBreakN = 0;
    for (let i = 0; i < width * height; i++) {
      if ((topography.landMask[i] | 0) === 1) continue;
      const breakDepth = shelfExplain.shelfBreakDepthByTile[i] | 0;
      if ((shelfExplain.activeMarginMask[i] | 0) === 1) {
        activeBreakSum += breakDepth;
        activeBreakN += 1;
      } else {
        passiveBreakSum += breakDepth;
        passiveBreakN += 1;
      }
    }
    expect(activeBreakN).toBeGreaterThan(0);
    expect(passiveBreakN).toBeGreaterThan(0);
    const meanActiveBreak = activeBreakSum / activeBreakN;
    const meanPassiveBreak = passiveBreakSum / passiveBreakN;
    // Shallower break on active margins => less negative depth => mean active > mean passive.
    expect(meanActiveBreak).toBeGreaterThan(meanPassiveBreak);
  });
});
