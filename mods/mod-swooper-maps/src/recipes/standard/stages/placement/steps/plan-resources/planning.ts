import { getCiv7StandardMapSizePresetForDimensions } from "@civ7/adapter";
import { CIV7_POLICY_TABLES_V1 } from "@civ7/map-policy";
import resources from "@mapgen/domain/resources";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { Static } from "@swooper/mapgen-core/authoring";
import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  resolveResourceRuntimeIds,
} from "../../../../../../domain/resources/index.js";
import type { OfficialResourceType } from "../../../../../../domain/resources/lib/corpus/types.js";
import {
  buildHabitatEligibility,
  RESOURCE_HABITAT_SIGNALS,
  type ResourceFamilyId,
} from "../../../../../../domain/resources/policy/habitat-eligibility.js";
import {
  getInitialMapResourcePolicyForType,
  resolveActiveResourceAge,
} from "../../../../../../domain/resources/policy/initial-map-authoring.js";
import {
  buildResourceLegalityMask,
  type ResourceLegalitySurface,
} from "../../../../../../domain/resources/policy/resource-legality.js";

type HabitatFields = Static<(typeof resources.ops.deriveHabitatFields)["output"]>;
type SelectSitesInput = Static<(typeof resources.ops.selectResourceSites)["input"]>;
type DemandRow = SelectSitesInput["demands"][number];

export type ResourceDemandSummaryRow = {
  resourceType: string;
  resourceTypeId: number;
  family: ResourceFamilyId;
  laneId: string;
  laneKind: "land" | "water";
  weight: number;
  minimumPerHemisphere: number;
  requiredForAge: boolean;
  targetCount: number;
  minCount: number;
  maxCount: number;
  habitatTileCount: number;
  legalTileCount: number;
  eligibleTileCount: number;
};

export type ResourceDemandBuildResult = {
  demands: DemandRow[];
  summaries: ResourceDemandSummaryRow[];
  /** Age-eligible planned types that produced no demand row, with the reason. */
  excluded: Array<{ resourceType: string; reason: string }>;
  age: string;
  minimumAmountModifier: number;
};

/**
 * Reads the prepared engine surface for policy-legality evaluation.
 *
 * Declared engine-surface read (ADR-009 context): the legality masks must see
 * exactly what the reconcile-time `canHaveResource` oracle sees — the final
 * engine surface after placement maintenance. Reconstructing this surface
 * from artifacts is S6 scope.
 */
export function readResourceLegalitySurface(context: ExtendedMapContext): ResourceLegalitySurface {
  const { width, height } = context.dimensions;
  const size = width * height;
  const biomeType = new Uint8Array(size);
  const terrainType = new Uint8Array(size);
  const featureType = new Int16Array(size);
  const engineWaterMask = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const y = (i / width) | 0;
    const x = i - y * width;
    biomeType[i] = Math.max(0, context.adapter.getBiomeType(x, y) | 0);
    terrainType[i] = Math.max(0, context.adapter.getTerrainType(x, y) | 0);
    featureType[i] = context.adapter.getFeatureType(x, y) | 0;
    engineWaterMask[i] = context.adapter.isWater(x, y) ? 1 : 0;
  }
  return { width, height, biomeType, terrainType, featureType, engineWaterMask };
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

export function expectationsForGroup(groupId: string) {
  return EARTHLIKE_RESOURCE_EXPECTATIONS.filter((row) => row.groupId === groupId);
}

/** Picks the habitat-derived masks a family planner contract declares. */
export function pickPlannerMasks(
  contractInput: { properties: Record<string, unknown> },
  habitat: HabitatFields
): Record<string, Uint8Array> {
  const picked: Record<string, Uint8Array> = {};
  for (const key of Object.keys(contractInput.properties)) {
    const value = (habitat as Record<string, unknown>)[key];
    if (value instanceof Uint8Array) picked[key] = value;
  }
  return picked;
}

/**
 * Union of the planned + engine-projected river masks from the map-rivers
 * stage. Product requirement (rivers stack): no resources on river tiles —
 * including navigable-river water tiles (no fish on navigable rivers).
 */
