import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  TERRESTRIAL_RESOURCE_TYPES,
  TERRESTRIAL_SIGNALS,
  type TerrestrialMaskField,
  type TerrestrialResourceSignals,
  type TerrestrialResourceType,
} from "../../../model/policy/terrestrial-resource-signals.js";
import PlanTerrestrialResourcesContract from "../contract.js";

const DEFAULT_RANGE = {
  baseline: "standard-earthlike-map" as const,
  min: 0,
  target: 0,
  max: 0,
  evidence: "blocked" as const,
};

/**
 * Builds deterministic terrestrial demand rows across every canonical terrestrial resource.
 * Primary and suppression masks determine eligible land counts, and missing signals remain
 * typed warning rows rather than neutral habitat defaults.
 */
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
          earthlikePredicate: "",
          conditionMultipliers: [],
          signalRequirements: [],
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
          earthlikePredicate: expectation.earthlikePredicate,
          conditionMultipliers: [...expectation.conditionMultipliers],
          signalRequirements: [...expectation.signalRequirements],
          signalFields: [],
          blockers: ["Expectation row is blocked by official corpus disposition."],
          caveats: [...expectation.caveats],
        });
        continue;
      }

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
        blockers.push(`Missing terrestrial signal masks: ${signals.primary.join(", ")}.`);
      }
      if (!missingSignal && eligibleTileCount === 0) {
        blockers.push(
          "No eligible terrestrial tiles observed for this resource under supplied masks."
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
      groupId: "terrestrial-animal-forest-wild" as const,
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

function presentFields(
  input: Record<string, unknown>,
  fields: readonly TerrestrialMaskField[]
): string[] {
  return fields.filter((field) => input[field] !== undefined);
}

function countEligibleTiles(
  input: Record<string, unknown>,
  size: number,
  signals: TerrestrialResourceSignals
): number {
  const primaryMasks = signals.primary
    .map((field) => ({ field, mask: readMask(input, field, size) }))
    .filter(
      (entry): entry is { field: TerrestrialMaskField; mask: Uint8Array } =>
        entry.mask !== undefined
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
