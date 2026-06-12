import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

/**
 * Derives the named habitat lane masks the family demand planners consume
 * (placement-realignment S3 step 2). Inputs are pipeline artifacts only
 * (morphology topography/coastline/mountains/belts, hydrology hydrography +
 * lake plan, ecology biome classification + pedology, cryosphere); outputs
 * are the exact mask field names declared by the family planner contracts,
 * including the marine/aquatic lanes (E2.4), plus per-family intensity
 * fields that modulate inhomogeneous-Poisson site selection (E2.5).
 */

const u8 = (description: string) => TypedArraySchemas.u8({ description });
const f32 = (description: string) => TypedArraySchemas.f32({ description });

const PlanInput = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    landMask: u8("Land mask per tile (1=land, 0=water)."),
    lakeMask: u8("Deterministic lake plan mask (1=lake)."),
    coastalWater: u8("Water tiles adjacent to land (morphology coastlineMetrics)."),
    shelfWater: u8("Continental shelf water mask (morphology coastlineMetrics)."),
    riverClass: u8("Hydrology river class per tile (0=none,1=minor,2=major)."),
    surfaceTemperature: f32("Surface temperature per tile (C)."),
    aridityIndex: f32("Aridity index per tile (0..1)."),
    effectiveMoisture: f32("Effective moisture per tile (normalized internally)."),
    vegetationDensity: f32("Ecology vegetation density per tile (0..1)."),
    fertility: f32("Pedology fertility per tile (0..1)."),
    elevation: TypedArraySchemas.i16({ description: "Topography elevation per tile." }),
    hillMask: u8("Morphology hill mask."),
    mountainMask: u8("Morphology mountain mask."),
    foothillMask: Type.Optional(u8("Morphology foothill mask.")),
    orogenyPotential: Type.Optional(u8("Morphology orogeny potential (0..255).")),
    upliftPotential: Type.Optional(u8("Tectonic uplift potential (0..255).")),
    riftPotential: Type.Optional(u8("Tectonic rift potential (0..255).")),
    tectonicStress: Type.Optional(u8("Tectonic stress (0..255).")),
    collisionPotential: Type.Optional(u8("Tectonic collision potential (0..255).")),
    seaIceCover: Type.Optional(u8("Cryosphere sea ice cover fraction (0..255).")),
    freezeIndex: Type.Optional(f32("Freeze persistence index (0..1).")),
  },
  { additionalProperties: false }
);

const MASK_OUTPUT_FIELDS = [
  // aquatic lanes
  "coastalWaterMask",
  "shelfMask",
  "warmShallowWaterMask",
  "coldProductiveWaterMask",
  "reefOrProtectedShallowsMask",
  "estuaryMask",
  "navigableRiverMouthMask",
  "lakeMask",
  "iceMask",
  // terrestrial lanes
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
  // cultivated lanes
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
  // geological lanes
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

export type HabitatMaskFieldName = (typeof MASK_OUTPUT_FIELDS)[number];

export { MASK_OUTPUT_FIELDS as HABITAT_MASK_FIELD_NAMES };

const maskOutputs = Object.fromEntries(
  MASK_OUTPUT_FIELDS.map((field) => [field, u8(`Derived habitat lane mask: ${field}.`)])
);

const PlanOutput = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    ...maskOutputs,
    aquaticIntensity: f32("Aquatic habitat intensity (0..1) modulating site selection."),
    cultivatedIntensity: f32("Cultivated habitat intensity (0..1) modulating site selection."),
    terrestrialIntensity: f32("Terrestrial habitat intensity (0..1) modulating site selection."),
    geologicalIntensity: f32("Geological habitat intensity (0..1) modulating site selection."),
  },
  { additionalProperties: false }
);

const DeriveHabitatFieldsContract = defineOp({
  kind: "plan",
  id: "resources/derive-habitat-fields",
  input: PlanInput,
  output: PlanOutput,
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default DeriveHabitatFieldsContract;
