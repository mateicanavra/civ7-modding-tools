import type { OfficialAgeType } from "@civ7/map-policy";

/** Minimal Civ7 runtime surface required to query roster-aware resource age policy. */
export type Civ7ResourceAgePolicyRuntime = Readonly<{
  Database?: Readonly<{
    makeHash?: (key: string) => number;
  }>;
  ResourceBuilder?: Readonly<{
    isResourceRequiredForAge?: (resourceTypeId: number, ageHash: number) => unknown;
  }>;
}>;

/**
 * Queries Civ7's roster-aware resource requirement policy without importing map-generation APIs.
 * `null` means the runtime surface is absent; engine failures and malformed answers remain errors.
 */
export function queryCiv7ResourceRequirementForAge(
  runtime: Civ7ResourceAgePolicyRuntime,
  resourceTypeId: number,
  ageType: OfficialAgeType
): boolean | null {
  const database = runtime.Database;
  const resourceBuilder = runtime.ResourceBuilder;
  if (
    typeof database?.makeHash !== "function" ||
    typeof resourceBuilder?.isResourceRequiredForAge !== "function"
  ) {
    return null;
  }

  const ageHash = database.makeHash(ageType);
  const result = resourceBuilder.isResourceRequiredForAge(resourceTypeId, ageHash);
  if (typeof result !== "boolean") {
    throw new TypeError(
      "[Adapter] ResourceBuilder.isResourceRequiredForAge returned a non-boolean result."
    );
  }
  return result;
}
