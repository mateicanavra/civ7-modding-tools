import { buildResourceLegalityMask, resolveResourceRuntimeIds } from "@civ7/map-policy";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import type {
  AdmittedResourceDemandCandidate,
  AgeDeferredResourceDemandCandidate,
  ExpectationBlockedResourceDemandCandidate,
  NoLegalSitesResourceDemandCandidate,
  ResourceDemand,
  ResourceDemandSource,
} from "../../../../model/atoms/resource-demand.schema.js";
import type { ResourceExpectationIdentity } from "../../../../model/atoms/resource-expectation.schema.js";
import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  RESOURCE_EXPECTATION_IDENTITY_BY_GROUP,
} from "../../../../model/policy/earthlike-expectations.js";
import {
  RESOURCE_HABITAT_SIGNALS,
  type ResourceFamilyId,
} from "../../../../model/policy/habitat-eligibility.js";
import {
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
} from "../../../../model/policy/initial-map-authoring.js";
import { resolveResourceRegionMinimumRequirement } from "../../../../model/policy/resource-region-minimum.js";
import Contract from "../../contract.js";
import { buildHabitatEligibility } from "../../rules/habitat-eligibility.js";
import StrategyDefinition from "./config.js";

/**
 * Resolves the frozen official resource corpus exactly once through canonical habitat,
 * initial-age, Civ7 legality, river, and regional-minimum authorities.
 */
const policyConstrainedStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input) => {
    const { width, height } = input;
    const size = width * height;
    const age = INITIAL_MAP_RESOURCE_AUTHORING_AGE;
    const runtimeIds = resolveResourceRuntimeIds();
    const outputIntensityByFamily: Record<ResourceFamilyId, Float32Array> = {
      aquatic: Float32Array.from(input.aquaticIntensity),
      cultivated: Float32Array.from(input.cultivatedIntensity),
      terrestrial: Float32Array.from(input.terrestrialIntensity),
      geological: Float32Array.from(input.geologicalIntensity),
    };
    const riverMask = unionMasks(input.riverMasks, size);
    const legalitySurface = { width, height, ...input.legalitySurface };
    const admitted: AdmittedResourceDemandCandidate[] = [];
    const excluded = {
      expectationBlocked: [] as ExpectationBlockedResourceDemandCandidate[],
      ageDeferred: [] as AgeDeferredResourceDemandCandidate[],
      noLegalSites: [] as NoLegalSitesResourceDemandCandidate[],
    };

    for (const expectation of EARTHLIKE_RESOURCE_EXPECTATIONS) {
      const resourceType = expectation.resourceType;
      const identity: ResourceExpectationIdentity = {
        resourceType,
        groupId: expectation.groupId,
        expectationStatus: expectation.status,
        expectedCountRange: { ...expectation.expectedCountRange },
      };

      if (expectation.status === "blocked") {
        excluded.expectationBlocked.push({
          source: { ...identity, expectationStatus: "blocked" },
          reason: { kind: "expectation-blocked" },
        });
        continue;
      }

      const agePolicy = getInitialMapResourcePolicyForType(resourceType, age);
      if (!agePolicy) {
        throw new Error(`[resources] Missing initial-map policy for ${resourceType} in ${age}.`);
      }
      if (agePolicy.status !== "eligible") {
        if (agePolicy.status !== "deferred-future-age") {
          throw new Error(
            `[resources] Expected resource ${resourceType} reached impossible initial-map status ${agePolicy.status}; canonical blocked resources must be disposed before age policy.`
          );
        }
        excluded.ageDeferred.push({
          source: { ...identity, expectationStatus: "expected" },
          reason: { kind: "age-policy", status: agePolicy.status, age },
        });
        continue;
      }

      const signal = RESOURCE_HABITAT_SIGNALS.get(resourceType);
      if (!signal) {
        throw new Error(
          `[resources] Missing canonical habitat signal for official expectation ${resourceType}.`
        );
      }
      const expectedIdentity = RESOURCE_EXPECTATION_IDENTITY_BY_GROUP[expectation.groupId];
      if (signal.family !== expectedIdentity.family) {
        throw new Error(
          `[resources] ${resourceType} expectation group ${expectation.groupId} requires family ${expectedIdentity.family}, but canonical habitat policy assigns ${signal.family}.`
        );
      }
      const habitatEligibility = buildHabitatEligibility(input, size, signal);
      const source: ResourceDemandSource = {
        ...identity,
        expectationStatus: "expected",
        family: signal.family,
        laneId: signal.laneId,
        laneKind: signal.laneKind,
        targetIntentCount: Math.min(
          expectation.expectedCountRange.max,
          habitatEligibility.eligibleTileCount,
          expectation.expectedCountRange.target
        ),
        habitatMask: habitatEligibility.mask,
        habitatTileCount: habitatEligibility.eligibleTileCount,
      };

      const resolved = runtimeIds.byType.get(resourceType);
      if (!resolved) {
        throw new Error(
          `[resources] No proven runtime id for expected type ${resourceType}; refusing to resolve demand.`
        );
      }
      const legalMask = buildResourceLegalityMask(legalitySurface, resolved.resourceTypeId);
      for (let index = 0; index < size; index += 1) {
        if (riverMask[index] !== 0) legalMask[index] = 0;
      }

      let legalTileCount = 0;
      let eligibleTileCount = 0;
      for (let index = 0; index < size; index += 1) {
        if (legalMask[index] === 0) continue;
        legalTileCount += 1;
        if (habitatEligibility.mask[index] !== 0) eligibleTileCount += 1;
      }
      if (legalTileCount === 0) {
        excluded.noLegalSites.push({
          source,
          reason: { kind: "no-legal-sites", legalMask },
        });
        continue;
      }

      if (resolved.minimumPerHemisphere > 0 && !Object.hasOwn(input.requiredForAge, resourceType)) {
        throw new Error(
          `[resources] Missing required-for-age observation for ${resourceType} with official regional minimum ${resolved.minimumPerHemisphere}.`
        );
      }
      const demand: ResourceDemand = {
        weight: Math.max(1, resolved.weight),
        regionMinimumRequirement: resolveResourceRegionMinimumRequirement({
          resourceType,
          age,
          minimumPerHemisphere: resolved.minimumPerHemisphere,
          observedRequiredForAge: input.requiredForAge[resourceType] ?? null,
        }),
        legalMask,
        intensity: outputIntensityByFamily[signal.family],
        legalTileCount,
        eligibleTileCount,
      };
      admitted.push({
        source,
        demand,
      });
    }

    return {
      width,
      height,
      age,
      minimumAmountModifier: input.minimumAmountModifier,
      candidates: { admitted, excluded },
    };
  },
});

function unionMasks(masks: readonly ArrayLike<number>[], size: number): Uint8Array {
  const result = new Uint8Array(size);
  for (const mask of masks) {
    for (let index = 0; index < size; index += 1) {
      if (mask[index] !== 0) result[index] = 1;
    }
  }
  return result;
}

export default policyConstrainedStrategy;
