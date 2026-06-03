import type { MapInfo, MapSizeId } from "./types.js";

export type Civ7MapSizeType =
  | "MAPSIZE_TINY"
  | "MAPSIZE_SMALL"
  | "MAPSIZE_STANDARD"
  | "MAPSIZE_LARGE"
  | "MAPSIZE_HUGE";

export type Civ7LatitudeBounds = Readonly<{
  topLatitude: number;
  bottomLatitude: number;
}>;

type Civ7MapInfoRow = Readonly<MapInfo & {
  $index: number;
  $hash: number;
  MapSizeType: Civ7MapSizeType;
  GridWidth: number;
  GridHeight: number;
  DefaultPlayers: number;
}>;

export const DEFAULT_CIV7_MAP_LATITUDE_BOUNDS: Civ7LatitudeBounds = {
  topLatitude: 90,
  bottomLatitude: -90,
};

export const CIV7_MAP_INFO_BY_TYPE: Readonly<Record<Civ7MapSizeType, Civ7MapInfoRow>> = {
  MAPSIZE_TINY: {
    $index: 0,
    $hash: -601637951,
    MapSizeType: "MAPSIZE_TINY",
    GridWidth: 60,
    GridHeight: 38,
    DefaultPlayers: 4,
    PlayersLandmass1: 3,
    PlayersLandmass2: 1,
    StartSectorRows: 3,
    StartSectorCols: 2,
    NumNaturalWonders: 3,
    OceanWidth: 4,
    LakeGenerationFrequency: 25,
    LakeSizeCutoff: 6,
    Continents: 2,
    AllOnLargestLandmass: false,
  },
  MAPSIZE_SMALL: {
    $index: 1,
    $hash: -1837222328,
    MapSizeType: "MAPSIZE_SMALL",
    GridWidth: 74,
    GridHeight: 46,
    DefaultPlayers: 6,
    PlayersLandmass1: 4,
    PlayersLandmass2: 2,
    StartSectorRows: 3,
    StartSectorCols: 3,
    NumNaturalWonders: 4,
    OceanWidth: 4,
    LakeGenerationFrequency: 25,
    LakeSizeCutoff: 8,
    Continents: 4,
    AllOnLargestLandmass: false,
  },
  MAPSIZE_STANDARD: {
    $index: 2,
    $hash: -2055278946,
    MapSizeType: "MAPSIZE_STANDARD",
    GridWidth: 84,
    GridHeight: 54,
    DefaultPlayers: 8,
    PlayersLandmass1: 5,
    PlayersLandmass2: 3,
    StartSectorRows: 4,
    StartSectorCols: 3,
    NumNaturalWonders: 5,
    OceanWidth: 4,
    LakeGenerationFrequency: 25,
    LakeSizeCutoff: 8,
    Continents: 4,
    AllOnLargestLandmass: false,
  },
  MAPSIZE_LARGE: {
    $index: 3,
    $hash: -1101990427,
    MapSizeType: "MAPSIZE_LARGE",
    GridWidth: 96,
    GridHeight: 60,
    DefaultPlayers: 10,
    PlayersLandmass1: 6,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 3,
    NumNaturalWonders: 6,
    OceanWidth: 8,
    LakeGenerationFrequency: 25,
    LakeSizeCutoff: 10,
    Continents: 6,
    AllOnLargestLandmass: false,
  },
  MAPSIZE_HUGE: {
    $index: 4,
    $hash: 370405108,
    MapSizeType: "MAPSIZE_HUGE",
    GridWidth: 106,
    GridHeight: 66,
    DefaultPlayers: 10,
    PlayersLandmass1: 6,
    PlayersLandmass2: 6,
    StartSectorRows: 4,
    StartSectorCols: 3,
    NumNaturalWonders: 7,
    OceanWidth: 8,
    LakeGenerationFrequency: 25,
    LakeSizeCutoff: 10,
    Continents: 6,
    AllOnLargestLandmass: false,
  },
} as const;

export const CIV7_MAP_SIZE_TYPES = Object.keys(CIV7_MAP_INFO_BY_TYPE) as Civ7MapSizeType[];

export function getCiv7MapInfo(mapSizeId: MapSizeId): Readonly<MapInfo> | null {
  if (typeof mapSizeId === "string" && mapSizeId in CIV7_MAP_INFO_BY_TYPE) {
    return CIV7_MAP_INFO_BY_TYPE[mapSizeId as Civ7MapSizeType];
  }
  const numeric = typeof mapSizeId === "string" && /^[+-]?\d+$/.test(mapSizeId) ? Number(mapSizeId) : mapSizeId;
  if (typeof numeric === "number") {
    return CIV7_MAP_SIZE_TYPES
      .map((type) => CIV7_MAP_INFO_BY_TYPE[type])
      .find((row) => row.$hash === numeric || row.$index === numeric) ?? null;
  }
  return null;
}

export function getCiv7MapInfoByDimensions(
  width: number,
  height: number
): Readonly<MapInfo> | null {
  return CIV7_MAP_SIZE_TYPES
    .map((type) => CIV7_MAP_INFO_BY_TYPE[type])
    .find((row) => row.GridWidth === width && row.GridHeight === height) ?? null;
}

export function getCiv7MapSizeTypeByDimensions(
  width: number,
  height: number
): Civ7MapSizeType | null {
  return CIV7_MAP_SIZE_TYPES.find((type) => {
    const row = CIV7_MAP_INFO_BY_TYPE[type];
    return row.GridWidth === width && row.GridHeight === height;
  }) ?? null;
}
