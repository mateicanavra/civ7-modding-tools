import { type CurrentMapSurface, getCiv7StandardMapSizePresetForDimensions } from "@civ7/adapter";
import {
  buildResourceLegalityMask,
  CIV7_POLICY_TABLES_V1,
  getUnconditionalResourceRequirementBasisForAge,
  OFFICIAL_RESOURCE_BY_TYPE,
  type OfficialResourceType,
  type ResourceLegalitySurface,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import {
  admitPositiveResourceRegionMinimum,
  buildHabitatEligibility,
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  type EarthlikeResourceExpectation,
  getInitialMapResourcePolicyForType,
  HABITAT_INTENSITY_FIELD_NAMES,
  HABITAT_MASK_FIELD_NAMES,
  type HabitatFieldsOutput,
  type HabitatIntensityFieldName,
  type HabitatMaskFieldName,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  RESOURCE_HABITAT_SIGNALS,
  type ResourceExpectationGroupId,
  type ResourceFamilyId,
  type ResourceRegionMinimumRequirement,
  default as resources,
} from "@mapgen/domain/resources";
import type { Static } from "@swooper/mapgen-core/authoring";

type DerivedHabitatFields = Static<(typeof resources.habitat.ops.deriveHabitatFields)["output"]>;
type ResourceDemandPlan = Static<
  typeof import("../../artifacts/resource-demand-plan.artifact.js").artifact.schema
>;
type ResourceDemandExclusionReason = ResourceDemandPlan["excluded"][number]["reason"];
/** Habitat output admitted only after every typed-array class and map cardinality is checked. */
export type HabitatFields = HabitatFieldsOutput;
/** Continuous habitat channels consumed by resource-plan visualization. */
export type HabitatIntensityFields = Pick<HabitatFieldsOutput, HabitatIntensityFieldName>;
type SelectSitesInput = Static<(typeof resources.sites.ops.selectResourceSites)["input"]>;
type DemandRow = SelectSitesInput["demands"][number];
/** One immutable row from the canonical Earthlike resource expectation corpus. */
export type EarthlikeExpectationRow = (typeof EARTHLIKE_RESOURCE_EXPECTATIONS)[number];
type ResourceExpectationInput<G extends ResourceExpectationGroupId> = {
  resourceType: OfficialResourceType;
  groupId: G;
  status: EarthlikeResourceExpectation["status"];
  earthlikePredicate: string;
  expectedCountRange: {
    baseline: EarthlikeResourceExpectation["expectedCountRange"]["baseline"];
    min: number;
    target: number;
    max: number;
    evidence: EarthlikeResourceExpectation["expectedCountRange"]["evidence"];
  };
  conditionMultipliers: string[];
  signalRequirements: string[];
  caveats: string[];
};

/** Diagnostic summary of the demand and eligible surface built for one resource type. */
export type ResourceDemandSummaryRow = {
  resourceType: OfficialResourceType;
  family: ResourceFamilyId;
  laneId: string;
  laneKind: "land" | "water";
  weight: number;
  regionMinimumRequirement: ResourceRegionMinimumRequirement;
  targetCount: number;
  minCount: number;
  maxCount: number;
  habitatTileCount: number;
  legalTileCount: number;
  eligibleTileCount: number;
};

/** Resource demands plus explicit exclusions and the policy inputs used to derive them. */
export type ResourceDemandBuildResult = {
  demands: DemandRow[];
  summaries: ResourceDemandSummaryRow[];
  /** Age-eligible planned types that produced no demand row, with the reason. */
  excluded: Array<{ resourceType: string; reason: ResourceDemandExclusionReason }>;
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE;
  minimumAmountModifier: number;
};

/**
 * Asserts exact typed-array classes and map cardinality for every habitat mask and intensity,
 * then narrows the derived payload to the planning-owned HabitatFields contract.
 */
export function assertHabitatFieldsOutput(
  habitat: DerivedHabitatFields,
  expectedSize: number
): HabitatFields {
  const maskFields = habitat as Partial<Record<HabitatMaskFieldName, unknown>>;
  for (const field of HABITAT_MASK_FIELD_NAMES) {
    const value = maskFields[field];
    if (!(value instanceof Uint8Array) || value.length !== expectedSize) {
      throw new Error(`[resources] habitat output ${field} must be a Uint8Array(${expectedSize}).`);
    }
  }
  const intensityFields = habitat as Partial<Record<HabitatIntensityFieldName, unknown>>;
  for (const field of HABITAT_INTENSITY_FIELD_NAMES) {
    const value = intensityFields[field];
    if (!(value instanceof Float32Array) || value.length !== expectedSize) {
      throw new Error(
        `[resources] habitat output ${field} must be a Float32Array(${expectedSize}).`
      );
    }
  }
  return habitat as HabitatFields;
}

/**
 * Reads the prepared engine surface for policy-legality evaluation.
 *
 * Legality must see the same current surface as the later engine feasibility check, so this
 * projection preserves the adapter's full-width ids rather than reconstructing mutable state from
 * earlier artifacts.
 */
export function readResourceLegalitySurface(
  currentSurface: CurrentMapSurface
): ResourceLegalitySurface {
  return {
    width: currentSurface.width,
    height: currentSurface.height,
    biomeType: currentSurface.biomeType,
    terrainType: currentSurface.terrainType,
    featureType: currentSurface.featureType,
    engineWaterMask: currentSurface.waterMask,
  };
}

/**
 * Resolves the official MapResourceMinimumAmountModifier amount for the
 * active grid (mapType DEFAULT; size resolved from grid dimensions). Sizes
 * without a row (standard) carry modifier 0 in the official data.
 */
export function resolveMinimumAmountModifier(width: number, height: number): number {
  const preset = getCiv7StandardMapSizePresetForDimensions(width, height);
  const mapSizeType = preset?.id;
  if (!mapSizeType) return 0;
  for (const row of CIV7_POLICY_TABLES_V1.mapResourceMinimumAmountModifier) {
    if (row.mapType === "DEFAULT" && row.mapSizeType === mapSizeType) return row.amount;
  }
  return 0;
}

/**
 * Returns expectation rows owned by one resource group with fresh mutable copies of nested range
 * and evidence arrays, leaving the frozen earthlike authority untouched.
 */
export function expectationsForGroup<const G extends ResourceExpectationGroupId>(
  groupId: G
): Array<ResourceExpectationInput<G>> {
  return EARTHLIKE_RESOURCE_EXPECTATIONS.filter(
    (row): row is EarthlikeResourceExpectation & { readonly groupId: G } => row.groupId === groupId
  ).map((row) => ({
    resourceType: row.resourceType,
    groupId: row.groupId,
    status: row.status,
    earthlikePredicate: row.earthlikePredicate,
    expectedCountRange: { ...row.expectedCountRange },
    conditionMultipliers: [...row.conditionMultipliers],
    signalRequirements: [...row.signalRequirements],
    caveats: [...row.caveats],
  }));
}

/**
 * Union of immutable projected river intent and the current engine river surface.
 * Product requirement (rivers stack): no resources on river tiles, including
 * navigable-river water tiles (no fish on navigable rivers).
 */
export function buildRiverResourceExclusionMask(args: {
  width: number;
  height: number;
  projectedNavigableRivers?: {
    riverMask?: Uint8Array;
    plannedMajorRiverMask?: Uint8Array;
    plannedMinorRiverMask?: Uint8Array;
  };
  currentEngineSurface?: {
    riverMask?: Uint8Array;
    navigableRiverMask?: Uint8Array;
    minorRiverMask?: Uint8Array;
  };
}): Uint8Array {
  const size = args.width * args.height;
  const mask = new Uint8Array(size);
  const add = (label: string, candidate: Uint8Array | undefined): void => {
    if (candidate === undefined) return;
    if (!(candidate instanceof Uint8Array) || candidate.length !== size) {
      throw new Error(`[resources] ${label} must be a Uint8Array(${size}).`);
    }
    for (let i = 0; i < size; i++) {
      if (candidate[i] === 1) mask[i] = 1;
    }
  };

  add("projectedNavigableRivers.riverMask", args.projectedNavigableRivers?.riverMask);
  add(
    "projectedNavigableRivers.plannedMajorRiverMask",
    args.projectedNavigableRivers?.plannedMajorRiverMask
  );
  add(
    "projectedNavigableRivers.plannedMinorRiverMask",
    args.projectedNavigableRivers?.plannedMinorRiverMask
  );
  add("currentEngineSurface.riverMask", args.currentEngineSurface?.riverMask);
  add("currentEngineSurface.navigableRiverMask", args.currentEngineSurface?.navigableRiverMask);
  add("currentEngineSurface.minorRiverMask", args.currentEngineSurface?.minorRiverMask);
  return mask;
}

type GroupPlanRow = {
  resourceType: string;
  status: "planned" | "blocked" | "missing-expectation" | "missing-signal";
  targetIntentCount: number;
  eligibleTileCount: number;
};

/**
 * Builds the per-type demand rows for site selection from the family
 * planners' symbolic rows: proves symbolic→runtime ids against the policy
 * tables (hard-fail), derives per-type habitat eligibility and policy
 * legality masks, and attaches official Weight plus the typed regional-minimum
 * admission decision and its engine, static, or unresolved provenance (E2.1, E2.2).
 */
export function buildResourceDemands(args: {
  width: number;
  height: number;
  plannedRows: ReadonlyArray<GroupPlanRow>;
  habitat: HabitatFields;
  legalitySurface: ResourceLegalitySurface;
  /**
   * Exact live required-for-age observations for planned resources with an official regional
   * minimum. `null` records that the engine observation is unavailable; omitted entries are refused.
   */
  requiredForAgeByResourceType: ReadonlyMap<OfficialResourceType, boolean | null>;
  /**
   * Optional per-tile river exclusion (1 = river tile). Tiles flagged here
   * are removed from every demand's legalMask BEFORE legal/eligible counts,
   * so the exclusion flows through site selection, the support pass, and
   * stamping with no other changes. Applies to ALL families, aquatic included
   * (navigable-river water tiles must not receive fish — rivers product
   * decision).
   */
  riverResourceExclusionMask?: Uint8Array;
}): ResourceDemandBuildResult {
  const {
    width,
    height,
    plannedRows,
    habitat,
    legalitySurface,
    requiredForAgeByResourceType,
    riverResourceExclusionMask,
  } = args;
  const size = width * height;
  if (riverResourceExclusionMask !== undefined && riverResourceExclusionMask.length !== size) {
    throw new Error(
      `[resources] riverResourceExclusionMask length ${riverResourceExclusionMask.length} does not match grid size ${size}.`
    );
  }
  const age = INITIAL_MAP_RESOURCE_AUTHORING_AGE;
  const resolution = resolveResourceRuntimeIds();
  const expectationByType = new Map(
    EARTHLIKE_RESOURCE_EXPECTATIONS.map((row) => [row.resourceType, row])
  );

  const intensityByFamily: Record<ResourceFamilyId, Float32Array> = {
    aquatic: habitat.aquaticIntensity as Float32Array,
    cultivated: habitat.cultivatedIntensity as Float32Array,
    terrestrial: habitat.terrestrialIntensity as Float32Array,
    geological: habitat.geologicalIntensity as Float32Array,
  };

  const demands: DemandRow[] = [];
  const summaries: ResourceDemandSummaryRow[] = [];
  const excluded: Array<{ resourceType: string; reason: ResourceDemandExclusionReason }> = [];

  for (const row of plannedRows) {
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
      // Hard-fail: a planned, age-eligible type with no habitat signal means
      // the planner tables and the signal tables have drifted.
      throw new Error(`[resources] No habitat signal registered for planned type ${resourceType}.`);
    }
    const expectation = expectationByType.get(resourceType);
    if (!expectation) {
      throw new Error(`[resources] No earthlike expectation row for planned type ${resourceType}.`);
    }
    const resolved = resolution.byType.get(resourceType);
    if (!resolved) {
      throw new Error(
        `[resources] No proven runtime id for planned type ${resourceType}; refusing to plan.`
      );
    }

    const habitatEligibility = buildHabitatEligibility(habitat, size, signal);
    const legalMask = buildResourceLegalityMask(legalitySurface, resolved.resourceTypeId);
    if (riverResourceExclusionMask) {
      for (let i = 0; i < size; i++) {
        if (riverResourceExclusionMask[i] === 1) legalMask[i] = 0;
      }
    }
    let legalTileCount = 0;
    let eligibleTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (legalMask[i] !== 0) {
        legalTileCount += 1;
        if (habitatEligibility.mask[i] !== 0) eligibleTileCount += 1;
      }
    }
    if (legalTileCount === 0) {
      excluded.push({ resourceType, reason: { kind: "no-admitted-legal-tiles" } });
      continue;
    }

    const laneKind: "land" | "water" = signal.family === "aquatic" ? "water" : "land";
    const minimumPerHemisphere = resolved.minimumPerHemisphere;
    if (minimumPerHemisphere > 0 && !requiredForAgeByResourceType.has(resourceType)) {
      throw new Error(
        `[resources] Missing required-for-age observation for ${resourceType} with official regional minimum ${minimumPerHemisphere}.`
      );
    }
    const regionMinimumRequirement = resolveResourceRegionMinimumRequirement({
      resourceType,
      age,
      minimumPerHemisphere,
      observedRequiredForAge: requiredForAgeByResourceType.get(resourceType) ?? null,
    });
    const demand: DemandRow = {
      resourceType,
      family: signal.family,
      laneId: signal.laneId,
      laneKind,
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
      family: signal.family,
      laneId: signal.laneId,
      laneKind,
      weight: demand.weight,
      regionMinimumRequirement: demand.regionMinimumRequirement,
      targetCount: demand.targetCount,
      minCount: demand.minCount,
      maxCount: demand.maxCount,
      habitatTileCount: habitatEligibility.eligibleTileCount,
      legalTileCount,
      eligibleTileCount,
    });
  }

  return {
    demands,
    summaries,
    excluded,
    age,
    minimumAmountModifier: resolveMinimumAmountModifier(width, height),
  };
}

