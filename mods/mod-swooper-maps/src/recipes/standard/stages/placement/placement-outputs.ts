import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Terminal placement summary counts. Every field here is measured from
 * product artifacts at the publish site — permanently-zero placeholder fields
 * (floodplainsCount, snowTilesCount) and the never-produced methodCalls log
 * were removed in placement-realignment S6 instead of being faked.
 */
export const PlacementOutputsV1Schema = Type.Object(
  {
    naturalWondersCount: Type.Number(),
    resourcesCount: Type.Number(),
    startsAssigned: Type.Number(),
    discoveriesCount: Type.Number(),
  },
  { additionalProperties: false }
);

export type PlacementOutputsV1 = Static<typeof PlacementOutputsV1Schema>;
