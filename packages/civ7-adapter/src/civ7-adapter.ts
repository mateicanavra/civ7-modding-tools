/**
 * Civ7Adapter - Production implementation using Civ7 engine APIs
 *
 * This is the ONLY module allowed to import /base-standard/... paths.
 * All other code must consume the EngineAdapter interface.
 */

/// <reference types="@civ7/types" />

import type {
  DiscoveryCatalogEntry,
  DiscoveryPlacementIntent,
  DiscoveryPlacementOutcome,
  EngineAdapter,
  FeatureData,
  LakeProjectionResult,
  LandmassIdName,
  MapInfo,
  MapInitParams,
  MapSizeId,
  NaturalWonderCatalogEntry,
  NaturalWonderPlacementOutcome,
  PlotTagName,
  ResourceCatalogEntry,
  ResourcePlacementIntent,
  ResourcePlacementOutcome,
  RiverProjectionResult,
  VoronoiUtils,
} from "./types.js";
import { ENGINE_EFFECT_TAGS } from "./effects.js";
import { DISCOVERY_CATALOG } from "./manual-catalogs/discoveries.js";
import { NO_RESOURCE, PLACEABLE_RESOURCE_TYPE_IDS } from "./resource-constants.js";
import {
  CIV7_BROWSER_TABLES_V0,
  NATURAL_WONDER_CATALOG,
  NO_RIVER_TYPE,
  getNaturalWonderFootprintIndices,
} from "@civ7/map-policy";

type FeaturePolicy = Readonly<{
  noLake: boolean;
  minimumElevation?: number;
  placementClass?: string;
  naturalWonderTiles?: number;
  naturalWonderDirection?: number;
}>;

const FEATURE_POLICIES = CIV7_BROWSER_TABLES_V0.featurePolicies as
  Record<string, FeaturePolicy | undefined>;

// Import from /base-standard/... — these are external Civ7 runtime paths
// resolved by the game's module loader, not TypeScript
import "/base-standard/maps/map-globals.js";
// Load Voronoi utilities for plate generation.
// @ts-ignore - resolved only at Civ7 runtime
import { VoronoiUtils as CivVoronoiUtils } from "/base-standard/scripts/voronoi-utils.js";
// Vanilla Civ7 biomes/features live in feature-biome-generator.js
// @ts-ignore - resolved only at Civ7 runtime
// prettier-ignore
import { designateBiomes as civ7DesignateBiomes, addFeatures as civ7AddFeatures } from "/base-standard/maps/feature-biome-generator.js";
// @ts-ignore - resolved only at Civ7 runtime
import { generateSnow as civ7GenerateSnow } from "/base-standard/maps/snow-generator.js";
// @ts-ignore - resolved only at Civ7 runtime
import { generateDiscoveries as civ7GenerateDiscoveries } from "/base-standard/maps/discovery-generator.js";
// @ts-ignore - resolved only at Civ7 runtime
import * as civ7ResourceGeneratorModule from "/base-standard/maps/resource-generator.js";
// @ts-ignore - resolved only at Civ7 runtime
// prettier-ignore
import { assignStartPositions as civ7AssignStartPositions, chooseStartSectors as civ7ChooseStartSectors } from "/base-standard/maps/assign-starting-plots.js";
// @ts-ignore - resolved only at Civ7 runtime
import { needHumanNearEquator as civ7NeedHumanNearEquator } from "/base-standard/maps/map-utilities.js";
// @ts-ignore - resolved only at Civ7 runtime
import { assignAdvancedStartRegions as civ7AssignAdvancedStartRegions } from "/base-standard/maps/assign-advanced-start-region.js";
// Elevation terrain generator (lakes/coasts)
// @ts-ignore - resolved only at Civ7 runtime
// prettier-ignore
import { generateLakes as civ7GenerateLakes, expandCoasts as civ7ExpandCoasts } from "/base-standard/maps/elevation-terrain-generator.js";

/**
 * Production adapter wrapping GameplayMap, TerrainBuilder, AreaBuilder, FractalBuilder
 */
export class Civ7Adapter implements EngineAdapter {
  readonly width: number;
  readonly height: number;
  private readonly effectEvidence = new Set<string>();

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  private recordEffect(effectId: string): void {
    this.effectEvidence.add(effectId);
  }

  private recordPlacementEffect(): void {
    this.recordEffect(ENGINE_EFFECT_TAGS.placementApplied);
  }

