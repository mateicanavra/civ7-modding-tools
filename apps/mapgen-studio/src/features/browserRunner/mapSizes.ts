import {
  CIV7_MAP_INFO_BY_TYPE,
  DEFAULT_CIV7_MAP_LATITUDE_BOUNDS,
  type Civ7LatitudeBounds,
  type Civ7MapSizeType,
  type MapInfo,
} from "@civ7/adapter";

export type Civ7MapSizePreset = {
  id: Civ7MapSizeType;
  label: "Tiny" | "Small" | "Standard" | "Large" | "Huge";
  dimensions: { width: number; height: number };
  defaultPlayers: number;
  latitudeBounds: Civ7LatitudeBounds;
  mapInfo: Readonly<MapInfo>;
};

const CIV7_MAP_SIZE_ENTRIES = [
  { id: "MAPSIZE_TINY", label: "Tiny", mapInfo: CIV7_MAP_INFO_BY_TYPE.MAPSIZE_TINY },
  { id: "MAPSIZE_SMALL", label: "Small", mapInfo: CIV7_MAP_INFO_BY_TYPE.MAPSIZE_SMALL },
  { id: "MAPSIZE_STANDARD", label: "Standard", mapInfo: CIV7_MAP_INFO_BY_TYPE.MAPSIZE_STANDARD },
  { id: "MAPSIZE_LARGE", label: "Large", mapInfo: CIV7_MAP_INFO_BY_TYPE.MAPSIZE_LARGE },
  { id: "MAPSIZE_HUGE", label: "Huge", mapInfo: CIV7_MAP_INFO_BY_TYPE.MAPSIZE_HUGE },
] as const;

export const CIV7_MAP_SIZES: Civ7MapSizePreset[] = CIV7_MAP_SIZE_ENTRIES.map((entry) => ({
  ...entry,
  dimensions: {
    width: entry.mapInfo.GridWidth ?? 0,
    height: entry.mapInfo.GridHeight ?? 0,
  },
  defaultPlayers: Number(entry.mapInfo.DefaultPlayers ?? 0),
  latitudeBounds: DEFAULT_CIV7_MAP_LATITUDE_BOUNDS,
}));

export const DEFAULT_CIV7_MAP_SIZE =
  CIV7_MAP_SIZES.find((m) => m.id === "MAPSIZE_STANDARD") ?? CIV7_MAP_SIZES[0]!;

export const DEFAULT_CIV7_PLAYER_COUNT = DEFAULT_CIV7_MAP_SIZE.defaultPlayers;

export function getCiv7MapSizePreset(id: Civ7MapSizePreset["id"]): Civ7MapSizePreset {
  return CIV7_MAP_SIZES.find((m) => m.id === id) ?? DEFAULT_CIV7_MAP_SIZE;
}

export function formatMapSizeLabel(p: Civ7MapSizePreset): string {
  return `${p.label} (${p.dimensions.width}×${p.dimensions.height})`;
}
