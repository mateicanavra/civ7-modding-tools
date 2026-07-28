// ============================================================================
// OPTIONS
// ============================================================================
// Static option definitions for dropdowns and selectors.
// These are default options that can be overridden via props.
// ============================================================================

import type { MapSize, SelectOption } from "@swooper/mapgen-studio-ui/types";
import { CIV7_STUDIO_MAP_SIZE_PRESETS } from "../../features/civ7Setup/mapSizes";

interface MapSizeOption extends SelectOption<MapSize> {
  dimensions: string;
  width: number;
  height: number;
}

/** Selector rows projected directly from the canonical Civ7 map-size policy presets. */
export const MAP_SIZE_OPTIONS: readonly MapSizeOption[] = CIV7_STUDIO_MAP_SIZE_PRESETS.map(
  ({ id, label, dimensions }) => ({
    value: id,
    label,
    dimensions: `${dimensions.width}×${dimensions.height}`,
    width: dimensions.width,
    height: dimensions.height,
  })
);
