import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  CULTIVATED_RESOURCE_TYPES,
  CULTIVATED_SIGNALS,
  type CultivatedMaskField,
  type CultivatedResourceSignals,
  type CultivatedResourceType,
} from "../../../model/policy/cultivated-resource-signals.js";
import PlanCultivatedResourcesContract from "../contract.js";

const DEFAULT_RANGE = {
  baseline: "standard-earthlike-map" as const,
  min: 0,
  target: 0,
  max: 0,
  evidence: "blocked" as const,
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
          earthlikePredicate: "",
          conditionMultipliers: [],
          signalRequirements: [],
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
          earthlikePredicate: expectation.earthlikePredicate,
          conditionMultipliers: [...expectation.conditionMultipliers],
          signalRequirements: [...expectation.signalRequirements],
          signalFields: [],
          blockers: ["Expectation row is blocked by official corpus disposition."],
          caveats: [...expectation.caveats],
        });
        continue;
      }

      const signals = CULTIVATED_SIGNALS[resourceType];
      const signalFields = presentFields(input, signals.primary);
      const eligibleTileCount = countEligibleTiles(input, size, signals);
      const missingSignal = signalFields.length === 0;
      const targetIntentCount = missingSignal
        ? 0
        : Math.min(
            expectation.expectedCountRange.max,
            eligibleTileCount,
            expectation.expectedCountRange.target
          );
      const blockers = [];
      if (missingSignal) {
        blockers.push(`Missing cultivated signal masks: ${signals.primary.join(", ")}.`);
      }
      if (!missingSignal && eligibleTileCount === 0) {
        blockers.push(
          "No eligible cultivated tiles observed for this resource under supplied masks."
        );
      }

      plans.push({
        resourceType,
        laneId: signals.laneId,
        status: missingSignal ? ("missing-signal" as const) : ("planned" as const),
        eligibilityStatus: missingSignal ? ("missing-signal" as const) : ("observed" as const),
        expectedCountRange: expectation.expectedCountRange,
        targetIntentCount,
        eligibleTileCount,
        rangeStatus: missingSignal
          ? ("not-gated" as const)
          : compareRange(targetIntentCount, expectation.expectedCountRange),
        proofStatus: "warning-only" as const,
        earthlikePredicate: expectation.earthlikePredicate,
        conditionMultipliers: [...expectation.conditionMultipliers],
        signalRequirements: [...expectation.signalRequirements],
        signalFields,
        blockers,
        caveats: [...expectation.caveats],
      });
    }

    return {
      groupId: "cultivated-plantation-medicinal" as const,
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
      `Invalid grid dimensions for cultivated resource planning: ${width}x${height}.`
    );
  }
  return size;
}

function presentFields(
  input: Record<string, unknown>,
  fields: readonly CultivatedMaskField[]
): string[] {
  return fields.filter((field) => input[field] !== undefined);
}

function countEligibleTiles(
  input: Record<string, unknown>,
  size: number,
  signals: CultivatedResourceSignals
): number {
  const primaryMasks = signals.primary
    .map((field) => ({ field, mask: readMask(input, field, size) }))
    .filter(
      (entry): entry is { field: CultivatedMaskField; mask: Uint8Array } => entry.mask !== undefined
    );
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
    throw new Error(`Cultivated resource mask ${field} must be a Uint8Array.`);
  }
  if (value.length !== size) {
    throw new Error(
      `Cultivated resource mask ${field} length ${value.length} does not match grid size ${size}.`
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
