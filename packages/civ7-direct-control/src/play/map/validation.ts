import { boundedInteger } from "../../validation.js";
import { HARD_CIV7_MAP_GRID_MAX_PLOTS } from "./constants.js";
import type { Civ7MapBounds, Civ7MapLocation } from "./types.js";

export function validateMapLocation(location: Civ7MapLocation): void {
  boundedInteger(location.x, 0, 1_000_000, "x");
  boundedInteger(location.y, 0, 1_000_000, "y");
}

export function validateMapBounds(bounds: Civ7MapBounds): void {
  validateMapLocation(bounds);
  boundedInteger(bounds.width, 1, HARD_CIV7_MAP_GRID_MAX_PLOTS, "bounds.width");
  boundedInteger(bounds.height, 1, HARD_CIV7_MAP_GRID_MAX_PLOTS, "bounds.height");
}
