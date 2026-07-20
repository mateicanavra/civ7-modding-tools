import {
  OFFICIAL_RESOURCE_BY_TYPE,
  OFFICIAL_RESOURCE_CORPUS,
  type OfficialResourceType,
} from "@civ7/map-policy";
import { getInitialMapResourcePolicyForType } from "../../policy/initial-map-authoring.js";
import type {
  EarthlikeResourceExpectation,
  EarthlikeResourceExpectationsArtifact,
  ResourceExpectationEvidence,
  ResourceExpectationGroupId,
  ResourceExpectationRangeEvidence,
  ResourceExpectationStatus,
} from "./types.js";

const BASELINE = "standard-earthlike-map" as const;
const BLOCKED_ROW_TYPES = new Set<OfficialResourceType>([
  "RESOURCE_GOLD_DISTANT_LANDS",
  "RESOURCE_SILVER_DISTANT_LANDS",
  "RESOURCE_LAPIS_LAZULI",
  "RESOURCE_CLOVES",
  "RESOURCE_NICKEL",
]);

type ExpectationDefinition = {
  readonly resourceType: OfficialResourceType;
  readonly groupId: ResourceExpectationGroupId;
  readonly earthlikePredicate: string;
  readonly range: readonly [min: number, target: number, max: number];
  readonly rangeEvidence?: ResourceExpectationRangeEvidence;
  readonly conditionMultipliers: readonly string[];
  readonly scarcityClass: string;
  readonly habitatEvidence?: ResourceExpectationEvidence["habitat"];
  readonly rangeStrength?: ResourceExpectationEvidence["range"];
  readonly signalRequirements?: readonly string[];
  readonly caveats?: readonly string[];
};

