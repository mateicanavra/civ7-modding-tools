import type { EngineAdapterMethodKey } from "./types.js";

/**
 * Engine methods that authored MapGen steps may request as occurrence-scoped capabilities.
 *
 * This adapter-owned registry is both the runtime admission authority and the source of the
 * authored key type. Adding an adapter method does not expose it to recipe code accidentally:
 * the method must be admitted here deliberately.
 */
export const AUTHORED_ENGINE_ADAPTER_METHODS = Object.freeze([
  "readCurrentMapSurface",
  "getMapSizeId",
  "lookupMapInfo",
  "setMapInitData",
  "isWater",
  "isLake",
  "getAreaId",
  "isMountain",
  "isAdjacentToRivers",
  "getRiverType",
  "isRiver",
  "isNavigableRiver",
  "getElevation",
  "getTerrainType",
  "getTerrainTypeIndex",
  "getRainfall",
  "getTemperature",
  "getLatitude",
  "setTerrainType",
  "setRainfall",
  "setLandmassRegionId",
  "setLandmassId",
  "addPlotTag",
  "setPlotTag",
  "getPlotTagId",
  "getLandmassId",
  "getFeatureType",
  "setFeatureType",
  "canHaveFeature",
  "canHaveFeatureParam",
  "getResourceType",
  "setResourceType",
  "canHaveResource",
  "isResourceRequiredForAge",
  "getResourceCatalog",
  "placeResourceIntent",
  "getPlotEffectTypesContainingTags",
  "getPlotEffectTypeIndex",
  "addPlotEffect",
  "hasPlotEffect",
  "getVoronoiUtils",
  "validateAndFixTerrain",
  "recalculateAreas",
  "createFractal",
  "getFractalHeight",
  "stampContinents",
  "buildElevation",
  "modelRivers",
  "defineNamedRivers",
  "storeWaterData",
  "readRiverProjection",
  "generateLakes",
  "stampLakes",
  "expandCoasts",
  "designateBiomes",
  "getBiomeGlobal",
  "setBiomeType",
  "getBiomeType",
  "addFeatures",
  "getFeatureTypeIndex",
  "stampNaturalWonder",
  "placeNaturalWonder",
  "stampDiscovery",
  "placeDiscoveryIntent",
  "generateOfficialResources",
  "generateOfficialDiscoveries",
  "getNaturalWonderCatalog",
  "generateSnow",
  "assignStartPositions",
  "setStartPosition",
  "getAliveMajorIds",
  "assignAdvancedStartRegions",
  "addFloodplains",
  "recalculateFertility",
  "chooseStartSectors",
  "needHumanNearEquator",
] as const satisfies readonly EngineAdapterMethodKey[]);

/** One adapter method explicitly admitted for authored MapGen step use. */
export type AuthoredEngineAdapterKey = (typeof AUTHORED_ENGINE_ADAPTER_METHODS)[number];

const authoredEngineAdapterMethodSet: ReadonlySet<string> = new Set(
  AUTHORED_ENGINE_ADAPTER_METHODS
);

/**
 * Reports whether an untrusted step declaration names an adapter method explicitly admitted for
 * authored use. Concrete adapter helpers and executor-private methods are rejected by omission.
 */
export function isAuthoredEngineAdapterKey(value: unknown): value is AuthoredEngineAdapterKey {
  return typeof value === "string" && authoredEngineAdapterMethodSet.has(value);
}
