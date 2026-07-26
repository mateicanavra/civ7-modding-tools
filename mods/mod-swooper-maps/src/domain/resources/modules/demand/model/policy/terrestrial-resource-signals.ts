export type TerrestrialResourceType =
  | "RESOURCE_CAMELS"
  | "RESOURCE_HIDES"
  | "RESOURCE_HORSES"
  | "RESOURCE_WOOL"
  | "RESOURCE_IVORY"
  | "RESOURCE_FURS"
  | "RESOURCE_TRUFFLES"
  | "RESOURCE_RUBBER"
  | "RESOURCE_HARDWOOD"
  | "RESOURCE_WILD_GAME"
  | "RESOURCE_LLAMAS";

export type TerrestrialMaskField =
  | "aridRangelandMask"
  | "openGrassPlainsMask"
  | "tundraColdEdgeMask"
  | "hillHighlandMask"
  | "savannaWateringHoleMask"
  | "tropicalForestEdgeMask"
  | "taigaBorealForestMask"
  | "moistWoodlandEdgeMask"
  | "tropicalForestMask"
  | "diverseWildHabitatMask"
  | "tropicalHighlandMask";

export type TerrestrialSuppressionField =
  | "coldMask"
  | "aridWithoutWaterMask"
  | "denseForestMask"
  | "cultivatedPressureMask";

export type TerrestrialLaneId =
  | "arid-rangeland"
  | "open-grazing"
  | "highland-pastoral"
  | "savanna-megafauna"
  | "cold-boreal-furs"
  | "woodland-host"
  | "tropical-forest-product"
  | "diverse-wild-habitat"
  | "tropical-highland-pastoral";

export type TerrestrialResourceSignals = {
  readonly laneId: TerrestrialLaneId;
  readonly primary: readonly TerrestrialMaskField[];
  readonly suppress: readonly TerrestrialSuppressionField[];
};

/**
 * Canonical ordered terrestrial resource set owned by this planning family. The family planner
 * iterates this list so missing expectations and signal coverage are reported for every
 * admitted type.
 */
export const TERRESTRIAL_RESOURCE_TYPES: readonly TerrestrialResourceType[] = [
  "RESOURCE_CAMELS",
  "RESOURCE_HIDES",
  "RESOURCE_HORSES",
  "RESOURCE_WOOL",
  "RESOURCE_IVORY",
  "RESOURCE_FURS",
  "RESOURCE_TRUFFLES",
  "RESOURCE_RUBBER",
  "RESOURCE_HARDWOOD",
  "RESOURCE_WILD_GAME",
  "RESOURCE_LLAMAS",
];

/**
 * Physical eligibility policy for each terrestrial resource, mapping it to an admitted
 * land-habitat lane plus primary and suppressing ecology masks. Empty primary lists
 * intentionally keep officially visible but currently unplaceable types blocked instead of
 * assigning generic habitat.
 */
export const TERRESTRIAL_SIGNALS: Record<TerrestrialResourceType, TerrestrialResourceSignals> = {
  RESOURCE_CAMELS: {
    laneId: "arid-rangeland",
    primary: ["aridRangelandMask", "openGrassPlainsMask"],
    suppress: ["coldMask"],
  },
  RESOURCE_HIDES: {
    laneId: "open-grazing",
    primary: ["openGrassPlainsMask", "tundraColdEdgeMask"],
    suppress: ["denseForestMask"],
  },
  RESOURCE_HORSES: {
    laneId: "open-grazing",
    primary: ["openGrassPlainsMask"],
    suppress: ["denseForestMask", "aridWithoutWaterMask"],
  },
  RESOURCE_WOOL: {
    laneId: "highland-pastoral",
    primary: ["hillHighlandMask", "aridRangelandMask", "tundraColdEdgeMask"],
    suppress: [],
  },
  RESOURCE_IVORY: {
    laneId: "savanna-megafauna",
    primary: ["savannaWateringHoleMask", "tropicalForestEdgeMask"],
    suppress: ["coldMask"],
  },
  RESOURCE_FURS: {
    laneId: "cold-boreal-furs",
    primary: ["taigaBorealForestMask", "tundraColdEdgeMask"],
    suppress: [],
  },
  RESOURCE_TRUFFLES: {
    laneId: "woodland-host",
    primary: ["moistWoodlandEdgeMask"],
    suppress: ["aridWithoutWaterMask"],
  },
  RESOURCE_RUBBER: {
    laneId: "tropical-forest-product",
    primary: ["tropicalForestMask"],
    suppress: ["aridWithoutWaterMask", "coldMask"],
  },
  RESOURCE_HARDWOOD: {
    laneId: "tropical-forest-product",
    primary: ["tropicalForestMask", "taigaBorealForestMask"],
    suppress: [],
  },
  RESOURCE_WILD_GAME: {
    laneId: "diverse-wild-habitat",
    primary: [
      "diverseWildHabitatMask",
      "tropicalForestMask",
      "openGrassPlainsMask",
      "tundraColdEdgeMask",
    ],
    suppress: ["cultivatedPressureMask"],
  },
  RESOURCE_LLAMAS: {
    laneId: "tropical-highland-pastoral",
    primary: ["tropicalHighlandMask"],
    suppress: [],
  },
};
