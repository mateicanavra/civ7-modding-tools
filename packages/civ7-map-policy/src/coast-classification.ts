/**
 * Civ7 water-class constants shared by the coast projection and the coast-ring policy.
 *
 * The coast projection (map-morphology/plot-coasts) stamps these into engine terrain:
 *   0 = land, 1 = coast (the continental shelf + the guaranteed shoreline ring),
 *   2 = ocean (deep water).
 *
 * The legacy uniform coast-distance band (applyCiv7CoastClassificationPolicy, sourced from
 * the map-globals oceanWaterColumns count) was retired: coast width is the physically-derived
 * shelf (see @mapgen compute-shelf-mask), and the land-adjacency guarantee is owned by
 * applyCiv7CoastRingPolicy (./coast-ring.ts).
 */
export const WATER_CLASS_LAND = 0;
export const WATER_CLASS_COAST = 1;
export const WATER_CLASS_OCEAN = 2;
