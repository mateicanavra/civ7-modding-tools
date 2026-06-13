import type { MapInfo } from "./types.js";

export type Civ7StandardMapSizeId =
  | "MAPSIZE_TINY"
  | "MAPSIZE_SMALL"
  | "MAPSIZE_STANDARD"
  | "MAPSIZE_LARGE"
  | "MAPSIZE_HUGE";

export type Civ7LatitudeBounds = Readonly<{
  topLatitude: number;
  bottomLatitude: number;
}>;

export type Civ7StandardMapSizePreset = Readonly<{
  id: Civ7StandardMapSizeId;
  label: "Tiny" | "Small" | "Standard" | "Large" | "Huge";
  dimensions: Readonly<{ width: number; height: number }>;
  defaultPlayers: number;
  latitudeBounds: Civ7LatitudeBounds;
  mapInfo: MapInfo;
}>;

export const CIV7_STANDARD_ROW_LATITUDE_BOUNDS: Civ7LatitudeBounds = {
  topLatitude: -90,
  bottomLatitude: 90,
} as const;

const STANDARD_84X54_ROW_LATITUDES = Object.freeze([
  -90, -89, -85, -81, -78, -74, -71, -69, -65, -62, -58, -54, -51, -47, -45, -42, -38, -35, -31,
  -27, -24, -22, -18, -15, -11, -8, -4, 0, 1, 5, 9, 12, 16, 19, 21, 25, 28, 32, 36, 39, 43, 45, 48,
  52, 55, 59, 63, 66, 68, 72, 75, 79, 82, 86,
] as const);

const HUGE_106X66_ROW_LATITUDES = Object.freeze([
  -90, -89, -85, -83, -80, -78, -74, -72, -69, -67, -63, -62, -58, -56, -53, -51, -47, -45, -42,
  -40, -36, -35, -31, -29, -26, -24, -20, -18, -15, -13, -9, -8, -4, 0, 1, 5, 7, 10, 12, 16, 18, 21,
  23, 27, 28, 32, 34, 37, 39, 43, 45, 48, 50, 54, 55, 59, 61, 64, 66, 70, 72, 75, 77, 81, 82, 86,
] as const);

export const CIV7_STANDARD_MAP_SIZE_PRESETS: readonly Civ7StandardMapSizePreset[] = [
  {
    id: "MAPSIZE_TINY",
    label: "Tiny",
    dimensions: { width: 60, height: 38 },
    defaultPlayers: 4,
    latitudeBounds: CIV7_STANDARD_ROW_LATITUDE_BOUNDS,
    mapInfo: {
      GridWidth: 60,
      GridHeight: 38,
      MinLatitude: -90,
      MaxLatitude: 90,
      NumNaturalWonders: 3,
      LakeGenerationFrequency: 25,
      PlayersLandmass1: 3,
      PlayersLandmass2: 1,
      StartSectorRows: 3,
      StartSectorCols: 2,
    },
  },
  {
    id: "MAPSIZE_SMALL",
    label: "Small",
    dimensions: { width: 74, height: 46 },
    defaultPlayers: 6,
    latitudeBounds: CIV7_STANDARD_ROW_LATITUDE_BOUNDS,
    mapInfo: {
      GridWidth: 74,
      GridHeight: 46,
      MinLatitude: -90,
      MaxLatitude: 90,
      NumNaturalWonders: 4,
      LakeGenerationFrequency: 25,
      PlayersLandmass1: 4,
      PlayersLandmass2: 2,
      StartSectorRows: 3,
      StartSectorCols: 3,
    },
  },
  {
    id: "MAPSIZE_STANDARD",
    label: "Standard",
    dimensions: { width: 84, height: 54 },
    defaultPlayers: 8,
    latitudeBounds: CIV7_STANDARD_ROW_LATITUDE_BOUNDS,
    mapInfo: {
      GridWidth: 84,
      GridHeight: 54,
      MinLatitude: -90,
      MaxLatitude: 90,
      NumNaturalWonders: 5,
      LakeGenerationFrequency: 25,
      PlayersLandmass1: 5,
      PlayersLandmass2: 3,
      StartSectorRows: 4,
      StartSectorCols: 3,
    },
  },
  {
    id: "MAPSIZE_LARGE",
    label: "Large",
    dimensions: { width: 96, height: 60 },
    defaultPlayers: 10,
    latitudeBounds: CIV7_STANDARD_ROW_LATITUDE_BOUNDS,
    mapInfo: {
      GridWidth: 96,
      GridHeight: 60,
      MinLatitude: -90,
      MaxLatitude: 90,
      NumNaturalWonders: 6,
      LakeGenerationFrequency: 25,
      PlayersLandmass1: 6,
      PlayersLandmass2: 4,
      StartSectorRows: 4,
      StartSectorCols: 3,
    },
  },
  {
    id: "MAPSIZE_HUGE",
    label: "Huge",
    dimensions: { width: 106, height: 66 },
    defaultPlayers: 10,
    latitudeBounds: CIV7_STANDARD_ROW_LATITUDE_BOUNDS,
    mapInfo: {
      GridWidth: 106,
      GridHeight: 66,
      MinLatitude: -90,
      MaxLatitude: 90,
      NumNaturalWonders: 7,
      LakeGenerationFrequency: 25,
      PlayersLandmass1: 6,
      PlayersLandmass2: 6,
      StartSectorRows: 4,
      StartSectorCols: 3,
    },
  },
] as const;