const DEFINITIONS = [
  def(
    "RESOURCE_FISH",
    "aquatic-coastal-navigable-river",
    "Broad coastal shelf, estuary, and upwelling fishery.",
    [6, 9, 12],
    ["eligible coast/shelf up", "upwelling/estuary up", "ice/deep-ocean/lakes down"],
    "common"
  ),
  def(
    "RESOURCE_PEARLS",
    "aquatic-coastal-navigable-river",
    "Warm shallow protected coast, reef, lagoon, and shelf.",
    [2, 3, 5],
    ["tropical/subtropical reef up", "temperate/cold down", "no warm coast zero"],
    "scarce"
  ),
  def(
    "RESOURCE_WHALES",
    "aquatic-coastal-navigable-river",
    "Productive cold or temperate coastal shelf, upwelling, banks, and migration corridors.",
    [1, 2, 3],
    ["cold/temperate shelf up", "large oceans up", "tropical abundance down", "lakes zero"],
    "rare signature"
  ),
  def(
    "RESOURCE_CRABS",
    "aquatic-coastal-navigable-river",
    "Estuary, delta, brackish bay, shallow coast, and navigable river mouth or floodplain.",
    [4, 7, 10],
    ["estuaries/navigable rivers up", "seagrass/warm shallows up", "cold/deep/open coast down"],
    "common local",
    { signalRequirements: ["navigable-river mouth or floodplain signal"] }
  ),
  def(
    "RESOURCE_COWRIE",
    "aquatic-coastal-navigable-river",
    "Warm tropical reef, rock, coral coast, and protected shallows.",
    [1, 2, 4],
    ["tropical reef/island chains up", "temperate down", "lakes/cold zero"],
    "scarce local"
  ),
  def(
    "RESOURCE_TURTLES",
    "aquatic-coastal-navigable-river",
    "Warm tropical or subtropical coast with nesting beach, seagrass, and reef habitat.",
    [1, 2, 3],
    [
      "tropical/subtropical shallows up",
      "seagrass/reef/islands up",
      "cold/open/deep down",
      "lakes zero",
    ],
    "rare signature"
  ),

  def(
    "RESOURCE_COTTON",
    "cultivated-plantation-medicinal",
    "Warm frost-free alluvial or irrigated cotton belt.",
    [6, 8, 12],
    ["floodplain/river up", "warm grass/plains up", "cold down", "desert only with water"],
    "common"
  ),
  def(
    "RESOURCE_DATES",
    "cultivated-plantation-medicinal",
    "Hot arid oasis or groundwater-fed desert palm.",
    [2, 3, 5],
    ["oasis/desert water up", "humid/cold zero"],
    "scarce local"
  ),
  def(
    "RESOURCE_DYES",
    "cultivated-plantation-medicinal",
    "Coastal biological dye source under official marine/coast rules.",
    [2, 3, 5],
    ["warm coast/islands up", "inland zero"],
    "scarce coastal",
    { signalRequirements: ["marine/coast lane despite cultivated group"] }
  ),
  def(
    "RESOURCE_INCENSE",
    "cultivated-plantation-medicinal",
    "Arid dry woodland or desert-edge incense resin habitat.",
    [2, 3, 5],
    ["savanna/desert dry woodland up", "humid/cold down"],
    "scarce"
  ),
  def(
    "RESOURCE_SILK",
    "cultivated-plantation-medicinal",
    "Warm temperate or subtropical sericulture and mulberry alluvial zone.",
    [4, 6, 8],
    ["river/floodplain up", "humid grass/plains up", "arid/cold down"],
    "moderate"
  ),
  def(
    "RESOURCE_WINE",
    "cultivated-plantation-medicinal",
    "Sunny temperate to subtropical dry-season viticulture.",
    [4, 6, 8],
    ["grass/plains up", "dry-summer up", "humid tropics down", "frost down"],
    "moderate"
  ),
  def(
    "RESOURCE_COCOA",
    "cultivated-plantation-medicinal",
    "Humid tropical shaded forest plantation.",
    [8, 10, 12],
    ["rainforest/wet tropics up", "arid/cold zero"],
    "regional abundant"
  ),
  def(
    "RESOURCE_SPICES",
    "cultivated-plantation-medicinal",
    "Humid forest spice belt in tropical or subtropical conditions.",
    [8, 10, 12],
    ["rainforest/forest up", "wet tropics up", "dry plains down"],
    "regional abundant"
  ),
  def(
    "RESOURCE_SUGAR",
    "cultivated-plantation-medicinal",
    "Warm wet alluvial tropics or subtropics.",
    [8, 10, 12],
    ["floodplain/river/wet tropics up", "arid without irrigation zero", "cold zero"],
    "regional abundant"
  ),
  def(
    "RESOURCE_TEA",
    "cultivated-plantation-medicinal",
    "Humid acidic upland or cool subtropical tea zone.",
    [8, 10, 12],
    ["hills up", "wet/cool up", "arid/desert zero"],
    "regional abundant",
    { signalRequirements: ["highland or relief signal"] }
  ),
  def(
    "RESOURCE_COFFEE",
    "cultivated-plantation-medicinal",
    "Humid tropical or subtropical highland or shaded tropical coffee belt.",
    [16, 18, 20],
    ["tropical/hills/forest up", "arid/cold zero"],
    "common anchored",
    { signalRequirements: ["highland or relief signal"] }
  ),
  def(
    "RESOURCE_TOBACCO",
    "cultivated-plantation-medicinal",
    "Frost-free warm drained soils with drier ripening window.",
    [16, 18, 20],
    ["grass/plains up", "savanna/forest up", "waterlogging/excess rain down"],
    "common anchored"
  ),
  def(
    "RESOURCE_CITRUS",
    "cultivated-plantation-medicinal",
    "Subtropical or tropical sunny orchard, frost-limited and well-drained.",
    [16, 18, 20],
    ["warm grass/plains up", "alluvial up", "frost zero", "severe arid down unless irrigated"],
    "common anchored"
  ),
  def(
    "RESOURCE_QUININE",
    "cultivated-plantation-medicinal",
    "Humid tropical montane medicinal bark constrained to official forest/savanna lanes.",
    [16, 18, 20],
    ["wet forest/highland signal up", "arid/desert zero"],
    "common anchored ecology-constrained",
    { signalRequirements: ["highland or relief signal"] }
  ),
  def(
    "RESOURCE_MANGOS",
    "cultivated-plantation-medicinal",
    "Tropical or subtropical frost-free fruit belt, often monsoonal.",
    [3, 5, 7],
    ["tropical up", "rainforest up", "cold zero", "excessive wet at flowering slightly down"],
    "moderate tropical"
  ),
  def(
    "RESOURCE_RICE",
    "cultivated-plantation-medicinal",
    "Wetland, paddy, delta, marsh, and monsoon lowland.",
    [4, 6, 8],
    ["marsh/mangrove/river/floodplain up", "arid without water zero"],
    "moderate common"
  ),
  def(
    "RESOURCE_CLOVES",
    "cultivated-plantation-medicinal",
    "Blocked: no official valid biome row in the current corpus.",
    [0, 0, 0],
    [],
    "blocked rare",
    blockedOptions()
  ),
  def(
    "RESOURCE_FLAX",
    "cultivated-plantation-medicinal",
    "Cool-temperate to mild subtropical flax on well-drained loam.",
    [5, 7, 9],
    ["grass/plains up", "cool/mild up", "tropical wet/heat down"],
    "moderate"
  ),

  def(
    "RESOURCE_CAMELS",
    "terrestrial-animal-forest-wild",
    "Arid plains/desert rangeland, sparse vegetation, and dryland corridors.",
    [2, 3, 5],
    ["arid/desert/plains up", "humid/forest/cold down"],
    "uncommon regional"
  ),
  def(
    "RESOURCE_HIDES",
    "terrestrial-animal-forest-wild",
    "Broad grazing or wild-herbivore byproduct on open rangeland and cold-edge habitat.",
    [8, 11, 14],
    ["grass/plains/tundra up", "dense tropical/closed forest down"],
    "common"
  ),
  def(
    "RESOURCE_HORSES",
    "terrestrial-animal-forest-wild",
    "Open temperate grassland/plains, steppe-like pasture, and low tree cover.",
    [4, 6, 8],
    ["grass/plains up", "high forest/desert/tundra down"],
    "standard strategic"
  ),
  def(
    "RESOURCE_WOOL",
    "terrestrial-animal-forest-wild",
    "Hill or highland pastoral terrain with sheep/goat-compatible grazing.",
    [4, 6, 8],
    ["hills/highlands/arid/tundra up", "flat wet lowlands down"],
    "standard"
  ),
  def(
    "RESOURCE_IVORY",
    "terrestrial-animal-forest-wild",
    "Savanna, wooded savanna, tropical forest edge, and watering-hole/desert-edge megafauna habitat.",
    [2, 3, 5],
    ["savanna/tropical/watering-hole up", "cold/highland down"],
    "rare regional"
  ),
  def(
    "RESOURCE_FURS",
    "terrestrial-animal-forest-wild",
    "Cold or boreal forest, taiga, woodland edge, and small patchy pockets.",
    [2, 3, 5],
    ["taiga/tundra up", "savanna woodland up", "open tropical/grass down"],
    "rare patchy"
  ),
  def(
    "RESOURCE_TRUFFLES",
    "terrestrial-animal-forest-wild",
    "Moist woodland-edge or host-tree signal on legal grass/plains/tundra wet soils.",
    [2, 3, 5],
    ["moist wooded edge/grass hills up", "arid/cold down"],
    "uncommon patchy",
    { signalRequirements: ["woodland or host-tree signal"] }
  ),
  def(
    "RESOURCE_RUBBER",
    "terrestrial-animal-forest-wild",
    "Humid tropical forest/rainforest, lowland high-rainfall forest product.",
    [2, 3, 4],
    ["tropical rainforest/forest up", "arid/cold/no tropics down"],
    "rare modern"
  ),
  def(
    "RESOURCE_HARDWOOD",
    "terrestrial-animal-forest-wild",
    "Legal productive forest: tropical/mangrove hardwood or official tundra/taiga-bog forest analog.",
    [4, 6, 8],
    ["tropical forest/mangrove up", "tundra forest analog up", "open plains/grass down"],
    "standard forest",
    { caveats: ["Do not broaden to temperate forests without official or runtime proof."] }
  ),
  def(
    "RESOURCE_WILD_GAME",
    "terrestrial-animal-forest-wild",
    "Diverse natural habitat, forest/grassland/tundra/marsh edge, and low cultivation pressure.",
    [6, 8, 10],
    ["high habitat diversity up", "monoclimatic/cultivated down"],
    "common natural"
  ),
  def(
    "RESOURCE_LLAMAS",
    "terrestrial-animal-forest-wild",
    "Legal tropical hill/highland pastoral candidates, preferring hill/highland over rainforest lowland.",
    [1, 2, 4],
    ["tropical hills/highlands up", "lowland tropical down", "no tropical legal tiles zero"],
    "rare regional",
    { signalRequirements: ["tropical hill or highland candidate histogram"] }
  ),

  def(
    "RESOURCE_GOLD",
    "geological-mineral-gemstone-industrial",
    "Hydrothermal, orogenic, and epithermal lodes; placer only with alluvial signal.",
    [16, 18, 20],
    ["hills/orogen up", "alluvial up", "outside official hills zero"],
    "common anchored",
    { signalRequirements: ["orogeny or alluvial signal"] }
  ),
  def(
    "RESOURCE_GOLD_DISTANT_LANDS",
    "geological-mineral-gemstone-industrial",
    "Blocked: distant-lands treasure derivative lacks active official placement constraints.",
    [0, 0, 0],
    [],
    "blocked",
    blockedOptions()
  ),
  def(
    "RESOURCE_SILVER",
    "geological-mineral-gemstone-industrial",
    "Hydrothermal, SEDEX/lithogene, and epithermal exposed cold/arid hills.",
    [16, 18, 20],
    ["tundra/desert hills up", "orogen up", "flat zero"],
    "common anchored",
    { signalRequirements: ["orogeny signal"] }
  ),
  def(
    "RESOURCE_SILVER_DISTANT_LANDS",
    "geological-mineral-gemstone-industrial",
    "Blocked: distant-lands treasure derivative lacks active official placement constraints.",
    [0, 0, 0],
    [],
    "blocked",
    blockedOptions()
  ),
  def(
    "RESOURCE_GYPSUM",
    "geological-mineral-gemstone-industrial",
    "Evaporite basin, playa, and arid or semiarid sedimentary basin.",
    [4, 6, 8],
    ["evaporite/sedimentary basin up", "desert up", "wet down"],
    "moderate",
    { signalRequirements: ["evaporite or sedimentary basin signal"] }
  ),
  def(
    "RESOURCE_JADE",
    "geological-mineral-gemstone-industrial",
    "Metamorphic, subduction, and serpentinite jade, often drainage-adjacent.",
    [2, 3, 5],
    ["ultramafic/orogen up", "tropical/tundra drainage up", "no geology down"],
    "rare",
    { signalRequirements: ["ultramafic or orogeny signal"] }
  ),
  def(
    "RESOURCE_KAOLIN",
    "geological-mineral-gemstone-industrial",
    "Intense weathering, hydrothermal alteration, and wet clay-rich flats.",
    [6, 8, 10],
    ["wetlands up", "tropical weathering up", "arid non-oasis down"],
    "common",
    { signalRequirements: ["weathering or clay-flat signal"] }
  ),
  def(
    "RESOURCE_MARBLE",
    "geological-mineral-gemstone-industrial",
    "Metamorphosed limestone/carbonate belts near orogeny or contact metamorphism.",
    [4, 6, 8],
    ["carbonate plus orogen up", "hills up", "no carbonate down"],
    "moderate",
    { signalRequirements: ["carbonate belt signal"] }
  ),
  def(
    "RESOURCE_IRON",
    "geological-mineral-gemstone-industrial",
    "BIF, skarn, magmatic, or hydrothermal iron in hills, cratons, and mountain belts.",
    [8, 11, 14],
    ["hills up", "craton/orogen up", "flat zero"],
    "common strategic",
    { signalRequirements: ["craton or orogeny signal"] }
  ),
  def(
    "RESOURCE_SALT",
    "geological-mineral-gemstone-industrial",
    "Halite/evaporite flats, arid closed basins, and salt pans.",
    [5, 7, 9],
    ["desert/evaporite basin up", "coastal land-flat salt pan up", "humid down"],
    "moderate",
    { signalRequirements: ["closed basin or evaporite signal"] }
  ),
  def(
    "RESOURCE_LAPIS_LAZULI",
    "geological-mineral-gemstone-industrial",
    "Blocked: no official valid biome row in the current corpus.",
    [0, 0, 0],
    [],
    "blocked very rare",
    blockedOptions()
  ),
  def(
    "RESOURCE_NITER",
    "geological-mineral-gemstone-industrial",
    "Nitrate salts in arid soils/playas; cave or soil nitrate abstracted to flats.",
    [6, 8, 10],
    ["desert/closed basin up", "floodplain up", "humid down"],
    "moderate",
    { signalRequirements: ["closed basin or arid soil signal"] }
  ),
  def(
    "RESOURCE_COAL",
    "geological-mineral-gemstone-industrial",
    "Ancient peat-swamp sedimentary basins and buried forest/wetland basins.",
    [6, 8, 10],
    ["sedimentary basin up", "forest/wetland up", "desert only with basin"],
    "common modern",
    { signalRequirements: ["sedimentary basin signal"] }
  ),
  def(
    "RESOURCE_NICKEL",
    "geological-mineral-gemstone-industrial",
    "Blocked: no official valid biome row in the current corpus.",
    [0, 0, 0],
    [],
    "blocked rare",
    blockedOptions()
  ),
  def(
    "RESOURCE_OIL",
    "geological-mineral-gemstone-industrial",
    "Petroleum system in sedimentary basin: source, reservoir, seal, and trap.",
    [5, 7, 9],
    ["sedimentary basin up", "desert/tundra/wetland basin up", "offshore zero unless authorized"],
    "moderate modern",
    { signalRequirements: ["sedimentary basin or hydrocarbon basin signal"] }
  ),
  def(
    "RESOURCE_CLAY",
    "geological-mineral-gemstone-industrial",
    "Near-surface clay minerals in soils, sediments, water-contact, and weathering zones.",
    [6, 8, 10],
    ["wet/alluvial up", "tropical weathering up", "no wet/alluvial feature zero"],
    "common"
  ),
  def(
    "RESOURCE_LIMESTONE",
    "geological-mineral-gemstone-industrial",
    "Marine carbonate sedimentary deposits, karst, and carbonate platforms.",
    [6, 9, 12],
    ["carbonate basin up", "hills/exposure up", "igneous terrain down"],
    "common industrial",
    { signalRequirements: ["carbonate basin signal"] }
  ),
  def(
    "RESOURCE_TIN",
    "geological-mineral-gemstone-industrial",
    "Cassiterite greisen/granite lodes plus river or valley placers.",
    [8, 11, 14],
    ["granite/orogen up", "tropical/alluvial up", "no granite/placer down"],
    "moderate gameplay-common",
    { signalRequirements: ["granite, orogeny, or placer signal"] }
  ),
  def(
    "RESOURCE_PITCH",
    "geological-mineral-gemstone-industrial",
    "Bitumen/asphaltum seeps, shallow tar sands, and hydrocarbon basin edge.",
    [3, 4, 6],
    ["hydrocarbon basin up", "near oil up", "no basin down"],
    "scarce",
    { signalRequirements: ["hydrocarbon basin signal"] }
  ),
  def(
    "RESOURCE_RUBIES",
    "geological-mineral-gemstone-industrial",
    "Corundum in marble/metamorphic belts; basalt-hosted or placer only with source signal.",
    [3, 4, 6],
    ["marble/metamorphic up", "tropical collision belt up", "flat tropical requires source"],
    "rare luxury",
    { signalRequirements: ["metamorphic, marble, or collision-belt signal"] }
  ),
] as const satisfies readonly ExpectationDefinition[];

