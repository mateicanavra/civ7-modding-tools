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

    const metasByKey = new Map<string, unknown[]>();
    const viz: VizDumper = {
      outputRoot: "<test>",
      dumpGrid: (_trace, layer) => {
        metasByKey.set(layer.dataTypeKey, [...(metasByKey.get(layer.dataTypeKey) ?? []), layer.meta]);
      },
      dumpPoints: (_trace, layer) => {
        metasByKey.set(layer.dataTypeKey, [...(metasByKey.get(layer.dataTypeKey) ?? []), layer.meta]);
      },
      dumpSegments: (_trace, layer) => {
        metasByKey.set(layer.dataTypeKey, [...(metasByKey.get(layer.dataTypeKey) ?? []), layer.meta]);
      },
      dumpGridFields: (_trace, layer) => {
        metasByKey.set(layer.dataTypeKey, [...(metasByKey.get(layer.dataTypeKey) ?? []), layer.meta]);
      },
    };

    context.viz = viz;
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
    standardRecipe.run(context, env, standardConfig, { log: () => {} });

    const plateIdMetas = metasByKey.get("foundation.plates.tilePlateId") as any[] | undefined;
    expect(plateIdMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const movementMetas = metasByKey.get("foundation.plates.tileMovement") as any[] | undefined;
    expect(movementMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(movementMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(movementMetas?.some((m) => m?.visibility === "debug" && m?.role === "arrows")).toBe(true);
    expect(movementMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);

    const flowMetas = metasByKey.get("morphology.routing.flow") as any[] | undefined;
    expect(flowMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(flowMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(flowMetas?.some((m) => m?.visibility === "debug" && m?.role === "arrows")).toBe(true);
    expect(flowMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);

    const closenessMetas = metasByKey.get("foundation.plates.tileBoundaryCloseness") as any[] | undefined;
    expect(closenessMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const baseElevationMetas = metasByKey.get("foundation.crustTiles.baseElevation") as any[] | undefined;
    expect(baseElevationMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const crustTypeMetas = metasByKey.get("foundation.crustTiles.type") as any[] | undefined;
    expect(crustTypeMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const albedoMetas = metasByKey.get("hydrology.cryosphere.albedo") as any[] | undefined;
    expect(albedoMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const permafrostMetas = metasByKey.get("ecology.biome.permafrost01") as any[] | undefined;
    expect(permafrostMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const rainfallAmpMetas = metasByKey.get("hydrology.climate.seasonality.rainfallAmplitude") as any[] | undefined;
    expect(rainfallAmpMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const rainfallMetas = metasByKey.get("hydrology.climate.rainfall") as any[] | undefined;
    expect(rainfallMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(
      rainfallMetas?.some((m) => m?.role === "centroids" && m?.label === "Rainfall (Baseline)" && m?.visibility === "debug")
    ).toBe(true);
    expect(rainfallMetas?.some((m) => m?.role === "centroids" && m?.label === "Rainfall" && m?.visibility === "debug")).toBe(true);

    const temperatureMetas = metasByKey.get("hydrology.climate.indices.surfaceTemperatureC") as any[] | undefined;
    expect(temperatureMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(
      temperatureMetas?.some((m) => m?.role === "centroids" && m?.label === "Surface Temperature (C)" && m?.visibility === "debug")
    ).toBe(true);

    const windMetas = metasByKey.get("hydrology.wind.wind") as any[] | undefined;
    expect(windMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(windMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(windMetas?.some((m) => m?.visibility === "debug" && m?.role === "arrows")).toBe(true);
    expect(windMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);

    const currentMetas = metasByKey.get("hydrology.current.current") as any[] | undefined;
    expect(currentMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(currentMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(currentMetas?.some((m) => m?.visibility === "debug" && m?.role === "arrows")).toBe(true);
    expect(currentMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);
  });
});
