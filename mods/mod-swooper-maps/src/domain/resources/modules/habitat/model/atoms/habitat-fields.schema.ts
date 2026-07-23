/**
 * Canonical names for every binary habitat and suppression mask emitted by
 * `deriveHabitatFields` and consumed by resource-family planners. The tuple is the shared key
 * authority, preventing contract generation and strategy lookup from drifting.
 */
export const HABITAT_MASK_FIELD_NAMES = [
  "coastalWaterMask",
  "shelfMask",
  "warmShallowWaterMask",
  "coldProductiveWaterMask",
  "reefOrProtectedShallowsMask",
  "estuaryMask",
  "navigableRiverMouthMask",
  "lakeMask",
  "iceMask",
  "aridRangelandMask",
  "openGrassPlainsMask",
  "tundraColdEdgeMask",
  "hillHighlandMask",
  "savannaWateringHoleMask",
  "tropicalForestEdgeMask",
  "taigaBorealForestMask",
  "moistWoodlandEdgeMask",
  "tropicalForestMask",
  "diverseWildHabitatMask",
  "tropicalHighlandMask",
  "coldMask",
  "aridWithoutWaterMask",
  "denseForestMask",
  "cultivatedPressureMask",
  "warmAlluvialMask",
  "floodplainOrRiverMask",
  "warmGrassPlainsMask",
  "oasisOrDesertWaterMask",
  "aridDryWoodlandMask",
  "coastalMarineMask",
  "humidTropicalForestMask",
  "wetTropicsMask",
  "highlandOrReliefMask",
  "temperateDryPlainsMask",
  "savannaForestMask",
  "tropicalFruitMask",
  "wetlandPaddyMask",
  "coolTemperatePlainsMask",
  "waterloggedMask",
  "orogenyMask",
  "alluvialPlacerMask",
  "tundraDesertHillMask",
  "evaporiteBasinMask",
  "sedimentaryBasinMask",
  "ultramaficMask",
  "weatheringClayFlatMask",
  "carbonateBeltMask",
  "cratonMask",
  "closedBasinMask",
  "aridSoilMask",
  "forestWetlandBasinMask",
  "hydrocarbonBasinMask",
  "wetAlluvialMask",
  "graniteBeltMask",
  "oilAdjacencyMask",
  "metamorphicBeltMask",
  "collisionBeltMask",
  "flatNonGeologicMask",
  "wetSuppressionMask",
  "humidSuppressionMask",
  "offshoreMask",
  "igneousTerrainMask",
] as const;

/** Intensity fields that weight otherwise eligible resource sites within each family lane. */
export const HABITAT_INTENSITY_FIELD_NAMES = [
  "aquaticIntensity",
  "cultivatedIntensity",
  "terrestrialIntensity",
  "geologicalIntensity",
] as const;

export type HabitatMaskFieldName = (typeof HABITAT_MASK_FIELD_NAMES)[number];
export type HabitatIntensityFieldName = (typeof HABITAT_INTENSITY_FIELD_NAMES)[number];

export type HabitatFieldsOutput = {
  width: number;
  height: number;
} & Record<HabitatMaskFieldName, Uint8Array> &
  Record<HabitatIntensityFieldName, Float32Array>;
