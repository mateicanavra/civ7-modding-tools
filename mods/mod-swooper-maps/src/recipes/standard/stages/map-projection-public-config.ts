import { CIV7_BIOME_GLOBAL, CIV7_BIOME_GLOBALS } from "@civ7/map-policy";
import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

const EngineBiomeGlobalSchema = (defaultValue: string, description: string) =>
  Type.Union(
    CIV7_BIOME_GLOBALS.map((value) => Type.Literal(value)),
    { default: defaultValue, description }
  );

const MarineBiomeGlobalSchema = Type.Literal(CIV7_BIOME_GLOBAL.MARINE, {
  default: CIV7_BIOME_GLOBAL.MARINE,
  description: "Engine biome global used for ocean and coastal water tiles.",
});

/**
 * Projection-owned bindings from Ecology biome truth to Civ7 engine globals.
 *
 * Ecology owns semantic biome symbols. The map-ecology projection stage owns
 * how those symbols are materialized into Civ7 runtime biome IDs.
 */
export const BiomeEngineBindingsSchema = Type.Object(
  {
    snow: EngineBiomeGlobalSchema(
      CIV7_BIOME_GLOBAL.TUNDRA,
      "Engine biome global used for permanent snow/ice biomes."
    ),
    tundra: EngineBiomeGlobalSchema(
      CIV7_BIOME_GLOBAL.TUNDRA,
      "Engine biome global used for tundra (cold, sparse vegetation)."
    ),
    boreal: EngineBiomeGlobalSchema(
      CIV7_BIOME_GLOBAL.TUNDRA,
      "Engine biome global used for boreal forests (cold conifers)."
    ),
    temperateDry: EngineBiomeGlobalSchema(
      CIV7_BIOME_GLOBAL.PLAINS,
      "Engine biome global used for dry temperate grasslands/steppes."
    ),
    temperateHumid: EngineBiomeGlobalSchema(
      CIV7_BIOME_GLOBAL.GRASSLAND,
      "Engine biome global used for humid temperate plains/forests."
    ),
    tropicalSeasonal: EngineBiomeGlobalSchema(
      CIV7_BIOME_GLOBAL.PLAINS,
      "Engine biome global used for seasonal tropical savannas."
    ),
    tropicalRainforest: EngineBiomeGlobalSchema(
      CIV7_BIOME_GLOBAL.TROPICAL,
      "Engine biome global used for tropical rainforest zones."
    ),
    desert: EngineBiomeGlobalSchema(
      CIV7_BIOME_GLOBAL.DESERT,
      "Engine biome global used for hot/cold desert basins."
    ),
    marine: MarineBiomeGlobalSchema,
  },
  {
    additionalProperties: false,
    description:
      "Mappings from Ecology biome symbols to Civ7 engine biome globals used during map projection.",
  }
);

export type BiomeEngineBindings = Static<typeof BiomeEngineBindingsSchema>;

export const MapMorphologyKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map morphology knobs. Terrain projection currently has no author-facing stage knobs.",
  }
);

export const MapMorphologyPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map morphology projection controls. This stage materializes upstream landmass, coast, mountain, and volcano truth into Civ7 terrain fields without additional author-facing controls.",
  }
);

export const MapHydrologyKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description: "Map hydrology knobs. Lake projection currently has no author-facing stage knobs.",
  }
);

export const MapHydrologyPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map hydrology projection controls. This stage stamps Hydrology lake intent into Civ7 water state and always records readback evidence.",
  }
);

export const MapElevationKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map elevation knobs. Elevation materialization currently has no author-facing stage knobs.",
  }
);

export const MapElevationPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map elevation projection controls. This stage asks Civ7 to rebuild elevation after static water projection and before river modeling.",
  }
);

export const MapEcologyKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map ecology knobs. Ecology projection currently has no author-facing stage knobs.",
  }
);

export const MapEcologyPublicSchema = Type.Object(
  {
    biomeBindings: BiomeEngineBindingsSchema,
  },
  {
    additionalProperties: false,
    description:
      "Map ecology projection controls for binding Ecology biome symbols to Civ7 biome globals. Feature and plot-effect application use deterministic projection defaults.",
  }
);
