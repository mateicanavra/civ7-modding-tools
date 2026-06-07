import { CIV7_BROWSER_TABLES_V0, getNaturalWonderFootprintIndices } from "@civ7/map-policy";
import type { ExtendedMapContext } from "@swooper/mapgen-core";
import type { DeepReadonly, Static } from "@swooper/mapgen-core/authoring";

import placement from "@mapgen/domain/placement";

type NaturalWonderPlan = Static<(typeof placement.ops.planNaturalWonders)["output"]>;

type StampNaturalWondersFromPlanArgs = {
  adapter: ExtendedMapContext["adapter"];
  width: number;
  height: number;
  wonders: DeepReadonly<NaturalWonderPlan>;
  requestedCount?: number;
};

export type NaturalWonderStampingStats = {
  plannedCount: number;
  targetCount: number;
  placedCount: number;
  terrainAdjustedCount: number;
  skippedOutOfBoundsCount: number;
  rejectedCount: number;
  shortfallCount: number;
  rejectionExamples: string[];
};

export type NaturalWonderPlacementRuntimeTelemetry = {
  version: 1;
  plannedCount: number;
  targetCount: number;
  placedCount: number;
  terrainAdjustedCount: number;
  skippedOutOfBoundsCount: number;
  rejectedCount: number;
  shortfallCount: number;
  rejectionExampleCount: number;
};

const FEATURE_VALID_TERRAIN_TYPE_INDICES = CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices as
  Record<string, readonly number[] | undefined>;
const POLAR_WATER_ROWS = Math.max(0, CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows | 0);
const FEATURE_POLICIES = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
  string,
  { placementClass?: string; naturalWonderTiles?: number; naturalWonderDirection?: number } | undefined
>;

function getValidTerrainTypesForFeature(featureType: number): readonly number[] {
  const terrainTypes = FEATURE_VALID_TERRAIN_TYPE_INDICES[String(featureType | 0)];
  return Array.isArray(terrainTypes) ? terrainTypes : [];
}

function ensureFeatureValidTerrain(
  adapter: ExtendedMapContext["adapter"],
  x: number,
  y: number,
  height: number,
  featureType: number
): "unchanged" | "adjusted" | "blocked" {
  const validTerrainTypes = getValidTerrainTypesForFeature(featureType);
  if (validTerrainTypes.length === 0) return "blocked";
  if (y < POLAR_WATER_ROWS || y >= height - POLAR_WATER_ROWS) return "blocked";

  const currentTerrain = adapter.getTerrainType(x, y) | 0;
  if (validTerrainTypes.includes(currentTerrain)) return "unchanged";

  const targetTerrain = validTerrainTypes[0];
  if (!Number.isFinite(targetTerrain) || targetTerrain < 0) return "blocked";

  adapter.setTerrainType(x, y, targetTerrain | 0);
  return "adjusted";
}

/**
 * Materializes natural-wonder intent as the product owned by
 * `place-natural-wonders`.
 *
 * Natural wonders are not a final-placement side effect anymore: the planner
 * publishes deterministic intent, this step applies it once, and downstream
 * steps consume the published evidence. Corrupt plans still fail hard, but
 * adapter legality shortfalls are measured as placement outcomes instead of
 * killing otherwise playable map generation.
 */
