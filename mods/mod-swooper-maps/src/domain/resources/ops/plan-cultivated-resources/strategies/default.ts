import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanCultivatedResourcesContract from "../contract.js";

type CultivatedResourceType =
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

type MaskField =
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

type SuppressionField = "coldMask" | "aridWithoutWaterMask" | "waterloggedMask";

type ResourceSignals = {
  readonly laneId:
    | "alluvial-irrigated"
    | "arid-oasis-resin"
    | "marine-dye"
    | "temperate-field-orchard"
    | "humid-tropical-plantation"
    | "highland-medicinal"
    | "wetland-paddy"
    | "blocked-no-valid-biome";
  readonly primary: readonly MaskField[];
  readonly suppress: readonly SuppressionField[];
};

const DEFAULT_RANGE = {
  baseline: "standard-earthlike-map" as const,
  min: 0,
  target: 0,
  max: 0,
  evidence: "blocked" as const,
};

const CULTIVATED_RESOURCE_TYPES: readonly CultivatedResourceType[] = [
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

export const CULTIVATED_SIGNALS: Record<CultivatedResourceType, ResourceSignals> = {
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

export const defaultStrategy = createStrategy(PlanCultivatedResourcesContract, "default", {
  run: (input) => {
    const size = validateGrid(input.width, input.height);
    const expectations = new Map(input.expectations.map((row) => [row.resourceType, row]));
    const plans = [];
    const missingResourceTypes: CultivatedResourceType[] = [];

    for (const resourceType of CULTIVATED_RESOURCE_TYPES) {
      const expectation = expectations.get(resourceType);
      if (!expectation) {
        const signals = CULTIVATED_SIGNALS[resourceType];
        missingResourceTypes.push(resourceType);
        plans.push({
          resourceType,
          laneId: signals.laneId,
          status: "missing-expectation" as const,
          eligibilityStatus: "missing-expectation" as const,
          expectedCountRange: DEFAULT_RANGE,
          targetIntentCount: 0,
          eligibleTileCount: 0,
          rangeStatus: "not-gated" as const,
          proofStatus: "warning-only" as const,
          runtimeIdStatus: "unverified" as const,
          earthlikePredicate: "",
          conditionMultipliers: [],
          proxyRequirements: [],
          signalFields: [],
          blockers: ["Missing cultivated earthlike expectation row."],
          caveats: [],
        });
        continue;
      }

      if (expectation.status === "blocked") {
        const signals = CULTIVATED_SIGNALS[resourceType];
        plans.push({
          resourceType,
          laneId: signals.laneId,
          status: "blocked" as const,
          eligibilityStatus: "blocked" as const,
          expectedCountRange: expectation.expectedCountRange,
          targetIntentCount: 0,
          eligibleTileCount: 0,
          rangeStatus: "not-gated" as const,
          proofStatus: "warning-only" as const,
          runtimeIdStatus: "unverified" as const,
          earthlikePredicate: expectation.earthlikePredicate,
          conditionMultipliers: [...expectation.conditionMultipliers],
          proxyRequirements: [...expectation.proxyRequirements],
          signalFields: [],
          blockers: ["Expectation row is blocked by official corpus disposition."],
          caveats: [...expectation.caveats],
        });
        continue;
      }

      const signals = CULTIVATED_SIGNALS[resourceType];
      const signalFields = presentFields(input, signals.primary);
      const eligibleTileCount = countEligibleTiles(input, size, signals);
      const proxyIncomplete = signalFields.length === 0;
      const targetIntentCount = proxyIncomplete
        ? 0
        : Math.min(expectation.expectedCountRange.max, eligibleTileCount, expectation.expectedCountRange.target);
      const blockers = [];
      if (proxyIncomplete) {
        blockers.push(`Missing cultivated signal masks: ${signals.primary.join(", ")}.`);
      }
      if (!proxyIncomplete && eligibleTileCount === 0) {
        blockers.push("No eligible cultivated tiles observed for this resource under supplied masks.");
      }

      plans.push({
        resourceType,
        laneId: signals.laneId,
        status: proxyIncomplete ? ("proxy-gap" as const) : ("planned" as const),
        eligibilityStatus: proxyIncomplete ? ("proxy-incomplete" as const) : ("observed" as const),
        expectedCountRange: expectation.expectedCountRange,
        targetIntentCount,
        eligibleTileCount,
        rangeStatus: proxyIncomplete
          ? ("not-gated" as const)
          : compareRange(targetIntentCount, expectation.expectedCountRange),
        proofStatus: "warning-only" as const,
        runtimeIdStatus: "unverified" as const,
        earthlikePredicate: expectation.earthlikePredicate,
        conditionMultipliers: [...expectation.conditionMultipliers],
        proxyRequirements: [...expectation.proxyRequirements],
        signalFields,
        blockers,
        caveats: [...expectation.caveats],
      });
    }

    return {
      groupId: "cultivated-plantation-medicinal" as const,
      runtimeIdStatus: "unverified" as const,
      proofStatus: "warning-only" as const,
      plans,
      missingResourceTypes,
    };
  },
});

function validateGrid(width: number, height: number): number {
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new Error(`Invalid grid dimensions for cultivated resource planning: ${width}x${height}.`);
  }
  return size;
}

function presentFields(input: Record<string, unknown>, fields: readonly MaskField[]): string[] {
  return fields.filter((field) => input[field] !== undefined);
}

function countEligibleTiles(
  input: Record<string, unknown>,
  size: number,
  signals: ResourceSignals
): number {
  const primaryMasks = signals.primary
    .map((field) => ({ field, mask: readMask(input, field, size) }))
    .filter((entry): entry is { field: MaskField; mask: Uint8Array } => entry.mask !== undefined);
  if (primaryMasks.length === 0) return 0;

  const suppressMasks = signals.suppress
    .map((field) => readMask(input, field, size))
    .filter((mask): mask is Uint8Array => mask !== undefined);

  let count = 0;
  for (let i = 0; i < size; i++) {
    if (!primaryMasks.some(({ mask }) => mask[i] !== 0)) continue;
    if (suppressMasks.some((mask) => mask[i] !== 0)) continue;
    count += 1;
  }
  return count;
}

function readMask(input: Record<string, unknown>, field: string, size: number): Uint8Array | undefined {
  const value = input[field];
  if (value === undefined) return undefined;
  if (!(value instanceof Uint8Array)) {
    throw new Error(`Cultivated resource mask ${field} must be a Uint8Array.`);
  }
  if (value.length !== size) {
    throw new Error(`Cultivated resource mask ${field} length ${value.length} does not match grid size ${size}.`);
  }
  return value;
}

function compareRange(
  count: number,
  range: { readonly min: number; readonly max: number }
): "within-range" | "below-range" | "above-range" {
  if (count < range.min) return "below-range";
  if (count > range.max) return "above-range";
  return "within-range";
}
