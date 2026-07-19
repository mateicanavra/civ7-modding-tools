import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  GEOLOGICAL_RESOURCE_TYPES,
  GEOLOGICAL_SIGNALS,
  type GeologicalMaskField,
  type GeologicalResourceSignals,
  type GeologicalResourceType,
} from "../../../model/policy/geological-resource-signals.js";
import PlanGeologicalResourcesContract from "../contract.js";
import type { PlanGeologicalResourcesTypes } from "../types.js";

const DEFAULT_RANGE = {
  baseline: "standard-earthlike-map" as const,
  min: 0,
  target: 0,
  max: 0,
  evidence: "blocked" as const,
};

/**
 * Builds deterministic geological demand rows across every canonical geological resource.
 * Primary and suppression masks preserve physical host policy, while blocked derivative or
 * unsupported types remain visible with typed blockers.
 */
export const defaultStrategy = createStrategy(PlanGeologicalResourcesContract, "default", {
  run: (input) => {
    const size = input.width * input.height;
    const expectations = new Map(input.expectations.map((row) => [row.resourceType, row]));
    const plans = [];
    const missingResourceTypes: GeologicalResourceType[] = [];

    for (const resourceType of GEOLOGICAL_RESOURCE_TYPES) {
      const signals = GEOLOGICAL_SIGNALS[resourceType];
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
          blockers: ["Missing geological earthlike expectation row."],
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
        blockers.push(`Missing geological signal masks: ${signals.primary.join(", ")}.`);
      }
      if (!missingSignal && eligibleTileCount === 0) {
        blockers.push(
          "No eligible geological tiles observed for this resource under supplied masks."
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
      groupId: "geological-mineral-gemstone-industrial" as const,
      proofStatus: "warning-only" as const,
      plans,
      missingResourceTypes,
    };
  },
});

function presentFields(
  input: PlanGeologicalResourcesTypes["input"],
  fields: readonly GeologicalMaskField[]
): string[] {
  return fields.filter((field) => input[field] !== undefined);
}

function countEligibleTiles(
  input: PlanGeologicalResourcesTypes["input"],
  size: number,
  signals: GeologicalResourceSignals
): number {
  const primaryMasks: Uint8Array[] = [];
  for (const field of signals.primary) {
    const mask = input[field] ?? null;
    if (mask !== null) primaryMasks.push(mask);
  }
  if (primaryMasks.length === 0) return 0;

  const suppressMasks: Uint8Array[] = [];
  for (const field of signals.suppress) {
    const mask = input[field] ?? null;
    if (mask !== null) suppressMasks.push(mask);
  }

  let count = 0;
  for (let i = 0; i < size; i++) {
    if (!primaryMasks.some((mask) => mask[i] !== 0)) continue;
    if (suppressMasks.some((mask) => mask[i] !== 0)) continue;
    count += 1;
  }
  return count;
}

function compareRange(
  count: number,
  range: { readonly min: number; readonly max: number }
): "within-range" | "below-range" | "above-range" {
  if (count < range.min) return "below-range";
  if (count > range.max) return "above-range";
  return "within-range";
}
