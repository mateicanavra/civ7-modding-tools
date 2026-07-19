import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import standardRecipe from "../../../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../../../src/recipes/standard/runtime.js";
import { artifacts as morphologyArtifacts } from "../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { standardConfig } from "../../../support/standard-config.js";

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

    const setup = admitMapSetup({
      mapSeed: seed,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
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
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });
    standardRecipe.run(context, standardConfig, { log: () => {} });

    // The shelf + post-island coastline live in the morphology-shelf artifact now.
    const shelf = context.artifacts.get(morphologyArtifacts.shelf.id) as
      | { coastalWater?: Uint8Array; shelfMask?: Uint8Array; distanceToCoast?: Uint16Array }
      | undefined;
    if (!(shelf?.coastalWater instanceof Uint8Array))
      throw new Error("Missing shelf.coastalWater.");
    if (!(shelf?.shelfMask instanceof Uint8Array)) throw new Error("Missing shelf.shelfMask.");
    if (!(shelf?.distanceToCoast instanceof Uint16Array))
      throw new Error("Missing shelf.distanceToCoast.");

    // Basic “earthlike” guardrails: not all-coast, and shelf extends beyond adjacency ring.
    let waterTiles = 0;
    let coastTiles = 0;
    let oceanTiles = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!adapter.isWater(x, y)) continue;
        waterTiles += 1;
        const terrain = adapter.getTerrainType(x, y);
        if (terrain === coastTerrain) coastTiles += 1;
        else if (terrain === oceanTerrain) oceanTiles += 1;
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
  });
});
