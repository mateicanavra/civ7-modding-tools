import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, type VizDumper } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { standardConfig } from "../support/standard-config.js";

describe("standard pipeline viz emissions", () => {
  it("emits expected dataTypeKeys across stages", () => {
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
        seenLayers.add(layer.dataTypeKey);
      },
      dumpPoints: (_trace, layer) => {
        seenLayers.add(layer.dataTypeKey);
      },
      dumpSegments: (_trace, layer) => {
        seenLayers.add(layer.dataTypeKey);
      },
      dumpGridFields: (_trace, layer) => {
        seenLayers.add(layer.dataTypeKey);
      },
    };

    context.viz = viz;
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
    standardRecipe.run(context, env, standardConfig, { log: () => {} });

    // Regression guard: never encode temporal slices into `dataTypeKey`.
    // Those should be `variantKey` instead (e.g. `era:<n>`), so the UI can
    // declutter by default while preserving depth behind a debug toggle.
    const explodedHistoryKeys = [...seenLayers].filter((key) => /^foundation\.tectonicHistory\.era\d+\./.test(key));
    expect(explodedHistoryKeys).toEqual([]);

    const expected = [
      "foundation.plates.tilePlateId",
      "foundation.tectonics.boundaryType",
      "foundation.tectonicHistory.boundaryType",
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
    const missing = expected.filter((dataTypeKey) => !seenLayers.has(dataTypeKey));
    expect(missing).toEqual([]);
  });

  it("declutters noisy layers behind debug visibility", () => {
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

    const metaByKey = new Map<string, unknown>();
    const viz: VizDumper = {
      outputRoot: "<test>",
      dumpGrid: (_trace, layer) => {
        metaByKey.set(layer.dataTypeKey, layer.meta);
      },
      dumpPoints: (_trace, layer) => {
        metaByKey.set(layer.dataTypeKey, layer.meta);
      },
      dumpSegments: (_trace, layer) => {
        metaByKey.set(layer.dataTypeKey, layer.meta);
      },
      dumpGridFields: (_trace, layer) => {
        metaByKey.set(layer.dataTypeKey, layer.meta);
      },
    };

    context.viz = viz;
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
    standardRecipe.run(context, env, standardConfig, { log: () => {} });

    const plateIdMeta = metaByKey.get("foundation.plates.tilePlateId") as any;
    expect(plateIdMeta?.visibility).toBe("default");

    const movementMeta = metaByKey.get("foundation.plates.tileMovement") as any;
    expect(movementMeta?.visibility).toBe("default");
    expect(movementMeta?.role).toBe("vector");

    const closenessMeta = metaByKey.get("foundation.plates.tileBoundaryCloseness") as any;
    expect(closenessMeta?.visibility).toBe("debug");

    const baseElevationMeta = metaByKey.get("foundation.crustTiles.baseElevation") as any;
    expect(baseElevationMeta?.visibility).toBe("debug");

    const albedoMeta = metaByKey.get("hydrology.cryosphere.albedo") as any;
    expect(albedoMeta?.visibility).toBe("debug");

    const permafrostMeta = metaByKey.get("ecology.biome.permafrost01") as any;
    expect(permafrostMeta?.visibility).toBe("debug");

    const rainfallAmpMeta = metaByKey.get("hydrology.climate.seasonality.rainfallAmplitude") as any;
    expect(rainfallAmpMeta?.visibility).toBe("debug");
  });
});
