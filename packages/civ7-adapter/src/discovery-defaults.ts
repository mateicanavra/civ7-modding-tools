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
};

function toQueueValue(value: unknown): number | string | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length > 0) return value;
  return null;
}

function resolveCandidateFromRows(
  rows: DiscoverySiftingImprovementRow[],
  activeSiftingType: number | string,
  discoveryVisualTypes: Record<string, number>,
  discoveryActivationTypes: Record<string, number>
): DiscoveryPlacementDefaults | null {
  for (const row of rows) {
    const queueType = toQueueValue(row.QueueType);
    if (queueType == null || queueType !== activeSiftingType) continue;

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
}: ResolveDiscoveryDefaultsInput): DiscoveryPlacementDefaults | null {
  if (discoveryVisualTypes == null || discoveryActivationTypes == null) {
    return null;
  }

  const resolvedActiveSiftingType = toQueueValue(activeSiftingType);
  if (resolvedActiveSiftingType == null) return null;

  const rows = Array.from(discoverySiftingImprovements ?? []);
  if (rows.length === 0) return null;
  return resolveCandidateFromRows(
    rows,
    resolvedActiveSiftingType,
    discoveryVisualTypes,
    discoveryActivationTypes
  );
}
