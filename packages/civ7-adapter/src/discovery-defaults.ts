import type { DiscoveryPlacementDefaults } from "./types.js";

type DiscoverySiftingImprovementRow = {
  QueueType?: unknown;
  Activation?: unknown;
  ConstructibleType?: unknown;
};

type ResolveDiscoveryDefaultsInput = {
  discoveryVisualTypes?: Record<string, number>;
  discoveryActivationTypes?: Record<string, number>;
  discoverySiftingImprovements?: Iterable<DiscoverySiftingImprovementRow>;
  activeSiftingType?: unknown;
  makeHash?: ((value: string) => number) | null;
  disabledSiftingType?: number;
};

const DEFAULT_DISABLED_SIFTING_TYPE = 2316276985;

function toHashValue(value: unknown, makeHash?: ((v: string) => number) | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  if (makeHash == null) return null;
  try {
    const hashed = makeHash(value);
    return typeof hashed === "number" && Number.isFinite(hashed) ? hashed : null;
  } catch {
    return null;
  }
}

function matchesActiveSiftingType(
  row: DiscoverySiftingImprovementRow,
  activeSiftingType: unknown,
  makeHash?: ((value: string) => number) | null,
  disabledSiftingType = DEFAULT_DISABLED_SIFTING_TYPE
): boolean {
  const activeHash = toHashValue(activeSiftingType, makeHash);
  if (activeHash == null) return true;
  if (activeHash === disabledSiftingType) return false;

  const queueHash = toHashValue(row.QueueType, makeHash);
  return queueHash != null ? queueHash === activeHash : false;
}

function resolveCandidateFromRows(
  rows: DiscoverySiftingImprovementRow[],
  discoveryVisualTypes: Record<string, number>,
  discoveryActivationTypes: Record<string, number>
): DiscoveryPlacementDefaults | null {
  for (const row of rows) {
    const constructibleType = typeof row?.ConstructibleType === "string" ? row.ConstructibleType : null;
    const activationType = typeof row?.Activation === "string" ? row.Activation : null;
    if (constructibleType == null || activationType == null) continue;

    const discoveryVisualType = discoveryVisualTypes[constructibleType];
    const discoveryActivationType = discoveryActivationTypes[activationType];
    if (typeof discoveryVisualType !== "number" || typeof discoveryActivationType !== "number") continue;

    return { discoveryVisualType, discoveryActivationType };
  }
  return null;
}

export function resolveDefaultDiscoveryPlacement({
  discoveryVisualTypes,
  discoveryActivationTypes,
  discoverySiftingImprovements,
  activeSiftingType,
  makeHash,
  disabledSiftingType = DEFAULT_DISABLED_SIFTING_TYPE,
}: ResolveDiscoveryDefaultsInput): DiscoveryPlacementDefaults | null {
  if (discoveryVisualTypes == null || discoveryActivationTypes == null) {
    return null;
  }

  const rows = Array.from(discoverySiftingImprovements ?? []);
  if (rows.length > 0) {
    const activeRows = rows.filter((row) =>
      matchesActiveSiftingType(row, activeSiftingType, makeHash, disabledSiftingType)
    );
    const selectedRows = activeRows.length > 0 ? activeRows : rows;
    const selected = resolveCandidateFromRows(
      selectedRows,
      discoveryVisualTypes,
      discoveryActivationTypes
    );
    if (selected != null) return selected;
  }

  const fallbackVisual = discoveryVisualTypes.IMPROVEMENT_CAVE;
  const fallbackActivation = discoveryActivationTypes.BASIC;
  if (typeof fallbackVisual === "number" && typeof fallbackActivation === "number") {
    return {
      discoveryVisualType: fallbackVisual,
      discoveryActivationType: fallbackActivation,
    };
  }

  return null;
}
