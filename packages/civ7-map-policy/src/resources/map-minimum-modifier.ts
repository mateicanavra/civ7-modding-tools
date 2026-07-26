import { CIV7_POLICY_TABLES_V1 } from "../civ7-tables.gen.js";

/**
 * Resolves the official resource-minimum modifier for one map type and size. Civ7 omits rows
 * whose modifier is zero, so an absent exact pair resolves to zero rather than uncertainty.
 */
export function resolveMapResourceMinimumAmountModifier(
  mapType: string,
  mapSizeType: string
): number {
  return (
    CIV7_POLICY_TABLES_V1.mapResourceMinimumAmountModifier.find(
      (row) => row.mapType === mapType && row.mapSizeType === mapSizeType
    )?.amount ?? 0
  );
}
