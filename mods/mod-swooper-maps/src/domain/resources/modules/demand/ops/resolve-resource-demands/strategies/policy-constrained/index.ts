import {
  buildResourceLegalityMask,
  OFFICIAL_RESOURCE_BY_TYPE,
  type OfficialResourceType,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import type {
  ResourceDemandExclusion,
  ResourceDemandRow,
  ResourceDemandSummaryRow,
} from "../../../../model/atoms/resource-demand.schema.js";
import { EARTHLIKE_RESOURCE_EXPECTATIONS } from "../../../../model/policy/earthlike-expectations.js";
import {
  buildHabitatEligibility,
  type HabitatMaskFields,
  RESOURCE_HABITAT_SIGNALS,
  type ResourceFamilyId,
} from "../../../../model/policy/habitat-eligibility.js";
import {
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
} from "../../../../model/policy/initial-map-authoring.js";
import { resolveResourceRegionMinimumRequirement } from "../../../../model/policy/resource-region-minimum.js";
import Contract from "../../contract.js";
import StrategyDefinition from "./config.js";

/**
 * Applies official resource identity and legality, Swooper habitat policy, initial-age authority,
 * and every admitted river exclusion before producing site-selection demands.
 */
const policyConstrainedStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input) => {
    const { width, height } = input;
    const size = width * height;
    const age = INITIAL_MAP_RESOURCE_AUTHORING_AGE;
    const runtimeIds = resolveResourceRuntimeIds();
    const expectationByType = new Map(
      EARTHLIKE_RESOURCE_EXPECTATIONS.map((row) => [row.resourceType, row])
    );
    const requiredForAge = input.requiredForAge;
    const habitat = input as HabitatMaskFields;
    const intensityByFamily: Record<ResourceFamilyId, Float32Array> = {
      aquatic: input.aquaticIntensity as Float32Array,
      cultivated: input.cultivatedIntensity as Float32Array,
      terrestrial: input.terrestrialIntensity as Float32Array,
      geological: input.geologicalIntensity as Float32Array,
    };
    const riverMask = unionMasks(input.riverMasks, size);
    const legalitySurface = { width, height, ...input.legalitySurface };

    const demands: ResourceDemandRow[] = [];
    const summaries: ResourceDemandSummaryRow[] = [];
    const excluded: ResourceDemandExclusion[] = [];

    for (const row of input.plannedRows) {
      const resourceType = row.resourceType as OfficialResourceType;
      if (!Object.hasOwn(OFFICIAL_RESOURCE_BY_TYPE, resourceType)) {
        excluded.push({ resourceType, reason: { kind: "outside-official-resource-corpus" } });
        continue;
      }
      if (row.status !== "planned") {
        excluded.push({ resourceType, reason: { kind: "planner-status", status: row.status } });
        continue;
      }
      const agePolicy = getInitialMapResourcePolicyForType(resourceType, age);
      if (agePolicy?.status !== "eligible") {
        excluded.push({
          resourceType,
          reason: { kind: "age-policy", status: agePolicy?.status ?? "unknown", age },
        });
        continue;
      }
      const signal = RESOURCE_HABITAT_SIGNALS.get(resourceType);
      if (!signal) {
        throw new Error(
          `[resources] No habitat signal registered for planned type ${resourceType}.`
        );
      }
      const expectation = expectationByType.get(resourceType);
      if (!expectation) {
        throw new Error(
          `[resources] No earthlike expectation row for planned type ${resourceType}.`
        );
      }
      const resolved = runtimeIds.byType.get(resourceType);
      if (!resolved) {
        throw new Error(
          `[resources] No proven runtime id for planned type ${resourceType}; refusing to plan.`
        );
      }

      const habitatEligibility = buildHabitatEligibility(habitat, size, signal);
      const legalMask = buildResourceLegalityMask(legalitySurface, resolved.resourceTypeId);
      for (let index = 0; index < size; index += 1) {
        if (riverMask[index] === 1) legalMask[index] = 0;
      }

      let legalTileCount = 0;
      let eligibleTileCount = 0;
      for (let index = 0; index < size; index += 1) {
        if (legalMask[index] === 0) continue;
        legalTileCount += 1;
        if (habitatEligibility.mask[index] !== 0) eligibleTileCount += 1;
      }
      if (legalTileCount === 0) {
        excluded.push({ resourceType, reason: { kind: "no-admitted-legal-tiles" } });
        continue;
      }

      if (resolved.minimumPerHemisphere > 0 && !Object.hasOwn(requiredForAge, resourceType)) {
        throw new Error(
          `[resources] Missing required-for-age observation for ${resourceType} with official regional minimum ${resolved.minimumPerHemisphere}.`
        );
      }
      const regionMinimumRequirement = resolveResourceRegionMinimumRequirement({
        resourceType,
        age,
        minimumPerHemisphere: resolved.minimumPerHemisphere,
        observedRequiredForAge: requiredForAge[resourceType] ?? null,
      });
      const demand: ResourceDemandRow = {
        resourceType,
        family: signal.family,
        laneId: signal.laneId,
        laneKind: signal.family === "aquatic" ? "water" : "land",
        weight: Math.max(1, resolved.weight),
        targetCount: row.targetIntentCount,
        minCount: Math.min(expectation.expectedCountRange.min, expectation.expectedCountRange.max),
        maxCount: expectation.expectedCountRange.max,
        regionMinimumRequirement,
        habitatMask: habitatEligibility.mask,
        legalMask,
        intensity: intensityByFamily[signal.family],
      };
      demands.push(demand);
      summaries.push({
        resourceType,
        family: demand.family,
        laneId: demand.laneId,
        laneKind: demand.laneKind,
        weight: demand.weight,
        regionMinimumRequirement,
        targetCount: demand.targetCount,
        minCount: demand.minCount,
        maxCount: demand.maxCount,
        habitatTileCount: habitatEligibility.eligibleTileCount,
        legalTileCount,
        eligibleTileCount,
      });
    }

    return {
      width,
      height,
      age,
      minimumAmountModifier: input.minimumAmountModifier,
      demands,
      summaries,
      excluded,
    };
  },
});

function unionMasks(masks: readonly Uint8Array[], size: number): Uint8Array {
  const result = new Uint8Array(size);
  for (const mask of masks) {
    for (let index = 0; index < size; index += 1) {
      if (mask[index] === 1) result[index] = 1;
    }
  }
  return result;
}

export default policyConstrainedStrategy;
