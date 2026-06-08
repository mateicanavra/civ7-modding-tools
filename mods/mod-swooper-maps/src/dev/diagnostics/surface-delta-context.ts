import {
  CIV7_BROWSER_TABLES_V0,
  isResourceAdjacentToLandRuntimeOptional,
} from "@civ7/map-policy";

import type { FinalSurfaceKey, FinalSurfaceParityProof, FinalSurfaceSnapshot } from "./live-parity.js";

export type ClassifiableSurfaceKey = Extract<FinalSurfaceKey, "feature" | "resource">;

export type StaticSurfaceLegality = Readonly<{
  kind: ClassifiableSurfaceKey;
  type: number;
  symbol: string;
  terrain: number | null;
  terrainSymbol: string;
  biome: number | null;
  biomeSymbol: string;
  feature: number | null;
  featureSymbol: string;
  validSurface: boolean;
  reasons: ReadonlyArray<string>;
}>;

export type SurfaceDeltaContext = Readonly<{
  key: ClassifiableSurfaceKey;
  x: number;
  y: number;
  local: Readonly<{
    value: number | null;
    symbol: string;
    context: CellSurfaceContext;
  }>;
  live: Readonly<{
    value: number | null;
    symbol: string;
    context: CellSurfaceContext;
  }>;
  legality: Readonly<{
    localValueOnLocal?: StaticSurfaceLegality;
    localValueOnLive?: StaticSurfaceLegality;
    liveValueOnLocal?: StaticSurfaceLegality;
    liveValueOnLive?: StaticSurfaceLegality;
  }>;
}>;

export type CellSurfaceContext = Readonly<{
  terrain: number | null;
  terrainSymbol: string;
  biome: number | null;
  biomeSymbol: string;
  feature: number | null;
  featureSymbol: string;
  resource: number | null;
  resourceSymbol: string;
}>;

type SurfaceLike = Readonly<{
  values: ReadonlyArray<number | null>;
}>;

type SnapshotLike = Readonly<{
  width: number;
  height: number;
  surfaces: Readonly<Record<FinalSurfaceKey, SurfaceLike>>;
}>;

const TERRAIN_SYMBOL_BY_ID = invertNumberMap(CIV7_BROWSER_TABLES_V0.terrainTypeIndices);
const BIOME_SYMBOL_BY_ID = invertNumberMap(CIV7_BROWSER_TABLES_V0.biomeGlobals);
const FEATURE_SYMBOL_BY_ID = invertNumberMap(CIV7_BROWSER_TABLES_V0.featureTypes);
const RESOURCE_SYMBOL_BY_ID = invertNumberMap(CIV7_BROWSER_TABLES_V0.resourceTypes);

const WATER_TERRAINS = new Set([
  CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST,
  CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN,
]);

const ODD_Q_NEIGHBORS_EVEN = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
] as const;

const ODD_Q_NEIGHBORS_ODD = [
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
] as const;

export function buildSurfaceDeltaContexts(
  proof: Pick<FinalSurfaceParityProof, "local" | "live">,
  options: {
    keys?: ReadonlyArray<ClassifiableSurfaceKey>;
    maxRows?: number;
  } = {}
): ReadonlyArray<SurfaceDeltaContext> {
  const keys = options.keys ?? ["feature", "resource"];
  const maxRows = options.maxRows ?? Number.POSITIVE_INFINITY;
  const rows: SurfaceDeltaContext[] = [];

  for (const key of keys) {
    const localValues = proof.local.surfaces[key].values;
    const liveValues = proof.live.surfaces[key].values;
    const length = Math.min(localValues.length, liveValues.length);
    for (let index = 0; index < length; index += 1) {
      const localValue = normalizeSurfaceValue(localValues[index]);
      const liveValue = normalizeSurfaceValue(liveValues[index]);
      if (localValue === liveValue) continue;
      const y = Math.floor(index / proof.local.width);
      const x = index - y * proof.local.width;
      rows.push(buildSurfaceDeltaContext(proof.local, proof.live, key, x, y));
      if (rows.length >= maxRows) return rows;
    }
  }

  return rows;
}

export function buildSurfaceDeltaContext(
  local: FinalSurfaceSnapshot,
  live: FinalSurfaceSnapshot,
  key: ClassifiableSurfaceKey,
  x: number,
  y: number
): SurfaceDeltaContext {
  const localValue = surfaceValue(local, key, x, y);
  const liveValue = surfaceValue(live, key, x, y);
  const localContext = cellSurfaceContext(local, x, y);
  const liveContext = cellSurfaceContext(live, x, y);
  return {
    key,
    x,
    y,
    local: {
      value: localValue,
      symbol: symbolFor(key, localValue),
      context: localContext,
    },
    live: {
      value: liveValue,
      symbol: symbolFor(key, liveValue),
      context: liveContext,
    },
    legality: {
      ...(localValue === null ? {} : { localValueOnLocal: staticSurfaceLegality(local, key, x, y, localValue) }),
      ...(localValue === null ? {} : { localValueOnLive: staticSurfaceLegality(live, key, x, y, localValue) }),
      ...(liveValue === null ? {} : { liveValueOnLocal: staticSurfaceLegality(local, key, x, y, liveValue) }),
      ...(liveValue === null ? {} : { liveValueOnLive: staticSurfaceLegality(live, key, x, y, liveValue) }),
    },
  };
}

