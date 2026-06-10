import type {
  OfficialAgeType,
  OfficialResourceClassType,
  OfficialResourceCorpusArtifact,
  OfficialResourceCorpusEntry,
  OfficialResourceType,
  ResourceClassOverride,
  ResourceDistributionFacts,
  ResourcePlaceabilityStatus,
  ResourceStrategyRequiredStatus,
  ResourceYieldChange,
} from "./types.js";

const BASE_STANDARD_RESOURCE_FILES = [
  "Base/modules/base-standard/data/resources.xml",
  "Base/modules/base-standard/data/resources-v2.xml",
] as const;

const UNVERIFIED_RUNTIME_ID_RATIONALE =
  "Static base-standard Resources row; runtime GameInfo.Resources numeric id is not verified in this slice.";

type OfficialResourceRow = readonly [
  staticResourceRowSlot: number,
  resourceType: OfficialResourceType,
  sourceFile: string,
  name: string,
  tooltip: string,
  baseClass: OfficialResourceClassType,
  weight: number,
  validAges: readonly OfficialAgeType[],
  ageClassOverrides: readonly ResourceClassOverride[],
  validBiomeConstraintCount: number,
  yieldChanges: readonly ResourceYieldChange[],
  typeTags: readonly string[],
  distribution: ResourceDistributionFacts,
  placeabilityStatus: ResourcePlaceabilityStatus,
  strategyRequiredStatus: ResourceStrategyRequiredStatus,
];

