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
      "morphology.coastlineMetrics.shelfMask",
      "morphology.shelf.capTiles",
      "morphology.routing.flowAccum",
      "map.morphology.coasts.waterClass",
      "map.morphology.mountains.mountainMask",
      "hydrology.climate.rainfall",
      "hydrology.hydrography.discharge",
      "map.hydrology.rivers.riverClass",
      "ecology.pedology.soilType",
      "ecology.pedology.fertility",
      "ecology.biome.biomeIndex",
      "ecology.biome.vegetationDensity",
      "map.ecology.featureType",
      "placement.landmassRegions.regionSlot",
      "placement.starts.startPosition",
    ];
    const missing = expected.filter((dataTypeKey) => !seenLayers.has(dataTypeKey));
    expect(missing).toEqual([]);
  });

  it("emits per-era variants for foundation tectonics", () => {
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

    const variantsByKey = new Map<string, Set<string>>();
    const recordVariant = (layer: { dataTypeKey: string; variantKey?: string | null }) => {
      if (!layer.variantKey) return;
      const entry = variantsByKey.get(layer.dataTypeKey) ?? new Set<string>();
      entry.add(layer.variantKey);
      variantsByKey.set(layer.dataTypeKey, entry);
    };

    const viz: VizDumper = {
      outputRoot: "<test>",
      dumpGrid: (_trace, layer) => recordVariant(layer),
      dumpPoints: (_trace, layer) => recordVariant(layer),
      dumpSegments: (_trace, layer) => recordVariant(layer),
      dumpGridFields: (_trace, layer) => recordVariant(layer),
    };

    context.viz = viz;
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
    standardRecipe.run(context, env, standardConfig, { log: () => {} });

    const historyBoundaryVariants = variantsByKey.get("foundation.history.boundaryType") ?? new Set<string>();
    expect([...historyBoundaryVariants].some((key) => /^era:\d+$/.test(key))).toBe(true);

    const snapshotBoundaryVariants = variantsByKey.get("foundation.tectonics.boundaryType") ?? new Set<string>();
    expect(snapshotBoundaryVariants.has("snapshot:latest")).toBe(true);

    const upliftVariants = variantsByKey.get("foundation.history.upliftPotential") ?? new Set<string>();
    expect([...upliftVariants].some((key) => /^era:\d+$/.test(key))).toBe(true);
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

    const boundaryTypeMetas = metasByKey.get("foundation.tectonics.boundaryType") as any[] | undefined;
    expect(boundaryTypeMetas?.some((m) => m?.visibility === "default" && m?.role === "edges")).toBe(true);
    expect(boundaryTypeMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const movementMetas = metasByKey.get("foundation.plates.tileMovement") as any[] | undefined;
    expect(movementMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(movementMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(movementMetas?.some((m) => m?.visibility === "default" && m?.role === "arrows")).toBe(true);
    expect(movementMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);

    const flowMetas = metasByKey.get("morphology.routing.flow") as any[] | undefined;
    expect(flowMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(flowMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(flowMetas?.some((m) => m?.visibility === "default" && m?.role === "arrows")).toBe(true);
    expect(flowMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);

    const closenessMetas = metasByKey.get("foundation.plates.tileBoundaryCloseness") as any[] | undefined;
    expect(closenessMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const baseElevationMetas = metasByKey.get("foundation.crustTiles.baseElevation") as any[] | undefined;
    expect(baseElevationMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const crustTypeMetas = metasByKey.get("foundation.crustTiles.type") as any[] | undefined;
    expect(crustTypeMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const sedimentMetas = metasByKey.get("morphology.substrate.sedimentDepth") as any[] | undefined;
    expect(sedimentMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const erodibilityMetas = metasByKey.get("morphology.substrate.erodibilityK") as any[] | undefined;
    expect(erodibilityMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const albedoMetas = metasByKey.get("hydrology.cryosphere.albedo") as any[] | undefined;
    expect(albedoMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const permafrostMetas = metasByKey.get("ecology.biome.permafrost01") as any[] | undefined;
    expect(permafrostMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const vegetationMetas = metasByKey.get("ecology.biome.vegetationDensity") as any[] | undefined;
    expect(vegetationMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(vegetationMetas?.some((m) => m?.visibility === "default" && m?.role === "centroids")).toBe(true);

    const fertilityMetas = metasByKey.get("ecology.pedology.fertility") as any[] | undefined;
    expect(fertilityMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(fertilityMetas?.some((m) => m?.visibility === "default" && m?.role === "centroids")).toBe(true);

    const sectorMetas = metasByKey.get("placement.starts.sectorId") as any[] | undefined;
    expect(sectorMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const startMetas = metasByKey.get("placement.starts.startPosition") as any[] | undefined;
    expect(startMetas?.some((m) => m?.visibility === "default" && m?.role === "membership")).toBe(true);

    const rainfallAmpMetas = metasByKey.get("hydrology.climate.seasonality.rainfallAmplitude") as any[] | undefined;
    expect(rainfallAmpMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const humidityAmpMetas = metasByKey.get("hydrology.climate.seasonality.humidityAmplitude") as any[] | undefined;
    expect(humidityAmpMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const snowMetas = metasByKey.get("hydrology.cryosphere.snowCover") as any[] | undefined;
    expect(snowMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const seaIceMetas = metasByKey.get("hydrology.cryosphere.seaIceCover") as any[] | undefined;
    expect(seaIceMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const rainfallMetas = metasByKey.get("hydrology.climate.rainfall") as any[] | undefined;
    expect(rainfallMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(
      rainfallMetas?.some((m) => m?.role === "centroids" && m?.label === "Rainfall (Baseline)" && m?.visibility === "default")
    ).toBe(true);
    expect(rainfallMetas?.some((m) => m?.role === "centroids" && m?.label === "Rainfall" && m?.visibility === "default")).toBe(true);

    const temperatureMetas = metasByKey.get("hydrology.climate.indices.surfaceTemperatureC") as any[] | undefined;
    expect(temperatureMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(
      temperatureMetas?.some((m) => m?.role === "centroids" && m?.label === "Surface Temperature (C)" && m?.visibility === "default")
    ).toBe(true);

    const windMetas = metasByKey.get("hydrology.wind.wind") as any[] | undefined;
    expect(windMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(windMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(windMetas?.some((m) => m?.visibility === "default" && m?.role === "arrows")).toBe(true);
    expect(windMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);

    const currentMetas = metasByKey.get("hydrology.current.current") as any[] | undefined;
    expect(currentMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(currentMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(currentMetas?.some((m) => m?.visibility === "default" && m?.role === "arrows")).toBe(true);
    expect(currentMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);

    const shelfMaskMetas = metasByKey.get("morphology.coastlineMetrics.shelfMask") as any[] | undefined;
    expect(shelfMaskMetas?.some((m) => m?.visibility === "default" && m?.palette === "categorical")).toBe(true);

    const activeMarginMetas = metasByKey.get("morphology.shelf.activeMarginMask") as any[] | undefined;
    expect(activeMarginMetas?.some((m) => m?.visibility === "default" && m?.role === "membership")).toBe(true);

    const capTilesMetas = metasByKey.get("morphology.shelf.capTiles") as any[] | undefined;
    expect(capTilesMetas?.some((m) => m?.visibility === "default" && m?.palette === "continuous")).toBe(true);

    const nearshoreMetas = metasByKey.get("morphology.shelf.nearshoreCandidateMask") as any[] | undefined;
    expect(nearshoreMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const depthGateMetas = metasByKey.get("morphology.shelf.depthGateMask") as any[] | undefined;
    expect(depthGateMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const waterClassMetas = metasByKey.get("map.morphology.coasts.waterClass") as any[] | undefined;
    expect(waterClassMetas?.some((m) => m?.visibility === "default" && m?.role === "membership")).toBe(true);
  });
});
