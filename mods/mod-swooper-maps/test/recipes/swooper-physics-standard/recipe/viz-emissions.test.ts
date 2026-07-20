import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext, type StepFacetSinks } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import type { VizLayerMeta } from "@swooper/mapgen-viz";

import standardRecipe from "../../../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../../../src/recipes/standard/runtime.js";
import { standardConfig } from "../../../support/standard-config.js";

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

    const seenLayers = new Set<string>();
    const captureViz: NonNullable<StepFacetSinks["viz"]> = (projections) => {
      for (const projection of projections) seenLayers.add(projection.dataTypeKey);
    };

    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });
    standardRecipe.run(context, standardConfig, {
      facets: { viz: captureViz },
      log: () => {},
    });

    // Regression guard: never encode temporal slices into `dataTypeKey`.
    // Those should be `variantKey` instead (e.g. `era:<n>`), so the UI can
    // declutter by default while preserving depth behind a debug toggle.
    const explodedHistoryKeys = [...seenLayers].filter((key) =>
      /^foundation\.tectonicHistory\.era\d+\./.test(key)
    );
    expect(explodedHistoryKeys).toEqual([]);

    const expected = [
      "foundation.plates.tilePlateId",
      "foundation.tectonics.boundaryType",
      "morphology.topography.elevation",
      "morphology.shelf.shelfMask",
      "morphology.shelf.breakDepth",
      "morphology.routing.flowAccum",
      "map.morphology.coasts.waterClass",
      "map.morphology.coasts.sourceCoastMask",
      "map.morphology.coasts.coastRingMask",
      "morphology.mountains.mountainMask",
      "hydrology.climate.rainfall",
      "hydrology.hydrography.discharge",
      "map.hydrology.lakes.plannedLakeMask",
      "map.hydrology.lakes.engineLakeMask",
      "map.hydrology.lakes.rejectedLakeMask",
      "map.rivers.riverClass",
      "map.rivers.projectedRiverMask",
      "map.rivers.plannedMinorRiverMask",
      "map.rivers.plannedMajorRiverMask",
      "map.rivers.engineRiverMask",
      "map.rivers.engineNavigableRiverMetadataMask",
      "map.rivers.riverMismatchMask",
      "map.rivers.engineMinorRiverMask",
      "ecology.pedology.soilType",
      "ecology.pedology.fertility",
      "ecology.biome.biomeIndex",
      "ecology.biome.vegetationDensity",
      "map.ecology.featureType",
      "placement.landmassRegions.regionSlot",
      "placement.starts.viabilityScore",
      "placement.starts.viabilityTier",
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

    const variantsByKey = new Map<string, Set<string>>();
    const captureViz: NonNullable<StepFacetSinks["viz"]> = (projections) => {
      for (const projection of projections) {
        if (!projection.variantKey) continue;
        const entry = variantsByKey.get(projection.dataTypeKey) ?? new Set<string>();
        entry.add(projection.variantKey);
        variantsByKey.set(projection.dataTypeKey, entry);
      }
    };

    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });
    standardRecipe.run(context, standardConfig, {
      facets: { viz: captureViz },
      log: () => {},
    });

    const historyBoundaryVariants =
      variantsByKey.get("foundation.history.boundaryType") ?? new Set<string>();
    expect([...historyBoundaryVariants].some((key) => /^era:\d+$/.test(key))).toBe(true);

    const snapshotBoundaryVariants =
      variantsByKey.get("foundation.tectonics.boundaryType") ?? new Set<string>();
    expect(snapshotBoundaryVariants.has("snapshot:latest")).toBe(true);

    const upliftVariants =
      variantsByKey.get("foundation.history.upliftPotential") ?? new Set<string>();
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

    const metasByKey = new Map<string, Array<VizLayerMeta | undefined>>();
    const captureViz: NonNullable<StepFacetSinks["viz"]> = (projections) => {
      for (const projection of projections) {
        metasByKey.set(projection.dataTypeKey, [
          ...(metasByKey.get(projection.dataTypeKey) ?? []),
          projection.meta,
        ]);
      }
    };

    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]" });
    standardRecipe.run(context, standardConfig, {
      facets: { viz: captureViz },
      log: () => {},
    });

    const plateIdMetas = metasByKey.get("foundation.plates.tilePlateId");
    expect(plateIdMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const boundaryTypeMetas = metasByKey.get("foundation.tectonics.boundaryType");
    expect(boundaryTypeMetas?.some((m) => m?.visibility === "default" && m?.role === "edges")).toBe(
      true
    );
    expect(boundaryTypeMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const movementMetas = metasByKey.get("foundation.plates.tileMovement");
    expect(movementMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(
      true
    );
    expect(movementMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(
      true
    );
    expect(movementMetas?.some((m) => m?.visibility === "default" && m?.role === "arrows")).toBe(
      true
    );
    expect(movementMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(
      true
    );

    const flowMetas = metasByKey.get("morphology.routing.flow");
    expect(flowMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(flowMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(flowMetas?.some((m) => m?.visibility === "default" && m?.role === "arrows")).toBe(true);
    expect(flowMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);

    const closenessMetas = metasByKey.get("foundation.plates.tileBoundaryCloseness");
    expect(closenessMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const baseElevationMetas = metasByKey.get("foundation.crustTiles.baseElevation");
    expect(baseElevationMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const crustTypeMetas = metasByKey.get("foundation.crustTiles.type");
    expect(crustTypeMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const sedimentMetas = metasByKey.get("morphology.substrate.sedimentDepth");
    expect(sedimentMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const erodibilityMetas = metasByKey.get("morphology.substrate.erodibilityK");
    expect(erodibilityMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const albedoMetas = metasByKey.get("hydrology.cryosphere.albedo");
    expect(albedoMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const plannedLakeMetas = metasByKey.get("map.hydrology.lakes.plannedLakeMask");
    expect(
      plannedLakeMetas?.some((m) => m?.role === "physics" && m?.visibility === "default")
    ).toBe(true);

    const engineLakeMetas = metasByKey.get("map.hydrology.lakes.engineLakeMask");
    expect(engineLakeMetas?.some((m) => m?.role === "engine" && m?.visibility === "default")).toBe(
      true
    );

    const rejectedLakeMetas = metasByKey.get("map.hydrology.lakes.rejectedLakeMask");
    expect(rejectedLakeMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const permafrostMetas = metasByKey.get("ecology.biome.permafrost01");
    expect(permafrostMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const vegetationMetas = metasByKey.get("ecology.biome.vegetationDensity");
    expect(vegetationMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(
      vegetationMetas?.some((m) => m?.visibility === "default" && m?.role === "centroids")
    ).toBe(true);

    const fertilityMetas = metasByKey.get("ecology.pedology.fertility");
    expect(fertilityMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(
      fertilityMetas?.some((m) => m?.visibility === "default" && m?.role === "centroids")
    ).toBe(true);

    // Inert start-sector machinery (and its always-on grid viz) was removed in
    // placement-realignment S4; landmass-region slots are the real regional layer.
    expect(metasByKey.has("placement.starts.sectorId")).toBe(false);

    const startViabilityMetas = metasByKey.get("placement.starts.viabilityScore");
    expect(startViabilityMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const startTierMetas = metasByKey.get("placement.starts.viabilityTier");
    expect(
      startTierMetas?.some(
        (m) =>
          m?.visibility === "default" &&
          typeof m?.palette === "object" &&
          m.palette.kind === "categorical" &&
          m?.categories?.length === 5
      )
    ).toBe(true);

    const startMetas = metasByKey.get("placement.starts.startPosition");
    expect(startMetas?.some((m) => m?.visibility === "default" && m?.role === "membership")).toBe(
      true
    );

    const rainfallAmpMetas = metasByKey.get("hydrology.climate.seasonality.rainfallAmplitude");
    expect(rainfallAmpMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const humidityAmpMetas = metasByKey.get("hydrology.climate.seasonality.humidityAmplitude");
    expect(humidityAmpMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const snowMetas = metasByKey.get("hydrology.cryosphere.snowCover");
    expect(snowMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const seaIceMetas = metasByKey.get("hydrology.cryosphere.seaIceCover");
    expect(seaIceMetas?.some((m) => m?.visibility === "default")).toBe(true);

    const rainfallMetas = metasByKey.get("hydrology.climate.rainfall");
    expect(rainfallMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(
      rainfallMetas?.some(
        (m) =>
          m?.role === "centroids" &&
          m?.label === "Rainfall (Baseline)" &&
          m?.visibility === "default"
      )
    ).toBe(true);
    expect(
      rainfallMetas?.some(
        (m) => m?.role === "centroids" && m?.label === "Rainfall" && m?.visibility === "default"
      )
    ).toBe(true);

    const temperatureMetas = metasByKey.get("hydrology.climate.indices.surfaceTemperatureC");
    expect(temperatureMetas?.some((m) => m?.visibility === "default")).toBe(true);
    expect(
      temperatureMetas?.some(
        (m) =>
          m?.role === "centroids" &&
          m?.label === "Surface Temperature (C)" &&
          m?.visibility === "default"
      )
    ).toBe(true);

    const windMetas = metasByKey.get("hydrology.wind.wind");
    expect(windMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(true);
    expect(windMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(true);
    expect(windMetas?.some((m) => m?.visibility === "default" && m?.role === "arrows")).toBe(true);
    expect(windMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(true);

    const currentMetas = metasByKey.get("hydrology.current.current");
    expect(currentMetas?.some((m) => m?.visibility === "default" && m?.role === "vector")).toBe(
      true
    );
    expect(currentMetas?.some((m) => m?.visibility === "debug" && m?.role === "magnitude")).toBe(
      true
    );
    expect(currentMetas?.some((m) => m?.visibility === "default" && m?.role === "arrows")).toBe(
      true
    );
    expect(currentMetas?.some((m) => m?.visibility === "debug" && m?.role === "centroids")).toBe(
      true
    );

    const shelfMaskMetas = metasByKey.get("morphology.shelf.shelfMask");
    expect(
      shelfMaskMetas?.some(
        (m) =>
          m?.visibility === "default" &&
          typeof m.palette === "object" &&
          m.palette.kind === "categorical"
      )
    ).toBe(true);

    const activeMarginMetas = metasByKey.get("morphology.shelf.activeMarginMask");
    expect(
      activeMarginMetas?.some((m) => m?.visibility === "default" && m?.role === "membership")
    ).toBe(true);

    const breakDepthMetas = metasByKey.get("morphology.shelf.breakDepth");
    expect(
      breakDepthMetas?.some(
        (m) =>
          m?.visibility === "default" &&
          typeof m.palette === "object" &&
          m.palette.kind === "continuous"
      )
    ).toBe(true);

    const nearshoreMetas = metasByKey.get("morphology.shelf.nearshoreCandidateMask");
    expect(nearshoreMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const depthGateMetas = metasByKey.get("morphology.shelf.depthGateMask");
    expect(depthGateMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const waterClassMetas = metasByKey.get("map.morphology.coasts.waterClass");
    expect(
      waterClassMetas?.some((m) => m?.visibility === "default" && m?.role === "membership")
    ).toBe(true);

    const sourceCoastMetas = metasByKey.get("map.morphology.coasts.sourceCoastMask");
    expect(
      sourceCoastMetas?.some((m) => m?.visibility === "default" && m?.role === "membership")
    ).toBe(true);

    const coastRingMetas = metasByKey.get("map.morphology.coasts.coastRingMask");
    expect(coastRingMetas?.some((m) => m?.visibility === "debug" && m?.role === "membership")).toBe(
      true
    );

    const projectedRiverMetas = metasByKey.get("map.rivers.projectedRiverMask");
    expect(
      projectedRiverMetas?.some((m) => m?.visibility === "default" && m?.role === "projection")
    ).toBe(true);

    const minorRiverIntentMetas = metasByKey.get("map.rivers.plannedMinorRiverMask");
    expect(
      minorRiverIntentMetas?.some((m) => m?.visibility === "default" && m?.role === "physics")
    ).toBe(true);

    const majorRiverIntentMetas = metasByKey.get("map.rivers.plannedMajorRiverMask");
    expect(
      majorRiverIntentMetas?.some((m) => m?.visibility === "default" && m?.role === "physics")
    ).toBe(true);

    const engineRiverMetas = metasByKey.get("map.rivers.engineRiverMask");
    expect(engineRiverMetas?.some((m) => m?.visibility === "default" && m?.role === "engine")).toBe(
      true
    );

    const engineNavigableMetadataMetas = metasByKey.get(
      "map.rivers.engineNavigableRiverMetadataMask"
    );
    expect(
      engineNavigableMetadataMetas?.some((m) => m?.visibility === "debug" && m?.role === "engine")
    ).toBe(true);

    const riverMismatchMetas = metasByKey.get("map.rivers.riverMismatchMask");
    expect(riverMismatchMetas?.some((m) => m?.visibility === "debug")).toBe(true);

    const engineMinorRiverMetas = metasByKey.get("map.rivers.engineMinorRiverMask");
    expect(
      engineMinorRiverMetas?.some((m) => m?.visibility === "debug" && m?.role === "engine")
    ).toBe(true);
  });
});
