import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanAquaticResourcesContract from "../contract.js";

type AquaticResourceType =
  | "RESOURCE_FISH"
  | "RESOURCE_PEARLS"
  | "RESOURCE_WHALES"
  | "RESOURCE_CRABS"
  | "RESOURCE_COWRIE"
  | "RESOURCE_TURTLES";

type MaskField =
  | "coastalWaterMask"
  | "shelfMask"
  | "warmShallowWaterMask"
  | "coldProductiveWaterMask"
  | "reefOrProtectedShallowsMask"
  | "estuaryMask"
  | "navigableRiverMouthMask";

type SuppressionField = "lakeMask" | "iceMask";

type ResourceSignals = {
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

const AQUATIC_RESOURCE_TYPES: readonly AquaticResourceType[] = [
  "RESOURCE_FISH",
  "RESOURCE_PEARLS",
  "RESOURCE_WHALES",
  "RESOURCE_CRABS",
  "RESOURCE_COWRIE",
  "RESOURCE_TURTLES",
];

export const AQUATIC_SIGNALS: Record<AquaticResourceType, ResourceSignals> = {
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

export const defaultStrategy = createStrategy(PlanAquaticResourcesContract, "default", {
  // TODO: if you want to validate and normalize, do it in normalize (I guess validate shold be separate?)
  normalize: (config) => {},
  run: (input) => {
    const size = validateGrid(input.width, input.height);
    const expectations = new Map(input.expectations.map((row) => [row.resourceType, row]));
    const plans = [];
    const missingResourceTypes: AquaticResourceType[] = [];

    for (const resourceType of AQUATIC_RESOURCE_TYPES) {
      const expectation = expectations.get(resourceType);
      if (!expectation) {
        missingResourceTypes.push(resourceType);
        plans.push({
          resourceType,
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
          blockers: ["Missing aquatic earthlike expectation row."],
          caveats: [],
        });
        continue;
      }

      if (expectation.status === "blocked") {
        plans.push({
          resourceType,
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

      const signals = AQUATIC_SIGNALS[resourceType];
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
        blockers.push(`Missing aquatic signal masks: ${signals.primary.join(", ")}.`);
      }
      if (!proxyIncomplete && eligibleTileCount === 0) {
        blockers.push("No eligible aquatic tiles observed for this resource under supplied masks.");
      }

      plans.push({
        resourceType,
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
      groupId: "aquatic-coastal-navigable-river" as const,
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
    throw new Error(`Invalid grid dimensions for aquatic resource planning: ${width}x${height}.`);
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
    throw new Error(`Aquatic resource mask ${field} must be a Uint8Array.`);
  }
  if (value.length !== size) {
    throw new Error(
      `Aquatic resource mask ${field} length ${value.length} does not match grid size ${size}.`
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
