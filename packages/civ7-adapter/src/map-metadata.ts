/**
 * Compatibility entrypoint for the static Civ7 map-size policy now owned by
 * `@civ7/map-policy`.
 */
export type {
  Civ7LatitudeBounds,
  Civ7MapInfoLatitudeSource,
  Civ7StandardMapInfo,
  Civ7StandardMapSizeId,
  Civ7StandardMapSizePreset,
} from "@civ7/map-policy";
export {
  CIV7_STANDARD_MAP_SIZE_PRESETS,
  CIV7_STANDARD_ROW_LATITUDE_BOUNDS,
  findCiv7StandardMapSizePreset,
  getCiv7MapInfoLatitudeBounds,
  getCiv7RowLatitude,
  getCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePresetForDimensions,
  interpolateCiv7RowLatitude,
} from "@civ7/map-policy";