  private countPlacedResources(): number {
    const noResource = this.NO_RESOURCE | 0;
    let count = 0;
    const { width, height } = this;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((this.getResourceType(x, y) | 0) !== noResource) count += 1;
      }
    }
    return count;
  }

  verifyEffect(effectId: string): boolean {
    if (effectId === "effect:engine.landmassApplied") {
      let hasLand = false;
      let hasWater = false;
      const { width, height } = this;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (this.isWater(x, y)) hasWater = true;
          else hasLand = true;
          if (hasLand && hasWater) return true;
        }
      }
      return false;
    }

    if (effectId === "effect:engine.coastlinesApplied") {
      const coastTerrain = this.getTerrainTypeIndex("TERRAIN_COAST");
      if (coastTerrain < 0) return false;
      const { width, height } = this;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (this.getTerrainType(x, y) === coastTerrain) return true;
        }
      }
      return false;
    }

    if (effectId === "effect:engine.riversModeled") {
      const { width, height } = this;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (this.isAdjacentToRivers(x, y, 1)) return true;
        }
      }
      return false;
    }

    return this.effectEvidence.has(effectId);
  }

  // === MAP INIT / MAP INFO ===

  getMapSizeId(): MapSizeId {
    // GameplayMap.getMapSize() is the canonical map-size selection id from game settings.
    return GameplayMap.getMapSize();
  }

  lookupMapInfo(mapSizeId: MapSizeId): MapInfo | null {
    if (!GameInfo?.Maps?.lookup) return null;

    const key: MapSizeId =
      typeof mapSizeId === "string" && /^[0-9]+$/.test(mapSizeId) ? Number(mapSizeId) : mapSizeId;

    const primary = GameInfo.Maps.lookup(key as any) as unknown;
    const fallback =
      key !== mapSizeId ? (GameInfo.Maps.lookup(mapSizeId as any) as unknown) : undefined;

    return ((primary ?? fallback) as MapInfo | undefined) ?? null;
  }

  setMapInitData(params: MapInitParams): void {
    engine.call("SetMapInitData", params);
  }

  // === TERRAIN READS ===

  isWater(x: number, y: number): boolean {
    return GameplayMap.isWater(x, y);
  }

  isLake(x: number, y: number): boolean {
    return GameplayMap.isLake(x, y);
  }

  getAreaId(x: number, y: number): number {
    return GameplayMap.getAreaId(x, y);
  }

  isMountain(x: number, y: number): boolean {
    if (typeof GameplayMap.isMountain === "function") {
      return GameplayMap.isMountain(x, y);
    }
    // Fallback: check elevation >= 500
    return GameplayMap.getElevation(x, y) >= 500;
  }

  isAdjacentToRivers(x: number, y: number, radius = 1): boolean {
    return GameplayMap.isAdjacentToRivers(x, y, radius);
  }

  getRiverType(x: number, y: number): number {
    const map = GameplayMap as unknown as {
      getRiverType?: (x: number, y: number) => number;
    };
    const riverTypes = (globalThis as typeof globalThis & {
      RiverTypes?: Record<string, number>;
    }).RiverTypes;
    const noRiverType =
      typeof riverTypes?.NO_RIVER === "number" ? riverTypes.NO_RIVER | 0 : NO_RIVER_TYPE;
    return typeof map.getRiverType === "function" ? map.getRiverType(x, y) | 0 : noRiverType;
  }

  isRiver(x: number, y: number): boolean {
    const map = GameplayMap as unknown as {
      isRiver?: (x: number, y: number) => boolean;
    };
    if (typeof map.isRiver === "function") return map.isRiver(x, y);
    const riverTypes = (globalThis as typeof globalThis & {
      RiverTypes?: Record<string, number>;
    }).RiverTypes;
    const noRiverType =
      typeof riverTypes?.NO_RIVER === "number" ? riverTypes.NO_RIVER | 0 : NO_RIVER_TYPE;
    return this.getRiverType(x, y) !== noRiverType;
  }

  isNavigableRiver(x: number, y: number): boolean {
    const map = GameplayMap as unknown as {
      isNavigableRiver?: (x: number, y: number) => boolean;
    };
    if (typeof map.isNavigableRiver === "function") return map.isNavigableRiver(x, y);
    const riverTypes = (globalThis as typeof globalThis & {
      RiverTypes?: Record<string, number>;
    }).RiverTypes;
    const navigableRiverType = riverTypes?.RIVER_NAVIGABLE;
    return typeof navigableRiverType === "number" && this.getRiverType(x, y) === navigableRiverType;
  }

  getElevation(x: number, y: number): number {
    return GameplayMap.getElevation(x, y);
  }

  getTerrainType(x: number, y: number): number {
    return GameplayMap.getTerrainType(x, y);
  }

  getTerrainTypeIndex(name: string): number {
    const terrains = GameInfo?.Terrains;
    if (!terrains) return -1;
    const terrain = terrains.find((t) => t.TerrainType === name) as
      | { Index?: number; $index?: number }
      | undefined;
    if (typeof terrain?.Index === "number") return terrain.Index;
    if (typeof terrain?.$index === "number") return terrain.$index;
    return -1;
  }

  getRainfall(x: number, y: number): number {
    return GameplayMap.getRainfall(x, y);
  }

  getTemperature(x: number, y: number): number {
    return GameplayMap.getTemperature(x, y);
  }

  getLatitude(x: number, y: number): number {
    return GameplayMap.getPlotLatitude(x, y);
  }

  // === TERRAIN WRITES ===

  setTerrainType(x: number, y: number, terrainType: number): void {
    TerrainBuilder.setTerrainType(x, y, terrainType);
  }

  setRainfall(x: number, y: number, rainfall: number): void {
    TerrainBuilder.setRainfall(x, y, rainfall);
  }

  setLandmassRegionId(x: number, y: number, regionId: number): void {
    TerrainBuilder.setLandmassRegionId(x, y, regionId);
  }

  setLandmassId(x: number, y: number, regionId: number): void {
    this.setLandmassRegionId(x, y, regionId);
  }

  addPlotTag(x: number, y: number, plotTag: number): void {
    TerrainBuilder.addPlotTag(x, y, plotTag);
  }

  setPlotTag(x: number, y: number, plotTag: number): void {
    TerrainBuilder.setPlotTag(x, y, plotTag);
  }

  getPlotTagId(name: PlotTagName): number {
    if (typeof PlotTags === "undefined") {
      throw new Error(`[Adapter] PlotTags global is unavailable (PLOT_TAG_${name}).`);
    }
    const value = (PlotTags as Record<string, number>)[`PLOT_TAG_${name}`];
    if (typeof value !== "number") {
      throw new Error(`[Adapter] PlotTags missing PLOT_TAG_${name}.`);
    }
    return value;
  }

  getLandmassId(name: LandmassIdName): number {
    if (typeof LandmassRegion === "undefined") {
      throw new Error(`[Adapter] LandmassRegion global is unavailable (LANDMASS_REGION_${name}).`);
    }
    const value = (LandmassRegion as Record<string, number>)[`LANDMASS_REGION_${name}`];
    if (typeof value !== "number") {
      throw new Error(`[Adapter] LandmassRegion missing LANDMASS_REGION_${name}.`);
    }
    return value;
  }

  // === FEATURE READS/WRITES ===

  getFeatureType(x: number, y: number): number {
    return GameplayMap.getFeatureType(x, y);
  }

  setFeatureType(x: number, y: number, featureData: FeatureData): void {
    TerrainBuilder.setFeatureType(x, y, featureData);
    this.recordEffect(ENGINE_EFFECT_TAGS.featuresApplied);
  }

  canHaveFeature(x: number, y: number, featureType: number): boolean {
    return TerrainBuilder.canHaveFeature(x, y, featureType);
  }

  canHaveFeatureParam(x: number, y: number, featureData: FeatureData): boolean {
    const tb = TerrainBuilder as unknown as {
      canHaveFeatureParam?: (
        x: number,
        y: number,
        featureType: number,
        featureData: FeatureData
      ) => boolean;
    };
    if (typeof tb.canHaveFeatureParam !== "function") {
      return this.canHaveFeature(x, y, featureData.Feature);
    }
    return tb.canHaveFeatureParam(x, y, featureData.Feature, featureData);
  }

  get NO_RESOURCE(): number {
    return NO_RESOURCE;
  }

  getResourceType(x: number, y: number): number {
    return GameplayMap.getResourceType(x, y);
  }

  setResourceType(x: number, y: number, resourceType: number): void {
    const rb = (
      globalThis as typeof globalThis & {
        ResourceBuilder?: {
          setResourceType?: (x: number, y: number, resourceType: number) => void;
        };
      }
    ).ResourceBuilder;
    if (!rb?.setResourceType) {
      throw new Error("[Adapter] ResourceBuilder.setResourceType is unavailable.");
    }
    rb.setResourceType(x, y, resourceType);
    this.recordPlacementEffect();
  }

  canHaveResource(x: number, y: number, resourceType: number): boolean {
    if ((resourceType | 0) === (this.NO_RESOURCE | 0)) return false;
    const rb = (
      globalThis as typeof globalThis & {
        ResourceBuilder?: {
          canHaveResource?: (
            x: number,
            y: number,
            resourceType: number,
            ignoreWeight?: boolean
          ) => boolean;
        };
      }
    ).ResourceBuilder;
    if (!rb?.canHaveResource) {
      throw new Error("[Adapter] ResourceBuilder.canHaveResource is unavailable.");
    }
    return rb.canHaveResource(x, y, resourceType, false);
  }

  getPlaceableResourceTypes(): number[] {
    return [...PLACEABLE_RESOURCE_TYPE_IDS];
  }

  getResourceCatalog(): ResourceCatalogEntry[] {
    // Live runtime catalog: GameInfo.Resources stays behind the adapter so
    // recipe-layer telemetry never reads engine globals directly.
    const table = (globalThis as { GameInfo?: { Resources?: Iterable<unknown> } }).GameInfo
      ?.Resources;
    if (!table) return [];
    const rows: ResourceCatalogEntry[] = [];
    for (const raw of table) {
      const row = raw as {
        Index?: unknown;
        $index?: unknown;
        ResourceType?: unknown;
        ResourceClassType?: unknown;
        Name?: unknown;
      };
      const index =
        typeof row.Index === "number" && Number.isFinite(row.Index)
          ? Math.trunc(row.Index)
          : typeof row.$index === "number" && Number.isFinite(row.$index)
            ? Math.trunc(row.$index)
            : null;
      const resourceType =
        typeof row.ResourceType === "string" && row.ResourceType.length > 0
          ? row.ResourceType
          : null;
      if (index === null || resourceType === null) continue;
      rows.push({
        index,
        resourceType,
        resourceClassType:
          typeof row.ResourceClassType === "string" && row.ResourceClassType.length > 0
            ? row.ResourceClassType
            : null,
        name: typeof row.Name === "string" && row.Name.length > 0 ? row.Name : null,
      });
    }
    return rows.sort((a, b) => a.index - b.index);
  }

  placeResourceIntent(
    width: number,
    height: number,
    intent: ResourcePlacementIntent
  ): ResourcePlacementOutcome {
    // D4 placement reconciliation treats Civ7 feasibility as adapter-owned.
    // The recipe supplies deterministic intent; this boundary translates it
    // into an engine write plus readback evidence without falling back to the
    // aggregate official resource generator.
    const resolvedWidth = Math.max(0, Math.trunc(width));
    const resolvedHeight = Math.max(0, Math.trunc(height));
    const plotIndex = Number.isFinite(intent.plotIndex) ? Math.trunc(intent.plotIndex) : -1;
    const resourceType = Number.isFinite(intent.resourceType)
      ? Math.trunc(intent.resourceType)
      : this.NO_RESOURCE;
    const y = resolvedWidth > 0 ? Math.trunc(plotIndex / resolvedWidth) : -1;
    const x = resolvedWidth > 0 ? plotIndex - y * resolvedWidth : -1;

    if (plotIndex < 0 || x < 0 || y < 0 || x >= resolvedWidth || y >= resolvedHeight) {
      return { status: "rejected", plotIndex, x, y, resourceType, reason: "out-of-bounds" };
    }
    if (resourceType < 0 || resourceType === (this.NO_RESOURCE | 0)) {
      return { status: "rejected", plotIndex, x, y, resourceType, reason: "invalid-resource-type" };
    }
    if (!this.canHaveResource(x, y, resourceType)) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        resourceType,
        reason: "cannot-have-resource",
        observedResourceType: this.getResourceType(x, y),
      };
    }

    this.setResourceType(x, y, resourceType);
    const observedResourceType = this.getResourceType(x, y);
    if ((observedResourceType | 0) !== (resourceType | 0)) {
      return {
        status: "mismatch",
        plotIndex,
        x,
        y,
        resourceType,
        reason: "wrong-resource-type",
        observedResourceType,
      };
    }
    return { status: "placed", plotIndex, x, y, resourceType, observedResourceType };
  }

  // === PLOT EFFECTS ===

  getPlotEffectTypesContainingTags(tags: string[]): number[] {
    if (typeof MapPlotEffects === "undefined") {
      throw new Error("[Adapter] MapPlotEffects global is unavailable.");
    }
    const result = MapPlotEffects.getPlotEffectTypesContainingTags(tags);
    return Array.isArray(result) ? result : [];
  }

  getPlotEffectTypeIndex(name: string): number {
    const plotEffects = GameInfo?.PlotEffects;
    if (!plotEffects) return -1;

    const effectType = name.toUpperCase().startsWith("PLOTEFFECT_")
      ? name.toUpperCase()
      : `PLOTEFFECT_${name.toUpperCase()}`;

    const effect = plotEffects.find((entry) => entry.PlotEffectType === effectType) as {
      Index?: number;
      $index?: number;
    } | null;

    if (typeof effect?.Index === "number") return effect.Index;
    if (typeof effect?.$index === "number") return effect.$index;
    return -1;
  }

  addPlotEffect(x: number, y: number, plotEffectType: number): void {
    if (typeof MapPlotEffects === "undefined") {
      throw new Error("[Adapter] MapPlotEffects global is unavailable.");
    }
    const index = GameplayMap.getIndexFromXY(x, y);
    MapPlotEffects.addPlotEffect(index, plotEffectType);
  }

  hasPlotEffect(x: number, y: number, plotEffectType: number): boolean {
    if (typeof MapPlotEffects === "undefined") {
      throw new Error("[Adapter] MapPlotEffects global is unavailable.");
    }
    const index = GameplayMap.getIndexFromXY(x, y);
    return MapPlotEffects.hasPlotEffect(index, plotEffectType);
  }

  // === RANDOM NUMBER GENERATION ===

  getRandomNumber(max: number, label: string): number {
    return TerrainBuilder.getRandomNumber(max, label);
  }

  // === UTILITIES ===

  getVoronoiUtils(): VoronoiUtils {
    return CivVoronoiUtils as unknown as VoronoiUtils;
  }

  validateAndFixTerrain(): void {
    TerrainBuilder.validateAndFixTerrain();
  }

  recalculateAreas(): void {
    AreaBuilder.recalculateAreas();
  }

  createFractal(
    fractalId: number,
    width: number,
    height: number,
    grain: number,
    flags: number
  ): void {
    FractalBuilder.create(fractalId, width, height, grain, flags);
  }

  getFractalHeight(fractalId: number, x: number, y: number): number {
    return FractalBuilder.getHeight(fractalId, x, y);
  }

  stampContinents(): void {
    TerrainBuilder.stampContinents();
  }

  buildElevation(): void {
    TerrainBuilder.buildElevation();
  }

  modelRivers(minLength: number, maxLength: number, navigableTerrain: number): void {
    TerrainBuilder.modelRivers(minLength, maxLength, navigableTerrain);
  }

  defineNamedRivers(): void {
    TerrainBuilder.defineNamedRivers();
  }

  storeWaterData(): void {
    TerrainBuilder.storeWaterData();
  }

  readRiverProjection(
    width: number,
    height: number,
    plannedNavigableRiverMask: Uint8Array
  ): RiverProjectionResult {
    const size = Math.max(0, (width | 0) * (height | 0));
    if (plannedNavigableRiverMask.length !== size) {
      throw new Error(
        `[Civ7Adapter] Invalid river mask length for readRiverProjection (expected ${size}, got ${plannedNavigableRiverMask.length}).`
      );
    }

    const navigableRiverTerrain = this.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER");
    const riverTypes = (globalThis as typeof globalThis & {
      RiverTypes?: Record<string, number>;
    }).RiverTypes;
    const noRiverType =
      typeof riverTypes?.NO_RIVER === "number" ? riverTypes.NO_RIVER : NO_RIVER_TYPE;
    const minorRiverType = riverTypes?.RIVER_MINOR;
    const navigableRiverType = riverTypes?.RIVER_NAVIGABLE;
    const stampedNavigableRiverMask = new Uint8Array(size);
    const rejectedNavigableRiverMask = new Uint8Array(size);
    const engineTerrain = new Int32Array(size);
    const engineRiverType = new Int32Array(size);
    const engineIsRiverMask = new Uint8Array(size);
    const engineNavigableRiverMask = new Uint8Array(size);
    const engineMinorRiverMask = new Uint8Array(size);
    const terrainNavigableRiverMask = new Uint8Array(size);
    const navigableRiverMismatchMask = new Uint8Array(size);
    let plannedNavigableRiverTileCount = 0;
    let stampedNavigableRiverTileCount = 0;
    let rejectedNavigableRiverTileCount = 0;
    let extraNavigableRiverTileCount = 0;
    let navigableRiverMismatchTileCount = 0;
    let engineRiverTileCount = 0;
    let engineNavigableRiverTileCount = 0;
    let engineMinorRiverTileCount = 0;
    let terrainNavigableRiverTileCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const planned = plannedNavigableRiverMask[idx] === 1;
        const terrain = this.getTerrainType(x, y) | 0;
        const riverType = this.getRiverType(x, y) | 0;
        const isRiver = this.isRiver(x, y);
        const isNavigable =
          this.isNavigableRiver(x, y) ||
          (typeof navigableRiverType === "number" && riverType === navigableRiverType);
        const hasNavigableTerrain = terrain === navigableRiverTerrain;
        const isMinor =
          typeof minorRiverType === "number"
            ? isRiver && riverType === minorRiverType
            : isRiver && !isNavigable;
        const hasRiverMetadata = riverType !== noRiverType;

        engineTerrain[idx] = terrain;
        engineRiverType[idx] = riverType;
        engineIsRiverMask[idx] = isRiver || hasRiverMetadata ? 1 : 0;
        engineNavigableRiverMask[idx] = isNavigable ? 1 : 0;
        engineMinorRiverMask[idx] = isMinor ? 1 : 0;
        terrainNavigableRiverMask[idx] = hasNavigableTerrain ? 1 : 0;

        if (planned) plannedNavigableRiverTileCount += 1;
        if (isRiver || hasRiverMetadata) engineRiverTileCount += 1;
        if (isNavigable) engineNavigableRiverTileCount += 1;
        if (isMinor) engineMinorRiverTileCount += 1;
        if (hasNavigableTerrain) terrainNavigableRiverTileCount += 1;

        if (planned && hasNavigableTerrain) {
          stampedNavigableRiverMask[idx] = 1;
          stampedNavigableRiverTileCount += 1;
        } else if (planned) {
          rejectedNavigableRiverMask[idx] = 1;
          rejectedNavigableRiverTileCount += 1;
        } else if (hasNavigableTerrain) {
          extraNavigableRiverTileCount += 1;
        }

        if ((planned ? 1 : 0) !== (hasNavigableTerrain ? 1 : 0)) {
          navigableRiverMismatchMask[idx] = 1;
          navigableRiverMismatchTileCount += 1;
        }
      }
    }

    return {
      width,
      height,
      plannedNavigableRiverMask,
      stampedNavigableRiverMask,
      rejectedNavigableRiverMask,
      engineTerrain,
      engineRiverType,
      engineIsRiverMask,
      engineNavigableRiverMask,
      engineMinorRiverMask,
      terrainNavigableRiverMask,
      navigableRiverMismatchMask,
      plannedNavigableRiverTileCount,
      stampedNavigableRiverTileCount,
      rejectedNavigableRiverTileCount,
      extraNavigableRiverTileCount,
      navigableRiverMismatchTileCount,
      engineRiverTileCount,
      engineNavigableRiverTileCount,
      engineMinorRiverTileCount,
      terrainNavigableRiverTileCount,
      minorRiverStampingSupported: false,
      minorRiverUnsupportedReason:
        "Current projection path materializes a Civ-visible navigable subset, but exact minor-river metadata parity remains a readback-only boundary rather than a proven MapGen intent-writer surface.",
    };
  }

  generateLakes(width: number, height: number, tilesPerLake: number): void {
    civ7GenerateLakes(width, height, tilesPerLake);
  }

  /**
   * Materialize MapGen's lake intent through Civ7 terrain APIs.
   *
   * The engine boundary refreshes area and water caches immediately after
   * stamping because downstream Civ7 checks often read cached topology rather
   * than raw terrain edits.
   */
  stampLakes(width: number, height: number, lakeMask: Uint8Array): LakeProjectionResult {
    const expectedSize = Math.max(0, (width | 0) * (height | 0));
    if (lakeMask.length !== expectedSize) {
      throw new Error(
        `[Civ7Adapter] Invalid lake mask length for stampLakes (expected ${expectedSize}, got ${lakeMask.length}).`
      );
    }

    const lakeTerrain = this.getTerrainTypeIndex("TERRAIN_COAST");
    if (lakeTerrain < 0) {
      throw new Error("[Civ7Adapter] Cannot stamp lakes: TERRAIN_COAST terrain id is unavailable.");
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (lakeMask[idx] !== 1) continue;
        this.setTerrainType(x, y, lakeTerrain);
      }
    }

    this.recalculateAreas();
    this.storeWaterData();

    return this.readLakeProjection(width, height, lakeMask, lakeTerrain);
  }

  /**
   * Read back what the engine accepted so projection diagnostics remain evidence,
   * not the source of lake truth. Terrain, water, lake classification, area, and
   * elevation are captured together because Civ7 updates those surfaces through
   * separate caches and a visual lake failure can hide behind a simple water mask.
   */
  private readLakeProjection(
    width: number,
    height: number,
    plannedLakeMask: Uint8Array,
    lakeTerrain: number
  ): LakeProjectionResult {
    const size = Math.max(0, (width | 0) * (height | 0));
    const stampedLakeMask = new Uint8Array(size);
    const rejectedLakeMask = new Uint8Array(size);
    const engineTerrain = new Int32Array(size);
    const engineWaterMask = new Uint8Array(size);
    const engineLakeMask = new Uint8Array(size);
    const engineAreaId = new Int32Array(size);
    const engineElevation = new Int16Array(size);
    const terrainMismatchMask = new Uint8Array(size);
    const nonWaterMask = new Uint8Array(size);
    const nonLakeMask = new Uint8Array(size);
    let plannedLakeTileCount = 0;
    let stampedLakeTileCount = 0;
    let rejectedLakeTileCount = 0;
    let terrainMismatchTileCount = 0;
    let nonWaterTileCount = 0;
    let nonLakeTileCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const terrain = this.getTerrainType(x, y) | 0;
        const isWater = this.isWater(x, y);
        const isLake = this.isLake(x, y);
        engineTerrain[idx] = terrain;
        engineWaterMask[idx] = isWater ? 1 : 0;
        engineLakeMask[idx] = isLake ? 1 : 0;
        engineAreaId[idx] = this.getAreaId(x, y) | 0;
        engineElevation[idx] = Math.max(-32768, Math.min(32767, this.getElevation(x, y) | 0));
        if (plannedLakeMask[idx] !== 1) continue;
        plannedLakeTileCount += 1;
        if (terrain !== lakeTerrain) {
          terrainMismatchMask[idx] = 1;
          terrainMismatchTileCount += 1;
        }
        if (!isWater) {
          nonWaterMask[idx] = 1;
          nonWaterTileCount += 1;
        }
        if (!isLake) {
          nonLakeMask[idx] = 1;
          nonLakeTileCount += 1;
        }
        if (isWater) {
          stampedLakeMask[idx] = 1;
          stampedLakeTileCount += 1;
        } else {
          rejectedLakeMask[idx] = 1;
          rejectedLakeTileCount += 1;
        }
      }
    }

    return {
      width,
      height,
      plannedLakeMask,
      stampedLakeMask,
      rejectedLakeMask,
      engineTerrain,
      engineWaterMask,
      engineLakeMask,
      engineAreaId,
      engineElevation,
      terrainMismatchMask,
      nonWaterMask,
      nonLakeMask,
      plannedLakeTileCount,
      stampedLakeTileCount,
      rejectedLakeTileCount,
      terrainMismatchTileCount,
      nonWaterTileCount,
      nonLakeTileCount,
    };
  }

  expandCoasts(width: number, height: number): void {
    civ7ExpandCoasts(width, height);
  }

  // === BIOMES ===

  designateBiomes(width: number, height: number): void {
    civ7DesignateBiomes(width, height);
    this.recordEffect(ENGINE_EFFECT_TAGS.biomesApplied);
  }

  getBiomeGlobal(name: string): number {
    const biomes = GameInfo?.Biomes;
    if (!biomes) return -1;

    const biomeType = name.toUpperCase().startsWith("BIOME_")
      ? name.toUpperCase()
      : `BIOME_${name.toUpperCase()}`;

    const biome = biomes.find((b) => b.BiomeType === biomeType) as
      | { Index?: number; $index?: number }
      | undefined;

    if (typeof biome?.Index === "number") return biome.Index;
    if (typeof biome?.$index === "number") return biome.$index;
    return -1;
  }

  setBiomeType(x: number, y: number, biomeId: number): void {
    TerrainBuilder.setBiomeType(x, y, biomeId);
    this.recordEffect(ENGINE_EFFECT_TAGS.biomesApplied);
  }

  getBiomeType(x: number, y: number): number {
    return GameplayMap.getBiomeType(x, y);
  }

  // === FEATURES (extended) ===

  addFeatures(width: number, height: number): void {
    civ7AddFeatures(width, height);
    this.recordEffect(ENGINE_EFFECT_TAGS.featuresApplied);
  }

  getFeatureTypeIndex(name: string): number {
    // GameInfo.Features is an iterable table of feature definitions
    // Each has a FeatureType string and an Index number
    const features = GameInfo?.Features;
    if (!features) return -1;

    // Use the find method from GameInfoTable interface
    const feature = features.find((f) => f.FeatureType === name) as {
      Index?: number;
      $index?: number;
    } | null;

    if (typeof feature?.Index === "number") return feature.Index;
    if (typeof feature?.$index === "number") return feature.$index;
    return -1;
  }

  get NO_FEATURE(): number {
    // Use the engine's actual sentinel value for parity
    // Falls back to -1 if FeatureTypes isn't available (e.g., in tests)
    return typeof FeatureTypes !== "undefined" && "NO_FEATURE" in FeatureTypes
      ? FeatureTypes.NO_FEATURE
      : -1;
  }

  // === PLACEMENT ===

  stampNaturalWonder(
    x: number,
    y: number,
    featureType: number,
    direction: number,
    elevation?: number
  ): boolean {
    return this.placeNaturalWonder(x, y, featureType, direction, elevation).status === "placed";
  }

  placeNaturalWonder(
    x: number,
    y: number,
    featureType: number,
    direction: number,
    elevation?: number
  ): NaturalWonderPlacementOutcome {
    const plotIndex = y * this.width + x;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        reason: "out-of-bounds",
      };
    }
    const resolvedElevation = Number.isFinite(elevation)
      ? (elevation as number)
      : GameplayMap.getElevation(x, y);
    const featureParam: FeatureData = {
      Feature: featureType,
      Direction: direction,
      Elevation: resolvedElevation,
    };
    const footprint = getNaturalWonderFootprintIndices({
      x,
      y,
      width: this.width,
      height: this.height,
      policy: FEATURE_POLICIES[String(featureType | 0)] ?? {},
      direction,
    });
    if (!footprint) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        elevation: resolvedElevation,
        reason: "unsupported-footprint",
      };
    }
    if (!this.canHaveFeatureParam(x, y, featureParam)) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        elevation: resolvedElevation,
        reason: "can-have-feature-param-false",
      };
    }
    const setResult = TerrainBuilder.setFeatureType(x, y, featureParam) as unknown;
    if (setResult === false) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        featureType,
        direction,
        elevation: resolvedElevation,
        reason: "set-feature-false",
      };
    }
    const expectedFootprintReadback = footprint.map((plotIndex) => {
      const fy = Math.trunc(plotIndex / this.width);
      const fx = plotIndex - fy * this.width;
      return {
        plotIndex,
        observedFeatureType: GameplayMap.getFeatureType(fx, fy) | 0,
      };
    });
    for (const readback of expectedFootprintReadback) {
      if (readback.observedFeatureType !== (featureType | 0)) {
        const matchingFootprintCells = expectedFootprintReadback.filter(
          (cell) => cell.observedFeatureType === (featureType | 0)
        ).length;
        return {
          status: "rejected",
          plotIndex: y * this.width + x,
          x,
          y,
          featureType,
          direction,
          elevation: resolvedElevation,
          reason: "readback-mismatch",
          observedFeatureType: readback.observedFeatureType,
          observedPlotIndex: readback.plotIndex,
          expectedFootprintReadback,
          expectedFootprintReadbackStatus:
            matchingFootprintCells === 0
              ? "empty-expected-footprint"
              : "partial-expected-footprint",
        };
      }
    }
    this.recordPlacementEffect();
    return {
      status: "placed",
      plotIndex,
      x,
      y,
      featureType,
      direction,
      elevation: resolvedElevation,
    };
  }

  stampDiscovery(
    x: number,
    y: number,
    discoveryVisualType: number,
    discoveryActivationType: number
  ): boolean {
    const mapConstructibles = (
      globalThis as typeof globalThis & {
        MapConstructibles?: {
          addDiscovery?: (
            x: number,
            y: number,
            discoveryVisualType: number,
            discoveryActivationType: number
          ) => boolean;
        };
      }
    ).MapConstructibles;
    if (!mapConstructibles?.addDiscovery) {
      throw new Error("[Adapter] MapConstructibles.addDiscovery is unavailable.");
    }
    const placed = mapConstructibles.addDiscovery(
      x,
      y,
      discoveryVisualType,
      discoveryActivationType
    );
    if (placed) this.recordPlacementEffect();
    return Boolean(placed);
  }

  placeDiscoveryIntent(
    width: number,
    height: number,
    intent: DiscoveryPlacementIntent
  ): DiscoveryPlacementOutcome {
    // Discovery placement has no stable post-write readback, so the adapter
    // exposes Civ7 acceptance/rejection as explicit reconciliation evidence
    // instead of making the recipe infer success from generator counts.
    const resolvedWidth = Math.max(0, Math.trunc(width));
    const resolvedHeight = Math.max(0, Math.trunc(height));
    const plotIndex = Number.isFinite(intent.plotIndex) ? Math.trunc(intent.plotIndex) : -1;
    const discoveryVisualType = Number.isFinite(intent.discoveryVisualType)
      ? Math.trunc(intent.discoveryVisualType)
      : -1;
    const discoveryActivationType = Number.isFinite(intent.discoveryActivationType)
      ? Math.trunc(intent.discoveryActivationType)
      : -1;
    const y = resolvedWidth > 0 ? Math.trunc(plotIndex / resolvedWidth) : -1;
    const x = resolvedWidth > 0 ? plotIndex - y * resolvedWidth : -1;

    if (plotIndex < 0 || x < 0 || y < 0 || x >= resolvedWidth || y >= resolvedHeight) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        discoveryVisualType,
        discoveryActivationType,
        reason: "out-of-bounds",
      };
    }
    if (discoveryVisualType < 0 || discoveryActivationType < 0) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        discoveryVisualType,
        discoveryActivationType,
        reason: "invalid-discovery-type",
      };
    }

    const placed = this.stampDiscovery(x, y, discoveryVisualType, discoveryActivationType);
    if (!placed) {
      return {
        status: "rejected",
        plotIndex,
        x,
        y,
        discoveryVisualType,
        discoveryActivationType,
        reason: "adapter-rejected",
      };
    }
    return { status: "placed", plotIndex, x, y, discoveryVisualType, discoveryActivationType };
  }

  generateOfficialResources(
    width: number,
    height: number,
    minMarineResourceTypesOverride?: number
  ): number {
    const resolvedWidth = Math.max(0, Math.trunc(width));
    const resolvedHeight = Math.max(0, Math.trunc(height));
    const resolvedMinMarineResourceTypesOverride = Number.isFinite(minMarineResourceTypesOverride)
      ? Math.max(0, Math.trunc(minMarineResourceTypesOverride as number))
      : undefined;

    const resourceBuilder = (
      globalThis as typeof globalThis & {
        ResourceBuilder?: {
          setResourceType?: (x: number, y: number, resourceType: number) => void;
        };
      }
    ).ResourceBuilder;
    if (!resourceBuilder?.setResourceType) {
      throw new Error(
        "[Adapter] ResourceBuilder.setResourceType is unavailable for official resource generation."
      );
    }

    const officialResourceGenerator = (
      civ7ResourceGeneratorModule as unknown as {
        generateResources?: (
          width: number,
          height: number,
          minMarineResourceTypesOverride?: number
        ) => void;
      }
    ).generateResources;
    if (typeof officialResourceGenerator !== "function") {
      throw new Error("[Adapter] resource-generator.generateResources is unavailable.");
    }

    const noResource = this.NO_RESOURCE | 0;
    const resourcesBefore = this.countPlacedResources();
    let observedPlacedCount = 0;

    const originalSetResourceType = resourceBuilder.setResourceType.bind(resourceBuilder);
    resourceBuilder.setResourceType = (x: number, y: number, resourceType: number): void => {
      const previous = this.getResourceType(x, y) | 0;
      originalSetResourceType(x, y, resourceType);
      const next = this.getResourceType(x, y) | 0;
      if (previous === noResource && next !== noResource) observedPlacedCount += 1;
    };

    try {
      if (resolvedMinMarineResourceTypesOverride === undefined) {
        officialResourceGenerator(resolvedWidth, resolvedHeight);
      } else {
        officialResourceGenerator(
          resolvedWidth,
          resolvedHeight,
          resolvedMinMarineResourceTypesOverride
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `[Adapter] Official resource generation failed (width=${resolvedWidth}, height=${resolvedHeight}, minMarineResourceTypesOverride=${String(resolvedMinMarineResourceTypesOverride)}): ${message}`
      );
    } finally {
      resourceBuilder.setResourceType = originalSetResourceType;
    }

    const resourcesAfter = this.countPlacedResources();
    const countedPlaced = Math.max(0, resourcesAfter - resourcesBefore);
    const placedCount = Math.max(0, observedPlacedCount, countedPlaced);

    this.recordPlacementEffect();
    return placedCount;
  }

  generateOfficialDiscoveries(
    width: number,
    height: number,
    startPositions: ReadonlyArray<number>,
    polarMargin: number
  ): number {
    const resolvedWidth = Math.max(0, Math.trunc(width));
    const resolvedHeight = Math.max(0, Math.trunc(height));
    const resolvedStartPositions = (Array.isArray(startPositions) ? startPositions : [])
      .filter((value) => Number.isFinite(value) && value >= 0)
      .map((value) => Math.trunc(value));
    const resolvedPolarMargin = Number.isFinite(polarMargin)
      ? Math.max(0, Math.trunc(polarMargin))
      : 0;

    const mapConstructibles = (
      globalThis as typeof globalThis & {
        MapConstructibles?: {
          addDiscovery?: (
            x: number,
            y: number,
            discoveryVisualType: number,
            discoveryActivationType: number
          ) => boolean;
        };
      }
    ).MapConstructibles;
    if (!mapConstructibles?.addDiscovery) {
      throw new Error(
        "[Adapter] MapConstructibles.addDiscovery is unavailable for official discovery generation."
      );
    }

    let placedCount = 0;
    const originalAddDiscovery = mapConstructibles.addDiscovery;
    mapConstructibles.addDiscovery = (
      x: number,
      y: number,
      discoveryVisualType: number,
      discoveryActivationType: number
    ): boolean => {
      const placed = Boolean(
        originalAddDiscovery.call(
          mapConstructibles,
          x,
          y,
          discoveryVisualType,
          discoveryActivationType
        )
      );
      if (placed) placedCount += 1;
      return placed;
    };

    try {
      civ7GenerateDiscoveries(
        resolvedWidth,
        resolvedHeight,
        resolvedStartPositions,
        resolvedPolarMargin
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `[Adapter] Official discovery generation failed (width=${resolvedWidth}, height=${resolvedHeight}, startPositions=${resolvedStartPositions.length}, polarMargin=${resolvedPolarMargin}): ${message}`
      );
    } finally {
      mapConstructibles.addDiscovery = originalAddDiscovery;
    }

    this.recordPlacementEffect();
    return placedCount;
  }

  getNaturalWonderCatalog(): NaturalWonderCatalogEntry[] {
    return NATURAL_WONDER_CATALOG;
  }

  getDiscoveryCatalog(): DiscoveryCatalogEntry[] {
    return DISCOVERY_CATALOG;
  }

  generateSnow(width: number, height: number): void {
    civ7GenerateSnow(width, height);
    this.recordPlacementEffect();
  }

  assignStartPositions(
    playersLandmass1: number,
    playersLandmass2: number,
    westContinent: { west: number; east: number; south: number; north: number },
    eastContinent: { west: number; east: number; south: number; north: number },
    startSectorRows: number,
    startSectorCols: number,
    startSectors: number[]
  ): number[] {
    this.recordPlacementEffect();
    const result = civ7AssignStartPositions(
      playersLandmass1,
      playersLandmass2,
      westContinent,
      eastContinent,
      startSectorRows,
      startSectorCols,
      startSectors
    );
    return Array.isArray(result) ? result : [];
  }

  setStartPosition(plotIndex: number, playerId: number): void {
    const startPositioner = (
      globalThis as typeof globalThis & {
        StartPositioner?: { setStartPosition?: (plot: number, player: number) => void };
      }
    ).StartPositioner;
    if (startPositioner?.setStartPosition) {
      startPositioner.setStartPosition(plotIndex, playerId);
      this.recordPlacementEffect();
    }
  }

  getAliveMajorIds(): number[] {
    const players = (
      globalThis as typeof globalThis & {
        Players?: { getAliveMajorIds?: () => unknown };
      }
    ).Players;
    const result = players?.getAliveMajorIds?.();
    if (!Array.isArray(result)) return [];
    return result
      .filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id >= 0)
      .map((id) => id | 0);
  }

  chooseStartSectors(
    players1: number,
    players2: number,
    rows: number,
    cols: number,
    humanNearEquator: boolean
  ): unknown[] {
    const result = civ7ChooseStartSectors(players1, players2, rows, cols, humanNearEquator);
    return Array.isArray(result) ? result : [];
  }

  needHumanNearEquator(): boolean {
    return civ7NeedHumanNearEquator();
  }

  assignAdvancedStartRegions(): void {
    civ7AssignAdvancedStartRegions();
    this.recordPlacementEffect();
  }

  addFloodplains(minLength: number, maxLength: number): void {
    // TerrainBuilder.addFloodplains may not exist in all engine versions
    const tb = TerrainBuilder as unknown as { addFloodplains?: (min: number, max: number) => void };
    if (typeof tb.addFloodplains === "function") {
      tb.addFloodplains(minLength, maxLength);
    }
    this.recordPlacementEffect();
  }

  recalculateFertility(): void {
    // FertilityBuilder may not exist in all engine versions
    const fb = (globalThis as unknown as { FertilityBuilder?: { recalculate?: () => void } })
      .FertilityBuilder;
    if (fb && typeof fb.recalculate === "function") {
      fb.recalculate();
    } else {
      console.log(
        "[Civ7Adapter] FertilityBuilder not available - fertility will be calculated by engine defaults"
      );
    }
    this.recordPlacementEffect();
  }
}

/**
 * Create a Civ7 adapter from current map dimensions
 */
export function createCiv7Adapter(): Civ7Adapter {
  const width = GameplayMap.getGridWidth();
  const height = GameplayMap.getGridHeight();
  return new Civ7Adapter(width, height);
}
