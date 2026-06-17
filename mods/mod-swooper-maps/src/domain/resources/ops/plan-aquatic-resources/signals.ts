export type AquaticResourceType =
  | "RESOURCE_FISH"
  | "RESOURCE_PEARLS"
  | "RESOURCE_WHALES"
  | "RESOURCE_CRABS"
  | "RESOURCE_COWRIE"
  | "RESOURCE_TURTLES";

export type AquaticMaskField =
  | "coastalWaterMask"
  | "shelfMask"
  | "warmShallowWaterMask"
  | "coldProductiveWaterMask"
  | "reefOrProtectedShallowsMask"
  | "estuaryMask"
  | "navigableRiverMouthMask";

export type AquaticSuppressionField = "lakeMask" | "iceMask";

export type AquaticResourceSignals = {
  readonly primary: readonly AquaticMaskField[];
  readonly suppress: readonly AquaticSuppressionField[];
};

export const AQUATIC_RESOURCE_TYPES: readonly AquaticResourceType[] = [
  "RESOURCE_FISH",
  "RESOURCE_PEARLS",
  "RESOURCE_WHALES",
  "RESOURCE_CRABS",
  "RESOURCE_COWRIE",
  "RESOURCE_TURTLES",
];

export const AQUATIC_SIGNALS: Record<AquaticResourceType, AquaticResourceSignals> = {
  RESOURCE_FISH: {
    primary: ["coastalWaterMask", "shelfMask"],
    suppress: ["lakeMask", "iceMask"],
  },
  RESOURCE_PEARLS: {
    primary: ["warmShallowWaterMask", "reefOrProtectedShallowsMask"],
    suppress: ["lakeMask", "iceMask"],
  },
  RESOURCE_WHALES: {
    primary: ["coldProductiveWaterMask", "shelfMask"],
    suppress: ["lakeMask", "iceMask"],
  },
  RESOURCE_CRABS: {
    primary: ["estuaryMask", "navigableRiverMouthMask", "coastalWaterMask"],
    suppress: ["iceMask"],
  },
  RESOURCE_COWRIE: {
    primary: ["warmShallowWaterMask", "reefOrProtectedShallowsMask"],
    suppress: ["lakeMask", "iceMask"],
  },
  RESOURCE_TURTLES: {
    primary: ["warmShallowWaterMask", "reefOrProtectedShallowsMask", "coastalWaterMask"],
    suppress: ["lakeMask", "iceMask"],
  },
};