/**
 * Resolves one official regional-minimum decision without flattening unavailable engine policy to
 * false. Live answers are exact; only age-valid Staple/UnlocksCiv facts may admit headless forcing.
 */
export function resolveResourceRegionMinimumRequirement(args: {
  resourceType: OfficialResourceType;
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE;
  minimumPerHemisphere: number;
  observedRequiredForAge: boolean | null;
}): ResourceRegionMinimumRequirement {
  const { resourceType, age, minimumPerHemisphere, observedRequiredForAge } = args;
  if (minimumPerHemisphere === 0) {
    return { kind: "not-applicable", reason: "no-official-minimum" };
  }
  const admittedMinimum = admitPositiveResourceRegionMinimum(minimumPerHemisphere);
  if (observedRequiredForAge === true) {
    return { kind: "required", minimumPerHemisphere: admittedMinimum, source: "engine" };
  }
  if (observedRequiredForAge === false) {
    return { kind: "not-required", minimumPerHemisphere: admittedMinimum, source: "engine" };
  }

  const basis = getUnconditionalResourceRequirementBasisForAge(resourceType, age);
  if (basis.length === 0) {
    return {
      kind: "unresolved",
      minimumPerHemisphere: admittedMinimum,
      source: "engine-unavailable",
    };
  }
  return {
    kind: "required",
    minimumPerHemisphere: admittedMinimum,
    source: "static-unconditional",
    basis,
  };
}
