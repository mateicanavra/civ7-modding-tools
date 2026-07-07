import type { CatalogSourceEntry, CatalogSourceEntryDefinition } from "./sources.js";

function catalogSource(entry: CatalogSourceEntryDefinition): CatalogSourceEntry {
  return {
    ...entry,
    digestInputs: [
      {
        kind: "config-file",
        path: entry.configPath,
      },
    ],
  };
}

/**
 * Durable Swooper Maps catalog membership.
 *
 * This is source data, not generated output. Packet 4 keeps generation on its
 * current reader, but later launch-source and catalog-cutover packets use this
 * list as the stable source-id vocabulary for shipped catalog maps.
 */
export const CatalogSourceIndex = [
  catalogSource({
    catalogSourceId: "swooper-desert-mountains",
    configPath: "mods/mod-swooper-maps/src/maps/configs/swooper-desert-mountains.config.json",
    name: "Swooper Desert Mountains",
    description:
      "Plate-forged mega ranges carve a hyper-arid world into stark basins and windward oases. Expect towering boundary cordilleras, savage lee-side deserts, and a handful of monsoon belts clinging to the mountains that feed them.",
    recipe: "standard",
    sortIndex: 500,
    latitudeBounds: {
      topLatitude: 40,
      bottomLatitude: -40,
    },
  }),
  catalogSource({
    catalogSourceId: "swooper-earthlike",
    configPath: "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json",
    name: "Swooper Earthlike",
    description:
      "An Earth-analogue world with vast oceans, a handful of major continents, and familiar climate belts. Expect wet equatorial jungles, dry subtropical deserts, temperate heartlands, and polar tundra shaped by plate-driven mountain arcs and broad passive coasts.",
    recipe: "standard",
    sortIndex: 501,
  }),
  catalogSource({
    catalogSourceId: "shattered-ring",
    configPath: "mods/mod-swooper-maps/src/maps/configs/shattered-ring.config.json",
    name: "The Shattered Ring",
    description:
      "A world forever changed by an ancient cosmic impact. A vast crater sea dominates the center, ringed by towering mountains thrust up by the cataclysm. Volcanic islands dot the inner waters while fractured outer lands offer expansive frontiers. Three theaters of play: the protected inner sea for naval dominance, the ring mountains for defensive strongholds, and the outer lands for continental expansion.",
    recipe: "standard",
    sortIndex: 502,
  }),
  catalogSource({
    catalogSourceId: "sundered-archipelago",
    configPath: "mods/mod-swooper-maps/src/maps/configs/sundered-archipelago.config.json",
    name: "The Sundered Archipelago",
    description:
      "A world shattered by ancient tectonic rifting into countless volcanic islands and shallow seas. Hundreds of islands form chains connected by coral reefs and strategic straits. Naval supremacy determines the fate of empires as civilizations island-hop toward dominance. Lush tropical paradises contrast with smoldering volcanic peaks, while narrow channels create natural choke points for trade and warfare.",
    recipe: "standard",
    sortIndex: 503,
  }),
  catalogSource({
    catalogSourceId: "mountains-of-time-earthlike",
    configPath: "mods/mod-swooper-maps/src/maps/configs/mountains-of-time-earthlike.config.json",
    name: "Mountains of Time Earthlike",
    description: "Mountains of Time Earthlike",
    recipe: "standard",
    sortIndex: 900,
  }),
  catalogSource({
    catalogSourceId: "latest-juicy",
    configPath: "mods/mod-swooper-maps/src/maps/configs/latest-juicy.config.json",
    name: "Latest Juicy",
    description: "Config and seed last proved through Run in Game.",
    recipe: "standard",
    sortIndex: 1900,
  }),
  catalogSource({
    catalogSourceId: "mountain-patch",
    configPath: "mods/mod-swooper-maps/src/maps/configs/mountain-patch.config.json",
    name: "Mountain Patch",
    description: "Config and seed last proved through Run in Game.",
    recipe: "standard",
    sortIndex: 1900,
  }),
  catalogSource({
    catalogSourceId: "mountains-of-time-original",
    configPath: "mods/mod-swooper-maps/src/maps/configs/mountains-of-time-original.config.json",
    name: "Mountains of Time (original)",
    description: "Earthlike map with great mountains and diverse continent formation",
    recipe: "standard",
    sortIndex: 1900,
  }),
  catalogSource({
    catalogSourceId: "mountain-rivers-patch",
    configPath: "mods/mod-swooper-maps/src/maps/configs/mountain-rivers-patch.config.json",
    name: "Mountain Rivers Patch",
    description:
      "Mountain Patch terrain configuration with the current visible-river projection settings applied for Studio comparison.",
    recipe: "standard",
    sortIndex: 1901,
  }),
] as const satisfies readonly CatalogSourceEntry[];
