import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanTerrestrialResourcesContract from "../contract.js";

type TerrestrialResourceType =
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

type MaskField =
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

type SuppressionField =
  | "coldMask"
  | "aridWithoutWaterMask"
  | "denseForestMask"
  | "cultivatedPressureMask";

type TerrestrialLaneId =
  | "arid-rangeland"
  | "open-grazing"
  | "highland-pastoral"
  | "savanna-megafauna"
  | "cold-boreal-furs"
  | "woodland-host"
  | "tropical-forest-product"
  | "diverse-wild-habitat"
  | "tropical-highland-pastoral";

type ResourceSignals = {
  readonly laneId: TerrestrialLaneId;
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

const TERRESTRIAL_RESOURCE_TYPES: readonly TerrestrialResourceType[] = [
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

export const TERRESTRIAL_SIGNALS: Record<TerrestrialResourceType, ResourceSignals> = {
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

export const defaultStrategy = createStrategy(PlanTerrestrialResourcesContract, "default", {
  run: (input) => {
    const size = validateGrid(input.width, input.height);
    const expectations = new Map(input.expectations.map((row) => [row.resourceType, row]));
    const plans = [];
    const missingResourceTypes: TerrestrialResourceType[] = [];

    for (const resourceType of TERRESTRIAL_RESOURCE_TYPES) {
      const signals = TERRESTRIAL_SIGNALS[resourceType];
      const expectation = expectations.get(resourceType);
      if (!expectation) {
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
          blockers: ["Missing terrestrial earthlike expectation row."],
          caveats: [],
        });
        continue;
      }

      if (expectation.status === "blocked") {
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

      const signalFields = presentFields(input, signals.primary);
      const eligibleTileCount = countEligibleTiles(input, size, signals);
      const proxyIncomplete = signalFields.length === 0;
      const targetIntentCount = proxyIncomplete
        ? 0
        : Math.min(
            expectation.expectedCountRange.max,
            eligibleTileCount,
            expectation.expectedCountRange.target
          );
      const blockers = [];
      if (proxyIncomplete) {
        blockers.push(`Missing terrestrial signal masks: ${signals.primary.join(", ")}.`);
      }
      if (!proxyIncomplete && eligibleTileCount === 0) {
        blockers.push(
          "No eligible terrestrial tiles observed for this resource under supplied masks."
        );
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
      groupId: "terrestrial-animal-forest-wild" as const,
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
    throw new Error(
      `Invalid grid dimensions for terrestrial resource planning: ${width}x${height}.`
    );
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

function readMask(
  input: Record<string, unknown>,
  field: string,
  size: number
): Uint8Array | undefined {
  const value = input[field];
  if (value === undefined) return undefined;
  if (!(value instanceof Uint8Array)) {
    throw new Error(`Terrestrial resource mask ${field} must be a Uint8Array.`);
  }
  if (value.length !== size) {
    throw new Error(
      `Terrestrial resource mask ${field} length ${value.length} does not match grid size ${size}.`
    );
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