export function staticSurfaceLegality(
  snapshot: FinalSurfaceSnapshot,
  key: ClassifiableSurfaceKey,
  x: number,
  y: number,
  type: number
): StaticSurfaceLegality {
  const context = cellSurfaceContext(snapshot, x, y);
  const reasons: string[] = [];
  if (key === "feature") {
    addFeatureSurfaceReasons(reasons, type, context);
  } else {
    addResourceSurfaceReasons(reasons, snapshot, x, y, type, context);
  }
  return {
    kind: key,
    type,
    symbol: symbolFor(key, type),
    terrain: context.terrain,
    terrainSymbol: context.terrainSymbol,
    biome: context.biome,
    biomeSymbol: context.biomeSymbol,
    feature: context.feature,
    featureSymbol: context.featureSymbol,
    validSurface: reasons.length === 0,
    reasons,
  };
}

export function cellSurfaceContext(snapshot: SnapshotLike, x: number, y: number): CellSurfaceContext {
  const terrain = surfaceValue(snapshot, "terrain", x, y);
  const biome = surfaceValue(snapshot, "biome", x, y);
  const feature = surfaceValue(snapshot, "feature", x, y);
  const resource = surfaceValue(snapshot, "resource", x, y);
  return {
    terrain,
    terrainSymbol: symbolFor("terrain", terrain),
    biome,
    biomeSymbol: symbolFor("biome", biome),
    feature,
    featureSymbol: symbolFor("feature", feature),
    resource,
    resourceSymbol: symbolFor("resource", resource),
  };
}

function addFeatureSurfaceReasons(
  reasons: string[],
  featureType: number,
  context: CellSurfaceContext
): void {
  const terrainRows = CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices[String(featureType)];
  if (terrainRows?.length && !terrainRows.includes(context.terrain ?? -1)) {
    reasons.push("feature.terrain");
  }
  const biomeRows = CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices[String(featureType)];
  if (biomeRows?.length && !biomeRows.includes(context.biome ?? -1)) {
    reasons.push("feature.biome");
  }
}

function addResourceSurfaceReasons(
  reasons: string[],
  snapshot: FinalSurfaceSnapshot,
  x: number,
  y: number,
  resourceType: number,
  context: CellSurfaceContext
): void {
  const rows = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows[String(resourceType)];
  if (!rows?.length) {
    reasons.push("resource.unknown");
    return;
  }
  const surfaceMatches = rows.some(
    (row) =>
      row[0] === context.biome &&
      row[1] === context.terrain &&
      row[2] === (context.feature ?? -1)
  );
  if (!surfaceMatches) reasons.push("resource.surface");
  const flags = CIV7_BROWSER_TABLES_V0.resourcePlacementFlags[String(resourceType)];
  if (
    flags?.adjacentToLand &&
    !isResourceAdjacentToLandRuntimeOptional(resourceType) &&
    !hasAdjacentLand(snapshot, x, y)
  ) {
    reasons.push("resource.adjacent-land");
  }
}

function hasAdjacentLand(snapshot: SnapshotLike, x: number, y: number): boolean {
  const offsets = (x & 1) === 1 ? ODD_Q_NEIGHBORS_ODD : ODD_Q_NEIGHBORS_EVEN;
  for (const [dx, dy] of offsets) {
    const ny = y + dy;
    if (ny < 0 || ny >= snapshot.height) continue;
    const nx = snapshot.width > 0 ? wrapX(x + dx, snapshot.width) : x + dx;
    const terrain = surfaceValue(snapshot, "terrain", nx, ny);
    if (terrain !== null && !WATER_TERRAINS.has(terrain)) return true;
  }
  return false;
}

function surfaceValue(
  snapshot: SnapshotLike,
  key: FinalSurfaceKey,
  x: number,
  y: number
): number | null {
  if (x < 0 || y < 0 || x >= snapshot.width || y >= snapshot.height) return null;
  const value = snapshot.surfaces[key].values[y * snapshot.width + x];
  return normalizeSurfaceValue(value);
}

function normalizeSurfaceValue(value: number | null | undefined): number | null {
  if (value == null || value < 0) return null;
  return value;
}

function symbolFor(key: FinalSurfaceKey, value: number | null): string {
  if (value === null) return "empty";
  const lookup =
    key === "terrain"
      ? TERRAIN_SYMBOL_BY_ID
      : key === "biome"
        ? BIOME_SYMBOL_BY_ID
        : key === "feature"
          ? FEATURE_SYMBOL_BY_ID
          : RESOURCE_SYMBOL_BY_ID;
  return lookup[value] ?? `UNKNOWN_${key.toUpperCase()}_${value}`;
}

function invertNumberMap(value: Readonly<Record<string, number>>): Readonly<Record<number, string>> {
  return Object.fromEntries(Object.entries(value).map(([key, id]) => [id, key]));
}

function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}
