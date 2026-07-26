export type CultivatedResourceType =
  | "RESOURCE_COTTON"
  | "RESOURCE_DATES"
  | "RESOURCE_DYES"
  | "RESOURCE_INCENSE"
  | "RESOURCE_SILK"
  | "RESOURCE_WINE"
  | "RESOURCE_COCOA"
  | "RESOURCE_SPICES"
  | "RESOURCE_SUGAR"
  | "RESOURCE_TEA"
  | "RESOURCE_COFFEE"
  | "RESOURCE_TOBACCO"
  | "RESOURCE_CITRUS"
  | "RESOURCE_QUININE"
  | "RESOURCE_MANGOS"
  | "RESOURCE_RICE"
  | "RESOURCE_CLOVES"
  | "RESOURCE_FLAX";

export type CultivatedMaskField =
  | "warmAlluvialMask"
  | "floodplainOrRiverMask"
  | "warmGrassPlainsMask"
  | "oasisOrDesertWaterMask"
  | "aridDryWoodlandMask"
  | "coastalMarineMask"
  | "humidTropicalForestMask"
  | "wetTropicsMask"
  | "highlandOrReliefMask"
  | "temperateDryPlainsMask"
  | "savannaForestMask"
  | "tropicalFruitMask"
  | "wetlandPaddyMask"
  | "coolTemperatePlainsMask";

export type CultivatedSuppressionField = "coldMask" | "aridWithoutWaterMask" | "waterloggedMask";

export type CultivatedLaneId =
  | "alluvial-irrigated"
  | "arid-oasis-resin"
  | "marine-dye"
  | "temperate-field-orchard"
  | "humid-tropical-plantation"
  | "highland-medicinal"
  | "wetland-paddy"
  | "blocked-no-valid-biome";

export type CultivatedResourceSignals = {
  readonly laneId: CultivatedLaneId;
  readonly primary: readonly CultivatedMaskField[];
  readonly suppress: readonly CultivatedSuppressionField[];
};

/**
 * Canonical ordered cultivated resource set owned by this planning family. The family planner
 * iterates this list so missing expectations and signal coverage are reported for every
 * admitted type.
 */
export const CULTIVATED_RESOURCE_TYPES: readonly CultivatedResourceType[] = [
  "RESOURCE_COTTON",
  "RESOURCE_DATES",
  "RESOURCE_DYES",
  "RESOURCE_INCENSE",
  "RESOURCE_SILK",
  "RESOURCE_WINE",
  "RESOURCE_COCOA",
  "RESOURCE_SPICES",
  "RESOURCE_SUGAR",
  "RESOURCE_TEA",
  "RESOURCE_COFFEE",
  "RESOURCE_TOBACCO",
  "RESOURCE_CITRUS",
  "RESOURCE_QUININE",
  "RESOURCE_MANGOS",
  "RESOURCE_RICE",
  "RESOURCE_CLOVES",
  "RESOURCE_FLAX",
];

/**
 * Physical eligibility policy for each cultivated resource, mapping it to an admitted
 * cultivation lane plus primary and suppressing habitat masks. Empty primary lists
 * intentionally keep officially visible but currently unplaceable types blocked instead of
 * assigning generic habitat.
 */
export const CULTIVATED_SIGNALS: Record<CultivatedResourceType, CultivatedResourceSignals> = {
  RESOURCE_COTTON: {
    laneId: "alluvial-irrigated",
    primary: ["warmAlluvialMask", "floodplainOrRiverMask", "warmGrassPlainsMask"],
    suppress: ["coldMask"],
  },
  RESOURCE_DATES: {
    laneId: "arid-oasis-resin",
    primary: ["oasisOrDesertWaterMask"],
    suppress: ["coldMask"],
  },
  RESOURCE_DYES: {
    laneId: "marine-dye",
    primary: ["coastalMarineMask"],
    suppress: [],
  },
  RESOURCE_INCENSE: {
    laneId: "arid-oasis-resin",
    primary: ["aridDryWoodlandMask"],
    suppress: [],
  },
  RESOURCE_SILK: {
    laneId: "alluvial-irrigated",
    primary: ["floodplainOrRiverMask", "warmGrassPlainsMask"],
    suppress: ["coldMask", "aridWithoutWaterMask"],
  },
  RESOURCE_WINE: {
    laneId: "temperate-field-orchard",
    primary: ["temperateDryPlainsMask", "warmGrassPlainsMask"],
    suppress: ["coldMask"],
  },
  RESOURCE_COCOA: {
    laneId: "humid-tropical-plantation",
    primary: ["humidTropicalForestMask", "wetTropicsMask"],
    suppress: ["aridWithoutWaterMask", "coldMask"],
  },
  RESOURCE_SPICES: {
    laneId: "humid-tropical-plantation",
    primary: ["humidTropicalForestMask", "wetTropicsMask"],
    suppress: ["aridWithoutWaterMask"],
  },
  RESOURCE_SUGAR: {
    laneId: "alluvial-irrigated",
    primary: ["floodplainOrRiverMask", "wetTropicsMask", "warmAlluvialMask"],
    suppress: ["coldMask", "aridWithoutWaterMask"],
  },
  RESOURCE_TEA: {
    laneId: "highland-medicinal",
    primary: ["highlandOrReliefMask", "wetTropicsMask"],
    suppress: ["aridWithoutWaterMask"],
  },
  RESOURCE_COFFEE: {
    laneId: "highland-medicinal",
    primary: ["highlandOrReliefMask", "humidTropicalForestMask"],
    suppress: ["aridWithoutWaterMask", "coldMask"],
  },
  RESOURCE_TOBACCO: {
    laneId: "temperate-field-orchard",
    primary: ["warmGrassPlainsMask", "savannaForestMask"],
    suppress: ["coldMask", "waterloggedMask"],
  },
  RESOURCE_CITRUS: {
    laneId: "temperate-field-orchard",
    primary: ["tropicalFruitMask", "warmGrassPlainsMask", "warmAlluvialMask"],
    suppress: ["coldMask"],
  },
  RESOURCE_QUININE: {
    laneId: "highland-medicinal",
    primary: ["highlandOrReliefMask", "humidTropicalForestMask", "savannaForestMask"],
    suppress: ["aridWithoutWaterMask"],
  },
  RESOURCE_MANGOS: {
    laneId: "humid-tropical-plantation",
    primary: ["tropicalFruitMask", "wetTropicsMask", "humidTropicalForestMask"],
    suppress: ["coldMask"],
  },
  RESOURCE_RICE: {
    laneId: "wetland-paddy",
    primary: ["wetlandPaddyMask", "floodplainOrRiverMask"],
    suppress: ["aridWithoutWaterMask"],
  },
  RESOURCE_CLOVES: {
    laneId: "blocked-no-valid-biome",
    primary: [],
    suppress: [],
  },
  RESOURCE_FLAX: {
    laneId: "temperate-field-orchard",
    primary: ["coolTemperatePlainsMask", "warmGrassPlainsMask"],
    suppress: [],
  },
};