export function stampNaturalWondersFromPlan({
  adapter,
  width,
  height,
  wonders,
  requestedCount,
}: StampNaturalWondersFromPlanArgs): NaturalWonderStampingStats {
  if ((wonders.width | 0) !== (width | 0) || (wonders.height | 0) !== (height | 0)) {
    throw new Error(
      `[Placement] Natural wonder plan dimensions ${wonders.width}x${wonders.height} do not match map ${width}x${height}.`
    );
  }
  const plannedCount = wonders.placements.length;
  const declaredPlannedCount = Math.max(0, wonders.plannedCount | 0);
  const targetCount = Math.max(0, wonders.targetCount | 0);
  if (declaredPlannedCount !== plannedCount) {
    throw new Error(
      `[Placement] Natural wonder plan metadata mismatch (plannedCount=${declaredPlannedCount}, placements=${plannedCount}).`
    );
  }
  const requested = Math.max(
    0,
    Number.isFinite(requestedCount) ? (requestedCount as number) | 0 : targetCount
  );
  const effectiveTargetCount = Math.max(targetCount, requested);
  const shortfallCount = Math.max(0, effectiveTargetCount - plannedCount);

  let placedCount = 0;
  let terrainAdjustedCount = 0;
  let skippedOutOfBoundsCount = 0;
  let rejectedCount = 0;
  const rejectionDetails: string[] = [];

  for (const placementPlan of wonders.placements) {
    if (!Number.isFinite(placementPlan.plotIndex)) {
      throw new Error(
        `[Placement] Natural wonder placement has invalid plotIndex (${String(placementPlan.plotIndex)}).`
      );
    }
    const plotIndex = placementPlan.plotIndex | 0;
    if (plotIndex < 0 || plotIndex >= width * height) {
      skippedOutOfBoundsCount += 1;
      rejectionDetails.push(`feature=${placementPlan.featureType} plot=${plotIndex} reason=out-of-bounds`);
      continue;
    }

    if (!Number.isFinite(placementPlan.featureType) || !Number.isFinite(placementPlan.direction)) {
      throw new Error(
        `[Placement] Natural wonder placement at plot ${plotIndex} has invalid feature metadata (featureType=${String(placementPlan.featureType)}, direction=${String(placementPlan.direction)}).`
      );
    }
    if (placementPlan.elevation !== undefined && !Number.isFinite(placementPlan.elevation)) {
      throw new Error(
        `[Placement] Natural wonder placement at plot ${plotIndex} has invalid elevation (${String(placementPlan.elevation)}).`
      );
    }

    const featureType = Math.trunc(placementPlan.featureType);
    const direction = Math.trunc(placementPlan.direction);
    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    const footprint = getNaturalWonderFootprintIndices({
      x,
      y,
      width,
      height,
      policy: FEATURE_POLICIES[String(featureType)] ?? {},
      direction,
    });
    if (!footprint) {
      rejectedCount += 1;
      rejectionDetails.push(`feature=${featureType} plot=${plotIndex} reason=unsupported-footprint`);
      continue;
    }
    let footprintBlocked = false;
    let blockedReason = "unknown";
    for (const footprintPlotIndex of footprint) {
      const fy = (footprintPlotIndex / width) | 0;
      const fx = footprintPlotIndex - fy * width;
      if ((adapter.getFeatureType(fx, fy) | 0) !== (adapter.NO_FEATURE | 0)) {
        footprintBlocked = true;
        blockedReason = `occupied:${footprintPlotIndex}`;
        break;
      }
      const terrainStatus = ensureFeatureValidTerrain(adapter, fx, fy, height, featureType);
      if (terrainStatus === "blocked") {
        footprintBlocked = true;
        blockedReason = `terrain-policy:${footprintPlotIndex}`;
        break;
      }
      if (terrainStatus === "adjusted") terrainAdjustedCount += 1;
    }
    if (footprintBlocked) {
      rejectedCount += 1;
      rejectionDetails.push(`feature=${featureType} plot=${plotIndex} reason=${blockedReason}`);
      continue;
    }
    const placed = adapter.stampNaturalWonder(
      x,
      y,
      featureType,
      direction,
      Number.isFinite(placementPlan.elevation) ? placementPlan.elevation : undefined
    );
    if (!placed) {
      rejectedCount += 1;
      rejectionDetails.push(`feature=${featureType} plot=${plotIndex} reason=adapter-rejected`);
      continue;
    }
    let readbackMismatch = false;
    for (const footprintPlotIndex of footprint) {
      const fy = (footprintPlotIndex / width) | 0;
      const fx = footprintPlotIndex - fy * width;
      if ((adapter.getFeatureType(fx, fy) | 0) !== featureType) {
        readbackMismatch = true;
        break;
      }
    }
    if (readbackMismatch) {
      rejectedCount += 1;
      rejectionDetails.push(`feature=${featureType} plot=${plotIndex} reason=readback-mismatch`);
    } else placedCount += 1;
  }

  return {
    plannedCount,
    targetCount: effectiveTargetCount,
    placedCount,
    terrainAdjustedCount,
    skippedOutOfBoundsCount,
    rejectedCount,
    shortfallCount,
    rejectionExamples: rejectionDetails.slice(0, 8),
  };
}

export function normalizeNaturalWonderStampingStats(
  stats: DeepReadonly<NaturalWonderStampingStats>
): NaturalWonderStampingStats {
  const plannedCount = Math.max(0, stats.plannedCount | 0);
  const targetCount = Math.max(
    plannedCount,
    "targetCount" in stats
      ? ((stats as { targetCount?: number }).targetCount ?? 0) | 0
      : plannedCount
  );
  const placedCount = Math.max(0, stats.placedCount | 0);
  const terrainAdjustedCount = Math.max(
    0,
    "terrainAdjustedCount" in stats
      ? ((stats as { terrainAdjustedCount?: number }).terrainAdjustedCount ?? 0) | 0
      : 0
  );
  const skippedOutOfBoundsCount = Math.max(0, stats.skippedOutOfBoundsCount | 0);
  const rejectedCount = Math.max(0, stats.rejectedCount | 0);
  const shortfallCount = Math.max(
    0,
    "shortfallCount" in stats
      ? ((stats as { shortfallCount?: number }).shortfallCount ?? 0) | 0
      : targetCount - plannedCount
  );
  const rawRejectionExamples = (stats as { rejectionExamples?: unknown }).rejectionExamples;
  const rejectionExamples = Array.isArray(rawRejectionExamples)
    ? rawRejectionExamples.map(String).slice(0, 8)
    : [];
  return {
    plannedCount,
    targetCount,
    placedCount,
    terrainAdjustedCount,
    skippedOutOfBoundsCount,
    rejectedCount,
    shortfallCount,
    rejectionExamples,
  };
}

export function buildNaturalWonderPlacementRuntimeTelemetry(
  stats: DeepReadonly<NaturalWonderStampingStats>
): NaturalWonderPlacementRuntimeTelemetry {
  const normalized = normalizeNaturalWonderStampingStats(stats);
  return {
    version: 1,
    plannedCount: normalized.plannedCount,
    targetCount: normalized.targetCount,
    placedCount: normalized.placedCount,
    terrainAdjustedCount: normalized.terrainAdjustedCount,
    skippedOutOfBoundsCount: normalized.skippedOutOfBoundsCount,
    rejectedCount: normalized.rejectedCount,
    shortfallCount: normalized.shortfallCount,
    rejectionExampleCount: normalized.rejectionExamples.length,
  };
}

export function logNaturalWonderPlacementRuntimeTelemetry(
  stats: DeepReadonly<NaturalWonderStampingStats>
): void {
  console.log(
    `[SWOOPER_MOD] NATURAL_WONDER_PLACEMENT_V1 ${JSON.stringify(
      buildNaturalWonderPlacementRuntimeTelemetry(stats)
    )}`
  );
}