function def(
  resourceType: OfficialResourceType,
  groupId: ResourceExpectationGroupId,
  earthlikePredicate: string,
  range: readonly [number, number, number],
  conditionMultipliers: readonly string[],
  scarcityClass: string,
  options: Partial<
    Omit<
      ExpectationDefinition,
      | "resourceType"
      | "groupId"
      | "earthlikePredicate"
      | "range"
      | "conditionMultipliers"
      | "scarcityClass"
    >
  > = {}
): ExpectationDefinition {
  return {
    resourceType,
    groupId,
    earthlikePredicate,
    range,
    conditionMultipliers,
    scarcityClass,
    ...options,
  };
}

function blockedOptions(): Partial<ExpectationDefinition> {
  return {
    rangeEvidence: "blocked",
    habitatEvidence: "official",
    rangeStrength: "official",
    caveats: [
      "Active expectation range remains zero until source-backed placement disposition changes.",
    ],
  };
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function toExpectation(definition: ExpectationDefinition): EarthlikeResourceExpectation {
  const corpusEntry = OFFICIAL_RESOURCE_BY_TYPE[definition.resourceType];
  if (!corpusEntry)
    throw new Error(`Missing resource corpus entry for ${definition.resourceType}.`);
  const initialMapPolicy = getInitialMapResourcePolicyForType(definition.resourceType);
  if (!initialMapPolicy) {
    throw new Error(
      `Missing initial map resource authoring policy for ${definition.resourceType}.`
    );
  }

  const corpusBlocked = BLOCKED_ROW_TYPES.has(definition.resourceType);
  const status: ResourceExpectationStatus = corpusBlocked ? "blocked" : "expected";
  const [min, target, max] = corpusBlocked ? [0, 0, 0] : definition.range;
  const rangeEvidence = corpusBlocked
    ? "blocked"
    : (definition.rangeEvidence ?? "inference-backed");

  if ((corpusEntry.placeability.status === "placeable") === corpusBlocked) {
    throw new Error(`Blocked resource expectation drift for ${definition.resourceType}.`);
  }

  return {
    resourceType: definition.resourceType,
    groupId: definition.groupId,
    status,
    initialMapAuthoring: {
      authoringAge: initialMapPolicy.authoringAge,
      status: initialMapPolicy.status,
      rationale: initialMapPolicy.rationale,
    },
    eligibleAges: corpusEntry.validAges,
    officialConstraintSummary: corpusEntry.officialPlacementConstraints,
    earthlikePredicate: definition.earthlikePredicate,
    expectedCountRange: {
      baseline: BASELINE,
      min,
      target,
      max,
      evidence: rangeEvidence,
    },
    conditionMultipliers: corpusBlocked ? [] : definition.conditionMultipliers,
    scarcityClass: definition.scarcityClass,
    operationObligation:
      status === "blocked"
        ? "Keep visible as blocked; do not place until source-backed disposition changes."
        : "Future resource operation must satisfy this per-resource expectation before claiming coverage.",
    statsProof:
      status === "blocked"
        ? "Stats must report zero active expectation and preserve blocked disposition."
        : "Seed-matrix or in-game telemetry must compare placed counts against eligible-tile denominators before hard closure.",
    evidenceStrength: {
      legality: "official",
      habitat: definition.habitatEvidence ?? "external",
      range: definition.rangeStrength ?? (rangeEvidence === "blocked" ? "official" : "inferred"),
    },
    signalRequirements: definition.signalRequirements ?? [],
    caveats: [
      ...(definition.caveats ?? []),
      ...(corpusEntry.typeTags.length > 0
        ? [`Official type tags: ${corpusEntry.typeTags.join(", ")}.`]
        : []),
    ],
  };
}

const DEFINITIONS_BY_TYPE = new Map(
  DEFINITIONS.map((definition) => [definition.resourceType, definition])
);

/**
 * Frozen expectation row for every entry in the official resource corpus, in corpus order.
 * Construction fails when a definition is missing, and the module-level parity checks reject
 * duplicate or incomplete coverage before planners can consume it.
 */
export const EARTHLIKE_RESOURCE_EXPECTATIONS = deepFreeze(
  OFFICIAL_RESOURCE_CORPUS.map((entry) => {
    const definition = DEFINITIONS_BY_TYPE.get(entry.resourceType);
    if (!definition) {
      throw new Error(`Missing earthlike expectation definition for ${entry.resourceType}.`);
    }
    return toExpectation(definition);
  })
);

/**
 * Immutable payload published as the Resources expectation artifact. It couples corpus-complete
 * rows to their authority, baseline, and runtime-calibrated hard-count evidence disposition.
 */
export const EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT = deepFreeze({
  source: {
    authority: "resource-earthlike-expectations",
    artifactId: "artifact:resources.earthlikeExpectations",
    baseline: BASELINE,
    hardCountGateEvidence: "runtime-calibrated",
  },
  resources: EARTHLIKE_RESOURCE_EXPECTATIONS,
} as const satisfies EarthlikeResourceExpectationsArtifact);

const definitionTypes = new Set(DEFINITIONS.map((entry) => entry.resourceType));
if (definitionTypes.size !== DEFINITIONS.length) {
  throw new Error("Duplicate resource earthlike expectations.");
}
if (EARTHLIKE_RESOURCE_EXPECTATIONS.length !== OFFICIAL_RESOURCE_CORPUS.length) {
  throw new Error("Resource earthlike expectations must cover the official corpus.");
}
for (const corpusEntry of OFFICIAL_RESOURCE_CORPUS) {
  if (!definitionTypes.has(corpusEntry.resourceType)) {
    throw new Error(`Missing earthlike expectation for ${corpusEntry.resourceType}.`);
  }
}
