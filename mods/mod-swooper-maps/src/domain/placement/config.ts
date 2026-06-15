import placement from "@mapgen/domain/placement";
import { type Static, Type } from "@swooper/mapgen-core/authoring";

/**
 * Late-stage placement config (wonders, resources, starts).
 * Sourced from placement domain operations to keep schema + logic colocated.
 */
export const PlacementConfigSchema = Type.Object(
  {
    wonders: placement.ops.planWonders.config,
    naturalWonders: placement.ops.planNaturalWonders.config,
    discoveries: placement.ops.planDiscoveries.config,
    starts: placement.ops.planStarts.config,
  },
  { additionalProperties: false }
);

export type PlacementConfig = Static<typeof PlacementConfigSchema>;
