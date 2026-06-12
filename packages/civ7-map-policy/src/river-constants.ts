import { CIV7_BROWSER_TABLES_V0 } from "./civ7-tables.gen.js";

/**
 * Civ7 river type metadata values.
 *
 * Source evidence:
 * - Live direct-control readback on 2026-06-09:
 *   `RiverTypes = { NO_RIVER: -1, RIVER_MINOR: 0, RIVER_NAVIGABLE: 1 }`.
 * - Official base-standard data references `RIVER_MINOR` and
 *   `RIVER_NAVIGABLE` as gameplay obstacles/adjacency classes.
 *
 * These are metadata values returned by `GameplayMap.getRiverType`; they are
 * not terrain ids. `TERRAIN_NAVIGABLE_RIVER` remains a separate terrain row.
 */
export const CIV7_RIVER_TYPES_V0 = CIV7_BROWSER_TABLES_V0.riverTypes;

export const NO_RIVER_TYPE = CIV7_RIVER_TYPES_V0.values.NO_RIVER;
export const RIVER_TYPE_MINOR = CIV7_RIVER_TYPES_V0.values.RIVER_MINOR;
export const RIVER_TYPE_NAVIGABLE = CIV7_RIVER_TYPES_V0.values.RIVER_NAVIGABLE;