export function buildRiverResourceExclusionMask(args: {
  width: number;
  height: number;
  projectedNavigableRivers?: {
    riverMask?: Uint8Array;
    plannedMajorRiverMask?: Uint8Array;
    plannedMinorRiverMask?: Uint8Array;
  };
  engineProjectionRivers?: {
    engineIsRiverMask?: Uint8Array;
    terrainNavigableRiverMask?: Uint8Array;
    engineNavigableRiverMask?: Uint8Array;
    engineMinorRiverMask?: Uint8Array;
    riverMask?: Uint8Array;
  };
}): Uint8Array {
  const size = Math.max(0, args.width * args.height);
  const mask = new Uint8Array(size);
  const add = (candidate: Uint8Array | undefined): void => {
    if (!(candidate instanceof Uint8Array) || candidate.length !== size) return;
    for (let i = 0; i < size; i++) {
      if (candidate[i] === 1) mask[i] = 1;
    }
  };

  add(args.projectedNavigableRivers?.riverMask);
  add(args.projectedNavigableRivers?.plannedMajorRiverMask);
  add(args.projectedNavigableRivers?.plannedMinorRiverMask);
  add(args.engineProjectionRivers?.riverMask);
  add(args.engineProjectionRivers?.terrainNavigableRiverMask);
  add(args.engineProjectionRivers?.engineIsRiverMask);
  add(args.engineProjectionRivers?.engineNavigableRiverMask);
  add(args.engineProjectionRivers?.engineMinorRiverMask);
  return mask;
}

type GroupPlanRow = {
  resourceType: string;
  status: "planned" | "blocked" | "missing-expectation" | "proxy-gap";
  targetIntentCount: number;
  eligibleTileCount: number;
};

/**
 * Builds the per-type demand rows for site selection from the family
 * planners' symbolic rows: proves symbolic→runtime ids against the policy
 * tables (hard-fail), derives per-type habitat eligibility and policy
 * legality masks, and attaches official Weight / MinimumPerHemisphere /
 * required-for-age facts (E2.1, E2.2).
 */
export function buildResourceDemands(args: {
  width: number;
  height: number;
  plannedRows: ReadonlyArray<GroupPlanRow>;
  habitat: HabitatFields;
  legalitySurface: ResourceLegalitySurface;
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
  const { width, height, plannedRows, habitat, legalitySurface, riverResourceExclusionMask } = args;
  const size = width * height;
  if (riverResourceExclusionMask !== undefined && riverResourceExclusionMask.length !== size) {
    throw new Error(
      `[resources] riverResourceExclusionMask length ${riverResourceExclusionMask.length} does not match grid size ${size}.`
    );
  }
  const age = resolveActiveResourceAge();
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

  const habitatFields = habitat as unknown as Record<string, Uint8Array | undefined>;
  const demands: DemandRow[] = [];
  const summaries: ResourceDemandSummaryRow[] = [];
  const excluded: Array<{ resourceType: string; reason: string }> = [];

  for (const row of plannedRows) {
    const resourceType = row.resourceType as OfficialResourceType;
    if (row.status !== "planned") {
      excluded.push({ resourceType, reason: `planner-status:${row.status}` });
      continue;
    }
    const agePolicy = getInitialMapResourcePolicyForType(resourceType, age);
    if (agePolicy?.status !== "eligible") {
      excluded.push({
        resourceType,
        reason: `age-policy:${agePolicy?.status ?? "unknown"}:${age}`,
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

    const habitatEligibility = buildHabitatEligibility(habitatFields, size, signal);
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
      excluded.push({ resourceType, reason: "no-policy-legal-tiles" });
      continue;
    }

    const laneKind: "land" | "water" = signal.family === "aquatic" ? "water" : "land";
    const demand: DemandRow = {
      resourceType,
      resourceTypeId: resolved.resourceTypeId,
      family: signal.family,
      laneId: signal.laneId,
      laneKind,
      weight: Math.max(1, resolved.weight),
      targetCount: row.targetIntentCount,
      minCount: Math.min(expectation.expectedCountRange.min, expectation.expectedCountRange.max),
      maxCount: expectation.expectedCountRange.max,
      minimumPerHemisphere: resolved.minimumPerHemisphere,
      requiredForAge: resolved.requiredForAges.includes(age),
      habitatMask: habitatEligibility.mask,
      legalMask,
      intensity: intensityByFamily[signal.family],
    };
    demands.push(demand);
    summaries.push({
      resourceType,
      resourceTypeId: resolved.resourceTypeId,
      family: signal.family,
      laneId: signal.laneId,
      laneKind,
      weight: demand.weight,
      minimumPerHemisphere: demand.minimumPerHemisphere,
      requiredForAge: demand.requiredForAge,
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
