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
  placedCount: number;
  skippedOutOfBoundsCount: number;
  rejectedCount: number;
};

/**
 * Materializes natural-wonder intent as the product owned by
 * `place-natural-wonders`.
 *
 * Natural wonders are not a final-placement side effect anymore: the planner
 * publishes deterministic intent, this step applies it once, and downstream
 * steps consume the published evidence. The all-or-nothing checks prevent
 * maintenance or final summary code from becoming hidden recovery paths.
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
  if (plannedCount < targetCount) {
    throw new Error(
      `[Placement] Natural wonder plan cannot satisfy target count (target=${targetCount}, planned=${plannedCount}).`
    );
  }
  const requested = Math.max(
    0,
    Number.isFinite(requestedCount) ? (requestedCount as number) | 0 : targetCount
  );
  if (requested !== plannedCount) {
    throw new Error(
      `[Placement] Natural wonder planner could not meet requested count (requested ${requested}, planned ${plannedCount}).`
    );
  }

  let placedCount = 0;
  let skippedOutOfBoundsCount = 0;
  let rejectedCount = 0;

  for (const placementPlan of wonders.placements) {
    if (!Number.isFinite(placementPlan.plotIndex)) {
      throw new Error(
        `[Placement] Natural wonder placement has invalid plotIndex (${String(placementPlan.plotIndex)}).`
      );
    }
    const plotIndex = placementPlan.plotIndex | 0;
    if (plotIndex < 0 || plotIndex >= width * height) {
      skippedOutOfBoundsCount += 1;
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

    const y = (plotIndex / width) | 0;
    const x = plotIndex - y * width;
    const placed = adapter.stampNaturalWonder(
      x,
      y,
      Math.trunc(placementPlan.featureType),
      Math.trunc(placementPlan.direction),
      Number.isFinite(placementPlan.elevation) ? placementPlan.elevation : undefined
    );
    if (placed) placedCount += 1;
    else rejectedCount += 1;
  }

  if (placedCount !== plannedCount || skippedOutOfBoundsCount > 0 || rejectedCount > 0) {
    throw new Error(
      `[Placement] Failed to stamp all natural wonders (placed ${placedCount}/${plannedCount}, target=${targetCount}, outOfBounds=${skippedOutOfBoundsCount}, rejected=${rejectedCount}).`
    );
  }

  return {
    plannedCount,
    placedCount,
    skippedOutOfBoundsCount,
    rejectedCount,
  };
}

export function normalizeNaturalWonderStampingStats(
  stats: DeepReadonly<NaturalWonderStampingStats>
): NaturalWonderStampingStats {
  const plannedCount = Math.max(0, stats.plannedCount | 0);
  const placedCount = Math.max(0, stats.placedCount | 0);
  const skippedOutOfBoundsCount = Math.max(0, stats.skippedOutOfBoundsCount | 0);
  const rejectedCount = Math.max(0, stats.rejectedCount | 0);
  if (placedCount !== plannedCount || skippedOutOfBoundsCount > 0 || rejectedCount > 0) {
    throw new Error(
      `[Placement] Natural wonder placement artifact is not fully satisfied (placed ${placedCount}/${plannedCount}, outOfBounds=${skippedOutOfBoundsCount}, rejected=${rejectedCount}).`
    );
  }
  return {
    plannedCount,
    placedCount,
    skippedOutOfBoundsCount,
    rejectedCount,
  };
}
