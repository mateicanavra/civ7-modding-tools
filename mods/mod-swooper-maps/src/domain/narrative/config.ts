import { Type, type Static } from "@swooper/mapgen-core/authoring";

import {
  CorridorsConfigSchema,
  type CorridorsConfig,
  type IslandHopCorridorConfig,
  type LandCorridorConfig,
  type SeaCorridorPolicy,
} from "@mapgen/domain/narrative/corridors/config.js";
import {
  OrogenyTunablesSchema,
  type OrogenyTunables,
} from "@mapgen/domain/narrative/orogeny/config.js";
import {
  ContinentalMarginsConfigSchema,
  HotspotTunablesSchema,
  RiftTunablesSchema,
  type ContinentalMarginsConfig,
  type NarrativeHotspotTunables,
  type RiftTunables,
} from "@mapgen/domain/narrative/tagging/config.js";

/**
 * Root narrative config is the recipe-facing facade. The strategy schemas stay
 * with the tagging/corridor/orogeny owners above; this aggregate only names the
 * public shape that recipe authors configure.
 */
const StoryConfigSchema = Type.Object(
  {
    /** Hotspot tuning for volcanic/paradise overlays. */
    hotspot: Type.Optional(HotspotTunablesSchema),
    /** Rift valley tagging knobs. */
    rift: Type.Optional(RiftTunablesSchema),
    /** Orogeny belt climate modifiers. */
    orogeny: Type.Optional(OrogenyTunablesSchema),
  },
  { additionalProperties: false }
);

export const NarrativeConfigSchema = Type.Object(
  {
    story: Type.Optional(StoryConfigSchema),
    corridors: Type.Optional(CorridorsConfigSchema),
    margins: Type.Optional(ContinentalMarginsConfigSchema),
  },
  { additionalProperties: false }
);

export type NarrativeConfig = Static<typeof NarrativeConfigSchema>;
export type StoryConfig = Static<typeof StoryConfigSchema>;
export type {
  ContinentalMarginsConfig,
  CorridorsConfig,
  IslandHopCorridorConfig,
  LandCorridorConfig,
  NarrativeHotspotTunables,
  OrogenyTunables,
  RiftTunables,
  SeaCorridorPolicy,
};
export {
  ContinentalMarginsConfigSchema,
  CorridorsConfigSchema,
  HotspotTunablesSchema,
  OrogenyTunablesSchema,
  RiftTunablesSchema,
};
