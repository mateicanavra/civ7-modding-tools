/** Stable Civ7 engine-global names that recipe projection policy may resolve. */
export const CIV7_BIOME_GLOBAL = {
  DESERT: "BIOME_DESERT",
  GRASSLAND: "BIOME_GRASSLAND",
  MARINE: "BIOME_MARINE",
  PLAINS: "BIOME_PLAINS",
  TROPICAL: "BIOME_TROPICAL",
  TUNDRA: "BIOME_TUNDRA",
} as const;

const CIV7_BIOME_GLOBALS = [
  CIV7_BIOME_GLOBAL.DESERT,
  CIV7_BIOME_GLOBAL.GRASSLAND,
  CIV7_BIOME_GLOBAL.MARINE,
  CIV7_BIOME_GLOBAL.PLAINS,
  CIV7_BIOME_GLOBAL.TROPICAL,
  CIV7_BIOME_GLOBAL.TUNDRA,
] as const;

export type Civ7BiomeGlobal = (typeof CIV7_BIOME_GLOBALS)[number];

/** Engine-global name used when a projected tile belongs to the marine biome. */
export const CIV7_MARINE_BIOME_GLOBAL = CIV7_BIOME_GLOBAL.MARINE;
