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

/**
 * Civ7 stock map-script river materialization policy.
 *
 * Source evidence:
 * - Every stock `base-standard/maps/*.js` river pass uses
 *   `TerrainBuilder.modelRivers(..., g_NavigableRiverTerrain)`, followed by
 *   `TerrainBuilder.validateAndFixTerrain()` and
 *   `TerrainBuilder.defineNamedRivers()`.
 * - Most continental stock scripts use `(5, 15)`.
 * - Archipelago and shuffle use wider profiles for island-heavy maps.
 *
 * This is engine materialization policy, not MapGen Hydrology truth. MapGen
 * domains decide what river truth exists; map stages use this policy when
 * asking Civ to turn projected navigable terrain into native river objects.
 */
export const CIV7_RIVER_MODELING_POLICY_V0 = {
  source: [
    "Base/modules/base-standard/maps/continents.js",
    "Base/modules/base-standard/maps/fractal.js",
    "Base/modules/base-standard/maps/pangaea-plus.js",
    "Base/modules/base-standard/maps/continents-plus.js",
    "Base/modules/base-standard/maps/terra-incognita.js",
    "Base/modules/base-standard/maps/continents-voronoi.js",
    "Base/modules/base-standard/maps/fractal-voronoi.js",
    "Base/modules/base-standard/maps/pangaea-voronoi.js",
    "Base/modules/base-standard/maps/shattered-seas-voronoi.js",
    "Base/modules/base-standard/maps/archipelago.js",
    "Base/modules/base-standard/maps/shuffle.js",
    "Base/modules/base-standard/maps/map-globals.js",
  ],
  navigableTerrain: "TERRAIN_NAVIGABLE_RIVER",
  sequence: [
    "TerrainBuilder.modelRivers",
    "TerrainBuilder.validateAndFixTerrain",
    "TerrainBuilder.defineNamedRivers",
  ],
  profiles: {
    standardContinental: {
      minLength: 5,
      maxLength: 15,
      source: [
        "Base/modules/base-standard/maps/continents.js",
        "Base/modules/base-standard/maps/fractal.js",
        "Base/modules/base-standard/maps/pangaea-plus.js",
        "Base/modules/base-standard/maps/continents-plus.js",
        "Base/modules/base-standard/maps/terra-incognita.js",
        "Base/modules/base-standard/maps/continents-voronoi.js",
        "Base/modules/base-standard/maps/fractal-voronoi.js",
        "Base/modules/base-standard/maps/pangaea-voronoi.js",
        "Base/modules/base-standard/maps/shattered-seas-voronoi.js",
      ],
    },
    islandHeavy: {
      minLength: 5,
      maxLength: 70,
      source: [
        "Base/modules/base-standard/maps/archipelago.js",
        "Base/modules/base-standard/maps/shuffle.js",
      ],
    },
    shuffleLargeLandmass: {
      minLength: 10,
      maxLength: 85,
      source: ["Base/modules/base-standard/maps/shuffle.js"],
    },
  },
  defaultProfile: "standardContinental",
} as const;

export const CIV7_DEFAULT_RIVER_MODELING_ARGS =
  CIV7_RIVER_MODELING_POLICY_V0.profiles[CIV7_RIVER_MODELING_POLICY_V0.defaultProfile];
