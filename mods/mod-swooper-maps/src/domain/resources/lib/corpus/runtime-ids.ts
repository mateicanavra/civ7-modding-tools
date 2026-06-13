import { CIV7_BROWSER_TABLES_V0, CIV7_POLICY_TABLES_V1 } from "@civ7/map-policy";

import { OFFICIAL_RESOURCE_CORPUS } from "./index.js";
import type { OfficialResourceType } from "./types.js";

/**
 * Symbolic→runtime resource id resolution, proven against the generated
 * policy tables (placement-realignment S3).
 *
 * The corpus carries `staticResourceRowSlot` (the GameInfo.Resources row index
 * observed when the corpus was authored) with `runtimeIdStatus: "unverified"`.
 * The S2 policy-table generator re-derives the same index space directly from
 * the official XML sources, so the proof here is a three-way agreement check:
 *
 *   corpus.staticResourceRowSlot
 *     == CIV7_BROWSER_TABLES_V0.resourceTypes[resourceType]
 *     == index whose CIV7_POLICY_TABLES_V1.resourceRows[index].type matches
 *
 * Any disagreement is a hard failure: planning with an unproven id would stamp
 * the wrong resource, so there is no degraded mode.
 */

export type ResolvedResourceRuntimeId = {
  readonly resourceType: OfficialResourceType;
  readonly resourceTypeId: number;
  readonly weight: number;
  readonly minimumPerHemisphere: number;
  readonly classType: string;
  readonly requiredForAges: readonly string[];
};

export type ResourceRuntimeIdResolution = {
  readonly status: "verified";
  readonly checkedCount: number;
  readonly byType: ReadonlyMap<OfficialResourceType, ResolvedResourceRuntimeId>;
  readonly byId: ReadonlyMap<number, ResolvedResourceRuntimeId>;
};

const V0_RESOURCE_TYPES = CIV7_BROWSER_TABLES_V0.resourceTypes as Readonly<Record<string, number>>;
const V1_RESOURCE_ROWS = CIV7_POLICY_TABLES_V1.resourceRows;
const V1_REQUIRED_FOR_AGE = CIV7_POLICY_TABLES_V1.isResourceRequiredForAge;

let cachedResolution: ResourceRuntimeIdResolution | null = null;

/**
 * Resolves every corpus resource type to its runtime id, hard-failing on any
 * corpus↔policy-table disagreement. Result is cached (static data).
 */
export function resolveResourceRuntimeIds(): ResourceRuntimeIdResolution {
  if (cachedResolution) return cachedResolution;

  const byType = new Map<OfficialResourceType, ResolvedResourceRuntimeId>();
  const byId = new Map<number, ResolvedResourceRuntimeId>();
  const failures: string[] = [];

  for (const entry of OFFICIAL_RESOURCE_CORPUS) {
    const resourceType = entry.resourceType;
    const corpusSlot = entry.staticResourceRowSlot;
    const tableIndex = V0_RESOURCE_TYPES[resourceType];
    if (tableIndex === undefined) {
      failures.push(`${resourceType}: missing from CIV7_BROWSER_TABLES_V0.resourceTypes`);
      continue;
    }
    if (tableIndex !== corpusSlot) {
      failures.push(
        `${resourceType}: corpus slot ${corpusSlot} != policy table index ${tableIndex}`
      );
      continue;
    }
    const row = V1_RESOURCE_ROWS[String(tableIndex)];
    if (!row) {
      failures.push(`${resourceType}: missing CIV7_POLICY_TABLES_V1.resourceRows[${tableIndex}]`);
      continue;
    }
    if (row.type !== resourceType) {
      failures.push(
        `${resourceType}: V1 resourceRows[${tableIndex}].type is ${row.type} (corpus/table drift)`
      );
      continue;
    }
    const resolved: ResolvedResourceRuntimeId = {
      resourceType,
      resourceTypeId: tableIndex,
      weight: row.weight,
      minimumPerHemisphere: row.minimumPerHemisphere,
      classType: row.classType,
      requiredForAges: V1_REQUIRED_FOR_AGE[String(tableIndex)] ?? [],
    };
    byType.set(resourceType, resolved);
    byId.set(tableIndex, resolved);
  }

  if (failures.length > 0) {
    throw new Error(
      `[resources] Symbolic→runtime resource id resolution failed for ${failures.length} type(s): ` +
        failures.join("; ")
    );
  }

  cachedResolution = { status: "verified", checkedCount: byType.size, byType, byId };
  return cachedResolution;
}

/** Resolves one type, hard-failing when it cannot be proven. */
export function requireResourceRuntimeId(
  resourceType: OfficialResourceType
): ResolvedResourceRuntimeId {
  const resolved = resolveResourceRuntimeIds().byType.get(resourceType);
  if (!resolved) {
    throw new Error(
      `[resources] No proven runtime id for ${resourceType}; refusing to plan with an unresolved symbolic id.`
    );
  }
  return resolved;
}
