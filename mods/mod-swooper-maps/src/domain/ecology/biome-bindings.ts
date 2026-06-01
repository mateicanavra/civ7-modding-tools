import { Type, type Static } from "@swooper/mapgen-core/authoring";

const EngineBiomeGlobalSchema = (defaultValue: string, description: string) =>
  Type.Union(
    [
      Type.Literal("BIOME_DESERT"),
      Type.Literal("BIOME_GRASSLAND"),
      Type.Literal("BIOME_MARINE"),
      Type.Literal("BIOME_PLAINS"),
      Type.Literal("BIOME_TROPICAL"),
      Type.Literal("BIOME_TUNDRA"),
    ],
    { default: defaultValue, description }
  );

const MarineBiomeGlobalSchema = Type.Literal("BIOME_MARINE", {
  default: "BIOME_MARINE",
  description: "Engine biome global used for ocean and coastal water tiles.",
});

/**
 * Bindings from internal biome symbols to Civ7 engine biome globals.
 * These values are resolved during the biomes step to populate `field:biomeId`,
 * which downstream feature placement and engine validity checks depend on.
 */
export const BiomeEngineBindingsSchema = Type.Object(
  {
    /** Engine biome global used for permanent snow/ice biomes (written to field:biomeId). */
    snow: Type.Optional(
      EngineBiomeGlobalSchema(
        "BIOME_TUNDRA",
        "Engine biome global used for permanent snow/ice biomes."
      )
    ),
    /** Engine biome global used for tundra (cold, sparse vegetation). */
    tundra: Type.Optional(
      EngineBiomeGlobalSchema(
        "BIOME_TUNDRA",
        "Engine biome global used for tundra (cold, sparse vegetation)."
      )
    ),
    /** Engine biome global used for boreal forests (cold conifers). */
    boreal: Type.Optional(
      EngineBiomeGlobalSchema(
        "BIOME_TUNDRA",
        "Engine biome global used for boreal forests (cold conifers)."
      )
    ),
    /** Engine biome global used for dry temperate grasslands/steppes. */
    temperateDry: Type.Optional(
      EngineBiomeGlobalSchema(
        "BIOME_PLAINS",
        "Engine biome global used for dry temperate grasslands/steppes."
      )
    ),
    /** Engine biome global used for humid temperate plains/forests. */
    temperateHumid: Type.Optional(
      EngineBiomeGlobalSchema(
        "BIOME_GRASSLAND",
        "Engine biome global used for humid temperate plains/forests."
      )
    ),
    /** Engine biome global used for seasonal tropical savannas. */
    tropicalSeasonal: Type.Optional(
      EngineBiomeGlobalSchema(
        "BIOME_PLAINS",
        "Engine biome global used for seasonal tropical savannas."
      )
    ),
    /** Engine biome global used for tropical rainforest zones. */
    tropicalRainforest: Type.Optional(
      EngineBiomeGlobalSchema(
        "BIOME_TROPICAL",
        "Engine biome global used for tropical rainforest zones."
      )
    ),
    /** Engine biome global used for hot/cold desert basins. */
    desert: Type.Optional(
      EngineBiomeGlobalSchema(
        "BIOME_DESERT",
        "Engine biome global used for hot/cold desert basins."
      )
    ),
    /** Engine biome global used for ocean and coastal water tiles (water tiles must resolve to BIOME_MARINE). */
    marine: Type.Optional(MarineBiomeGlobalSchema),
  },
  {
    additionalProperties: false,
    description:
      "Mappings from biome symbols to Civ7 engine biome globals (used to populate field:biomeId).",
  }
);

export type BiomeEngineBindings = Static<typeof BiomeEngineBindingsSchema>;