export function getCiv7StandardMapSizePreset(
  id: Civ7StandardMapSizeId | string | number
): Civ7StandardMapSizePreset | null {
  if (typeof id !== "string") return null;
  return CIV7_STANDARD_MAP_SIZE_PRESETS.find((preset) => preset.id === id) ?? null;
}

export function getCiv7StandardMapSizePresetForDimensions(
  width: number,
  height: number
): Civ7StandardMapSizePreset | null {
  return (
    CIV7_STANDARD_MAP_SIZE_PRESETS.find(
      (preset) => preset.dimensions.width === width && preset.dimensions.height === height
    ) ?? null
  );
}

export function getCiv7MapInfoLatitudeBounds(
  mapInfo: MapInfo | null | undefined
): Civ7LatitudeBounds {
  const min = typeof mapInfo?.MinLatitude === "number" ? mapInfo.MinLatitude : undefined;
  const max = typeof mapInfo?.MaxLatitude === "number" ? mapInfo.MaxLatitude : undefined;
  if (Number.isFinite(min) && Number.isFinite(max) && min !== max) {
    return { topLatitude: min as number, bottomLatitude: max as number };
  }
  return CIV7_STANDARD_ROW_LATITUDE_BOUNDS;
}

export function interpolateCiv7RowLatitude(
  bounds: Civ7LatitudeBounds,
  height: number,
  y: number
): number {
  if (height <= 1) return (bounds.topLatitude + bounds.bottomLatitude) / 2;
  const row = Math.max(0, Math.min(height - 1, Math.trunc(y)));
  const t = row / (height - 1);
  return bounds.topLatitude + (bounds.bottomLatitude - bounds.topLatitude) * t;
}

export function getCiv7RowLatitude(
  mapInfo: MapInfo | null | undefined,
  height: number,
  y: number
): number {
  const bounds = getCiv7MapInfoLatitudeBounds(mapInfo);
  const row = Math.max(0, Math.min(height - 1, Math.trunc(y)));
  if (
    height === STANDARD_84X54_ROW_LATITUDES.length &&
    bounds.topLatitude === CIV7_STANDARD_ROW_LATITUDE_BOUNDS.topLatitude &&
    bounds.bottomLatitude === CIV7_STANDARD_ROW_LATITUDE_BOUNDS.bottomLatitude
  ) {
    return STANDARD_84X54_ROW_LATITUDES[row] ?? 0;
  }
  if (
    height === HUGE_106X66_ROW_LATITUDES.length &&
    bounds.topLatitude === CIV7_STANDARD_ROW_LATITUDE_BOUNDS.topLatitude &&
    bounds.bottomLatitude === CIV7_STANDARD_ROW_LATITUDE_BOUNDS.bottomLatitude
  ) {
    return HUGE_106X66_ROW_LATITUDES[row] ?? 0;
  }
  return interpolateCiv7RowLatitude(bounds, height, y);
}