const OFFICIAL_RESOURCE_ROWS = [
  [0, "RESOURCE_COTTON", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_COTTON_NAME", "LOC_ANT_RESOURCE_COTTON_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_FACTORY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 4, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], { staple: true }, "placeable", "required"],
  [1, "RESOURCE_DATES", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_DATES_NAME", "LOC_ANT_RESOURCE_DATES_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 2, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], [], {}, "placeable", "required"],
  [2, "RESOURCE_DYES", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_DYES_NAME", "LOC_ANT_RESOURCE_DYES_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 1, [{ YieldType: "YIELD_CULTURE", YieldChange: "1" }], [], { adjacentToLand: true }, "placeable", "required"],
  [3, "RESOURCE_FISH", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_FISH_NAME", "LOC_ANT_RESOURCE_FISH_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [], 1, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], [], { adjacentToLand: true }, "placeable", "required"],
  [4, "RESOURCE_GOLD", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_GOLD_NAME", "LOC_ANT_RESOURCE_GOLD_TOOLTIP", "RESOURCECLASS_EMPIRE", 20, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }], 3, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], { staple: true, minimumPerHemisphere: 8 }, "placeable", "required"],
  [5, "RESOURCE_GOLD_DISTANT_LANDS", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_GOLD_NAME", "LOC_ANT_RESOURCE_GOLD_DISTANT_LANDS_TOOLTIP", "RESOURCECLASS_EMPIRE", 25, [], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }], 0, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], {}, "conditional", "blocked"],
  [6, "RESOURCE_GYPSUM", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_GYPSUM_NAME", "LOC_ANT_RESOURCE_GYPSUM_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 3, [{ YieldType: "YIELD_SCIENCE", YieldChange: "1" }], [], {}, "placeable", "required"],
  [7, "RESOURCE_INCENSE", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_INCENSE_NAME", "LOC_ANT_RESOURCE_INCENSE_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 2, [{ YieldType: "YIELD_SCIENCE", YieldChange: "1" }], [], {}, "placeable", "required"],
  [8, "RESOURCE_IVORY", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_IVORY_NAME", "LOC_ANT_RESOURCE_IVORY_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_BONUS", sourceFile: "Base/modules/age-exploration/data/resources.xml" }, { age: "AGE_MODERN", resourceClass: "RESOURCECLASS_BONUS", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 8, [{ YieldType: "YIELD_CULTURE", YieldChange: "1" }], [], { unlocksCiv: true }, "placeable", "required"],
  [9, "RESOURCE_JADE", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_JADE_NAME", "LOC_ANT_RESOURCE_JADE_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 3, [{ YieldType: "YIELD_CULTURE", YieldChange: "1" }], [], { unlocksCiv: true }, "placeable", "required"],
  [10, "RESOURCE_KAOLIN", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_KAOLIN_NAME", "LOC_ANT_RESOURCE_KAOLIN_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_FACTORY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 3, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], [], { staple: true }, "placeable", "required"],
  [11, "RESOURCE_MARBLE", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_MARBLE_NAME", "LOC_ANT_RESOURCE_MARBLE_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_EMPIRE", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 3, [{ YieldType: "YIELD_CULTURE", YieldChange: "1" }], [], {}, "placeable", "required"],
  [12, "RESOURCE_PEARLS", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_PEARLS_NAME", "LOC_ANT_RESOURCE_PEARLS_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_CITY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 1, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], { adjacentToLand: true, unlocksCiv: true }, "placeable", "required"],
  [13, "RESOURCE_SILK", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_SILK_NAME", "LOC_ANT_RESOURCE_SILK_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_CITY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 4, [{ YieldType: "YIELD_CULTURE", YieldChange: "1" }], [], { unlocksCiv: true }, "placeable", "required"],
  [14, "RESOURCE_SILVER", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_SILVER_NAME", "LOC_ANT_RESOURCE_SILVER_TOOLTIP", "RESOURCECLASS_EMPIRE", 20, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }], 2, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], { staple: true, minimumPerHemisphere: 8 }, "placeable", "required"],
  [15, "RESOURCE_SILVER_DISTANT_LANDS", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_SILVER_NAME", "LOC_ANT_RESOURCE_SILVER_DISTANT_LANDS_TOOLTIP", "RESOURCECLASS_EMPIRE", 25, [], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }], 0, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], {}, "conditional", "blocked"],
  [16, "RESOURCE_WINE", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_WINE_NAME", "LOC_ANT_RESOURCE_WINE_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_BONUS", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 2, [{ YieldType: "YIELD_HAPPINESS", YieldChange: "1" }], [], { unlocksCiv: true }, "placeable", "required"],
  [17, "RESOURCE_CAMELS", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_CAMELS_NAME", "LOC_ANT_RESOURCE_CAMELS_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 4, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], { bonusResourceSlots: 2, unlocksCiv: true }, "placeable", "required"],
  [18, "RESOURCE_HIDES", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_HIDES_NAME", "LOC_ANT_RESOURCE_HIDES_TOOLTIP", "RESOURCECLASS_BONUS", 40, ["AGE_ANTIQUITY"], [], 6, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], {}, "placeable", "required"],
  [19, "RESOURCE_HORSES", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_HORSES_NAME", "LOC_ANT_RESOURCE_HORSES_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }, { age: "AGE_MODERN", resourceClass: "RESOURCECLASS_BONUS", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 2, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], { staple: true, unlocksCiv: true }, "placeable", "required"],
  [20, "RESOURCE_IRON", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_IRON_NAME", "LOC_ANT_RESOURCE_IRON_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 5, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], { staple: true, unlocksCiv: true }, "placeable", "required"],
  [21, "RESOURCE_SALT", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_SALT_NAME", "LOC_ANT_RESOURCE_SALT_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY"], [], 3, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], [], { unlocksCiv: true }, "placeable", "required"],
  [22, "RESOURCE_WOOL", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_WOOL_NAME", "LOC_ANT_RESOURCE_WOOL_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY"], [], 5, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], {}, "placeable", "required"],
  [23, "RESOURCE_LAPIS_LAZULI", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_LAPIS_LAZULI_NAME", "LOC_ANT_RESOURCE_LAPIS_LAZULI_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY"], [], 0, [], [], { tradeable: false }, "unknown", "blocked"],
  [24, "RESOURCE_COCOA", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_COCOA_NAME", "LOC_EXP_RESOURCE_COCOA_TOOLTIP", "RESOURCECLASS_EMPIRE", 5, ["AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }, { age: "AGE_MODERN", resourceClass: "RESOURCECLASS_FACTORY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 1, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], { minimumPerHemisphere: 8, hemisphereUnique: true }, "placeable", "required"],
  [25, "RESOURCE_FURS", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_FURS_NAME", "LOC_EXP_RESOURCE_FURS_TOOLTIP", "RESOURCECLASS_EMPIRE", 5, ["AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }, { age: "AGE_MODERN", resourceClass: "RESOURCECLASS_CITY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 3, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], {}, "placeable", "required"],
  [26, "RESOURCE_SPICES", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_SPICES_NAME", "LOC_EXP_RESOURCE_SPICES_TOOLTIP", "RESOURCECLASS_EMPIRE", 5, ["AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }, { age: "AGE_MODERN", resourceClass: "RESOURCECLASS_BONUS", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 2, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], { minimumPerHemisphere: 8, hemisphereUnique: true }, "placeable", "required"],
  [27, "RESOURCE_SUGAR", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_SUGAR_NAME", "LOC_EXP_RESOURCE_SUGAR_TOOLTIP", "RESOURCECLASS_EMPIRE", 5, ["AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }, { age: "AGE_MODERN", resourceClass: "RESOURCECLASS_BONUS", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 4, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], [], { minimumPerHemisphere: 8, hemisphereUnique: true }, "placeable", "required"],
  [28, "RESOURCE_TEA", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_TEA_NAME", "LOC_EXP_RESOURCE_TEA_TOOLTIP", "RESOURCECLASS_EMPIRE", 5, ["AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }, { age: "AGE_MODERN", resourceClass: "RESOURCECLASS_FACTORY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 3, [{ YieldType: "YIELD_SCIENCE", YieldChange: "1" }], [], { minimumPerHemisphere: 8, hemisphereUnique: true, unlocksCiv: true }, "placeable", "required"],
  [29, "RESOURCE_TRUFFLES", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_TRUFFLES_NAME", "LOC_EXP_RESOURCE_TRUFFLES_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_EXPLORATION", "AGE_MODERN"], [], 5, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], {}, "placeable", "required"],
  [30, "RESOURCE_NITER", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_NITER_NAME", "LOC_EXP_RESOURCE_NITER_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_EXPLORATION", "AGE_MODERN"], [], 10, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], { unlocksCiv: true }, "placeable", "required"],
  [31, "RESOURCE_CLOVES", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_CLOVES_NAME", "LOC_EXP_RESOURCE_CLOVES_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_EXPLORATION"], [], 0, [], [], { tradeable: false }, "unknown", "blocked"],
  [32, "RESOURCE_WHALES", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_WHALES_NAME", "LOC_EXP_RESOURCE_WHALES_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_EXPLORATION", "AGE_MODERN"], [], 1, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], { adjacentToLand: true, lakeEligible: false }, "placeable", "required"],
  [33, "RESOURCE_COFFEE", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_COFFEE_NAME", "LOC_MOD_RESOURCE_COFFEE_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_FACTORY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 6, [{ YieldType: "YIELD_SCIENCE", YieldChange: "1" }], [], { minimumPerHemisphere: 8 }, "placeable", "required"],
  [34, "RESOURCE_TOBACCO", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_TOBACCO_NAME", "LOC_MOD_RESOURCE_TOBACCO_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_CITY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 4, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], { minimumPerHemisphere: 8 }, "placeable", "required"],
  [35, "RESOURCE_CITRUS", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_CITRUS_NAME", "LOC_MOD_RESOURCE_CITRUS_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_FACTORY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 2, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], [], { minimumPerHemisphere: 8 }, "placeable", "required"],
  [36, "RESOURCE_COAL", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_COAL_NAME", "LOC_MOD_RESOURCE_COAL_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_MODERN"], [], 6, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], {}, "placeable", "required"],
  [37, "RESOURCE_NICKEL", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_NICKEL_NAME", "LOC_MOD_RESOURCE_NICKEL_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_MODERN"], [], 0, [], [], { tradeable: false }, "unknown", "blocked"],
  [38, "RESOURCE_OIL", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_OIL_NAME", "LOC_MOD_RESOURCE_OIL_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_MODERN"], [], 9, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], {}, "placeable", "required"],
  [39, "RESOURCE_QUININE", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_QUININE_NAME", "LOC_MOD_RESOURCE_QUININE_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_FACTORY", sourceFile: "Base/modules/age-modern/data/resources.xml" }], 2, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], [], { minimumPerHemisphere: 8 }, "placeable", "required"],
  [40, "RESOURCE_RUBBER", "Base/modules/base-standard/data/resources.xml", "LOC_RESOURCE_RUBBER_NAME", "LOC_MOD_RESOURCE_RUBBER_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_MODERN"], [], 2, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], {}, "placeable", "required"],
  [41, "RESOURCE_MANGOS", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_MANGOS_NAME", "LOC_ANT_RESOURCE_MANGOS_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 2, [{ YieldType: "YIELD_CULTURE", YieldChange: "1" }], [], {}, "placeable", "required"],
  [42, "RESOURCE_CLAY", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_CLAY_NAME", "LOC_ANT_RESOURCE_CLAY_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 5, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], {}, "placeable", "required"],
  [43, "RESOURCE_FLAX", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_FLAX_NAME", "LOC_ANT_RESOURCE_FLAX_TOOLTIP", "RESOURCECLASS_CITY", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_BONUS", sourceFile: "Base/modules/age-exploration/data/resources-v2.xml" }], 6, [{ YieldType: "YIELD_SCIENCE", YieldChange: "1" }], [], {}, "placeable", "required"],
  [44, "RESOURCE_RUBIES", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_RUBIES_NAME", "LOC_ANT_RESOURCE_RUBIES_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [{ age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources.xml" }, { age: "AGE_EXPLORATION", resourceClass: "RESOURCECLASS_TREASURE", sourceFile: "Base/modules/age-exploration/data/resources-v2.xml" }], 4, [{ YieldType: "YIELD_GOLD", YieldChange: "1" }], [], { staple: true }, "placeable", "required"],
  [45, "RESOURCE_RICE", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_RICE_NAME", "LOC_ANT_RESOURCE_RICE_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [], 3, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], [], {}, "placeable", "required"],
  [46, "RESOURCE_LIMESTONE", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_LIMESTONE_NAME", "LOC_ANT_RESOURCE_LIMESTONE_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [], 6, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], {}, "placeable", "required"],
  [47, "RESOURCE_TIN", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_TIN_NAME", "LOC_ANT_RESOURCE_TIN_TOOLTIP", "RESOURCECLASS_BONUS", 25, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [{ age: "AGE_MODERN", resourceClass: "RESOURCECLASS_FACTORY", sourceFile: "Base/modules/age-modern/data/resources-v2.xml" }], 4, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }], [], { staple: true }, "placeable", "required"],
  [48, "RESOURCE_LLAMAS", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_LLAMAS_NAME", "LOC_ANT_RESOURCE_LLAMAS_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [], 3, [{ YieldType: "YIELD_HAPPINESS", YieldChange: "1" }], [], {}, "placeable", "required"],
  [49, "RESOURCE_HARDWOOD", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_HARDWOOD_NAME", "LOC_ANT_RESOURCE_HARDWOOD_TOOLTIP", "RESOURCECLASS_EMPIRE", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [], 6, [{ YieldType: "YIELD_CULTURE", YieldChange: "1" }], [], {}, "placeable", "required"],
  [50, "RESOURCE_WILD_GAME", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_WILD_GAME_NAME", "LOC_ANT_RESOURCE_WILD_GAME_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 9, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], [], {}, "placeable", "required"],
  [51, "RESOURCE_CRABS", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_CRABS_NAME", "LOC_ANT_RESOURCE_CRABS_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [], 6, [{ YieldType: "YIELD_FOOD", YieldChange: "1" }], ["NAVIGABLE_RIVERS_ELIGIBLE", "IGNORES_WEIGHT_FOR_NAVIGABLE_RIVER_PLACEMENT"], { adjacentToLand: true }, "placeable", "required"],
  [52, "RESOURCE_COWRIE", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_COWRIE_NAME", "LOC_ANT_RESOURCE_COWRIE_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION", "AGE_MODERN"], [], 1, [{ YieldType: "YIELD_HAPPINESS", YieldChange: "1" }], [], { adjacentToLand: true, lakeEligible: false }, "placeable", "required"],
  [53, "RESOURCE_TURTLES", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_TURTLES_NAME", "LOC_ANT_RESOURCE_TURTLES_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_ANTIQUITY", "AGE_EXPLORATION"], [], 1, [{ YieldType: "YIELD_CULTURE", YieldChange: "1" }], [], { adjacentToLand: true, lakeEligible: false }, "placeable", "required"],
  [54, "RESOURCE_PITCH", "Base/modules/base-standard/data/resources-v2.xml", "LOC_RESOURCE_PITCH_NAME", "LOC_ANT_RESOURCE_PITCH_TOOLTIP", "RESOURCECLASS_BONUS", 10, ["AGE_EXPLORATION", "AGE_MODERN"], [], 3, [{ YieldType: "YIELD_PRODUCTION", YieldChange: "1" }, { YieldType: "YIELD_GOLD", YieldChange: "1" }], [], {}, "placeable", "required"],
] as const satisfies readonly OfficialResourceRow[];

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function dispositionRationale(status: ResourcePlaceabilityStatus | ResourceStrategyRequiredStatus): string {
  if (status === "required") return "Official map-placement constraints exist, so resource strategy coverage is required.";
  if (status === "blocked") {
    return "Strategy coverage is blocked until the no-biome-row resource receives a source-backed map-placement disposition.";
  }
  if (status === "placeable") return "Official Resource_ValidBiomes rows define map placement constraints.";
  if (status === "conditional") {
    return "Official Resources row exists, but no valid age or biome rows were found in the base-standard corpus files.";
  }
  return "No official Resource_ValidBiomes rows were found in the base-standard corpus files.";
}

function toEntry(row: OfficialResourceRow): OfficialResourceCorpusEntry {
  const [
    staticResourceRowSlot,
    resourceType,
    sourceFile,
    name,
    tooltip,
    baseClass,
    weight,
    validAges,
    ageClassOverrides,
    validBiomeConstraintCount,
    yieldChanges,
    typeTags,
    distribution,
    placeabilityStatus,
    strategyRequiredStatus,
  ] = row;

  return {
    resourceType,
    staticResourceRowSlot,
    staticSource: { file: sourceFile, table: "Resources" },
    name,
    tooltip,
    baseClass,
    weight,
    runtimeId: {
      status: "unverified",
      value: null,
      evidence: [],
      rationale: UNVERIFIED_RUNTIME_ID_RATIONALE,
    },
    validAges,
    ageClassOverrides,
    officialPlacementConstraints: {
      hasOfficialBiomeConstraints: validBiomeConstraintCount > 0,
      validBiomeConstraintCount,
      sourceTables:
        validBiomeConstraintCount > 0
          ? [{ file: sourceFile, table: "Resource_ValidBiomes" }]
          : [],
      placementFlags: distribution,
    },
    yieldChanges,
    typeTags,
    placeability: {
      status: placeabilityStatus,
      rationale: dispositionRationale(placeabilityStatus),
    },
    strategyRequired: {
      status: strategyRequiredStatus,
      rationale: dispositionRationale(strategyRequiredStatus),
    },
  };
}

export const OFFICIAL_RESOURCE_CORPUS = deepFreeze(OFFICIAL_RESOURCE_ROWS.map(toEntry));

export const OFFICIAL_RESOURCE_CORPUS_ARTIFACT = {
  source: {
    authority: "civ7-official-resources",
    module: "base-standard",
    order: "base-standard.modinfo Resources row order",
    runtimeIdStatus: "unverified",
    sourceFiles: BASE_STANDARD_RESOURCE_FILES,
  },
  resources: OFFICIAL_RESOURCE_CORPUS,
} as const satisfies OfficialResourceCorpusArtifact;

export const OFFICIAL_RESOURCE_TYPE_ORDER = deepFreeze(OFFICIAL_RESOURCE_CORPUS.map(
  (entry) => entry.resourceType
) as OfficialResourceType[]);

export const OFFICIAL_RESOURCE_BY_TYPE = deepFreeze(
  Object.fromEntries(OFFICIAL_RESOURCE_CORPUS.map((entry) => [entry.resourceType, entry]))
) as Readonly<Record<OfficialResourceType, OfficialResourceCorpusEntry>>;

deepFreeze(OFFICIAL_RESOURCE_CORPUS_ARTIFACT);
