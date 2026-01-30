import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, type VizDumper } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { standardConfig } from "../support/standard-config.js";

describe("standard pipeline viz emissions", () => {
  it("emits expected layer ids across stages", () => {
    const width = 32;
    const height = 20;
    const seed = 1337;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
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

    const seenLayers = new Set<string>();
    const viz: VizDumper = {
      outputRoot: "<test>",
      dumpGrid: (_trace, layer) => {
        seenLayers.add(layer.layerId);
      },
      dumpPoints: (_trace, layer) => {
        seenLayers.add(layer.layerId);
      },
      dumpSegments: (_trace, layer) => {
        seenLayers.add(layer.layerId);
      },
    };

    context.viz = viz;
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
    standardRecipe.run(context, env, standardConfig, { log: () => {} });

    const expected = [
      "foundation.plates.tilePlateId",
      "morphology.topography.elevation",
      "morphology.routing.flowAccum",
      "map.morphology.mountains.mountainMask",
      "hydrology.climate.rainfall",
      "hydrology.hydrography.discharge",
      "map.hydrology.rivers.riverClass",
      "ecology.pedology.soilType",
      "ecology.biome.biomeIndex",
      "ecology.featureIntents.featureType",
      "placement.landmassRegions.regionSlot",
      "placement.starts.startPosition",
    ];
    const missing = expected.filter((layerId) => !seenLayers.has(layerId));
    expect(missing).toEqual([]);
  });
});
