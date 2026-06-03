import { getCiv7MapInfo, type MapInfo, type MapSizeId } from "@civ7/adapter";

export type BrowserMapInfoInput = Readonly<{
  mapSizeId: MapSizeId;
  dimensions: Readonly<{ width: number; height: number }>;
  resourcesMode?: string;
}>;

export function buildBrowserRunMapInfo(input: BrowserMapInfoInput): MapInfo {
  const base = getCiv7MapInfo(input.mapSizeId);
  return {
    ...(base ?? {}),
    GridWidth: input.dimensions.width,
    GridHeight: input.dimensions.height,
    StudioResourcesMode: input.resourcesMode ?? "balanced",
  };
}
