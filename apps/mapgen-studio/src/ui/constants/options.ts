// ============================================================================
// OPTIONS
// ============================================================================
// Static option definitions for dropdowns and selectors.
// These are default options that can be overridden via props.
// ============================================================================

import type { MapSize, SelectOption } from "@swooper/mapgen-studio-ui/types";

interface MapSizeOption extends SelectOption<MapSize> {
  dimensions: string;
  width: number;
  height: number;
}

export const MAP_SIZE_OPTIONS: readonly MapSizeOption[] = [
  {
    value: "MAPSIZE_TINY",
    label: "Tiny",
    dimensions: "60×38",
    width: 60,
    height: 38,
  },
  {
    value: "MAPSIZE_SMALL",
    label: "Small",
    dimensions: "74×46",
    width: 74,
    height: 46,
  },
  {
    value: "MAPSIZE_STANDARD",
    label: "Standard",
    dimensions: "84×54",
    width: 84,
    height: 54,
  },
  {
    value: "MAPSIZE_LARGE",
    label: "Large",
    dimensions: "96×60",
    width: 96,
    height: 60,
  },
  {
    value: "MAPSIZE_HUGE",
    label: "Huge",
    dimensions: "106×66",
    width: 106,
    height: 66,
  },
] as const;

export const PLAYER_COUNT_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
