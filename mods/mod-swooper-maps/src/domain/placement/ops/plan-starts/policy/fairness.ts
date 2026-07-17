import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import type { RelaxationEntry, SeatSelection, SelectableTile } from "./selection-ladder.js";

/**
 * Fairness balancing pass (placement-realignment S4, target card step 7,
 * precedent: ecology/resources/score-balance).
 *
 * Builds the cross-start parity frame on the published 0..1 scores and, while
 * the worst-pair gap exceeds the tolerance, deterministically applies the
 * cheapest recorded move:
 *
 *   1. upgrade the weakest seat within its own regional pool;
 *   2. level the strongest seat DOWN within its regional pool to the best
 *      unused plot inside the tolerance band (parity by leveling — the rung
 *      stays regional, the quality sacrifice is recorded as a quality
 *      relaxation);
 *   3. only as a last resort, upgrade the weakest seat across regions — the
 *      seat degrades to the open-pool rung and a region relaxation is
 *      recorded, never silently.
 *
 * Every move respects the hard spacing floor. Swap iteration follows the
 * existing (score, plotIndex) tie-break order, so identical inputs reproduce
 * identical swaps and an identical report.
 */

export type FairnessSwap = {
  seatIndex: number;
  fromPlotIndex: number;
  toPlotIndex: number;
  fromScore: number;
  toScore: number;
};

export type FairnessOutcome = {
  worstPairGap: number | null;
  balanced: boolean;
  swaps: FairnessSwap[];
  relaxations: RelaxationEntry[];
};

const MAX_FAIRNESS_SWAPS = 8;

function worstPairGapOf(selections: readonly SeatSelection[]): number | null {
  const scores = selections
    .filter((entry) => entry.tile !== null)
    .map((entry) => entry.tile!.score);
  if (scores.length < 2) return null;
  return Math.max(...scores) - Math.min(...scores);
}

/**
 * Balances the mutable seat selections toward the configured score-gap tolerance with at most
 * eight deterministic swaps. Regional upgrades are preferred, the hard spacing floor is
 * preserved, and every cross-region or quality concession is returned as typed relaxation
 * evidence.
 */
export function balanceFairness(args: {
  selections: SeatSelection[];
  /**
   * Ordered pools a seat may swap into (earlier pools preferred): regional
   * candidates first and the full candidate pool second for regional seats,
   * the full candidate pool alone otherwise. A swap taken from a later,
   * cross-region pool degrades the seat to the open-pool rung and records a
   * region relaxation.
   */
  swapPoolsOf: (selection: SeatSelection) => ReadonlyArray<readonly SelectableTile[]>;
  width: number;
  spacingFloorTiles: number;
  tolerance: number;
}): FairnessOutcome {
  const swaps: FairnessSwap[] = [];
  const relaxations: RelaxationEntry[] = [];
  const used = new Set<number>();
  for (const entry of args.selections) {
    if (entry.tile) used.add(entry.tile.plotIndex);
  }

  let gap = worstPairGapOf(args.selections);

  const minDistanceToOthers = (subject: SeatSelection, plotIndex: number): number => {
    let best = Infinity;
    for (const entry of args.selections) {
      if (entry === subject || !entry.tile) continue;
      const dist = hexDistanceOddQPeriodicX(plotIndex, entry.tile.plotIndex, args.width);
      if (dist < best) best = dist;
    }
    return best;
  };

  /** Best unused tile in `pool` for `subject` with score inside (minScore, maxScore]. */
  const bestInBand = (
    subject: SeatSelection,
    pool: readonly SelectableTile[],
    minScoreExclusive: number,
    maxScoreInclusive: number
  ): SelectableTile | null => {
    let best: SelectableTile | null = null;
    for (const tile of pool) {
      if (used.has(tile.plotIndex)) continue;
      if (tile.score <= minScoreExclusive || tile.score > maxScoreInclusive) continue;
      if (minDistanceToOthers(subject, tile.plotIndex) < args.spacingFloorTiles) continue;
      if (
        !best ||
        tile.score > best.score ||
        (tile.score === best.score && tile.plotIndex < best.plotIndex)
      ) {
        best = tile;
      }
    }
    return best;
  };

  const applySwap = (subject: SeatSelection, replacement: SelectableTile): void => {
    const currentSpacing = minDistanceToOthers(subject, subject.tile!.plotIndex);
    const newSpacing = minDistanceToOthers(subject, replacement.plotIndex);
    if (Number.isFinite(currentSpacing) && newSpacing < currentSpacing) {
      relaxations.push({
        seatIndex: subject.seat.seatIndex,
        kind: "spacing",
        from: currentSpacing,
        to: newSpacing,
      });
    }
    swaps.push({
      seatIndex: subject.seat.seatIndex,
      fromPlotIndex: subject.tile!.plotIndex,
      toPlotIndex: replacement.plotIndex,
      fromScore: subject.tile!.score,
      toScore: replacement.score,
    });
    used.delete(subject.tile!.plotIndex);
    used.add(replacement.plotIndex);
    subject.tile = replacement;
  };

  while (gap !== null && gap > args.tolerance && swaps.length < MAX_FAIRNESS_SWAPS) {
    let weakest: SeatSelection | null = null;
    let strongest: SeatSelection | null = null;
    for (const entry of args.selections) {
      if (!entry.tile) continue;
      if (
        !weakest ||
        entry.tile.score < weakest.tile!.score ||
        (entry.tile.score === weakest.tile!.score && entry.seat.seatIndex < weakest.seat.seatIndex)
      ) {
        weakest = entry;
      }
      if (
        !strongest ||
        entry.tile.score > strongest.tile!.score ||
        (entry.tile.score === strongest.tile!.score &&
          entry.seat.seatIndex < strongest.seat.seatIndex)
      ) {
        strongest = entry;
      }
    }
    if (!weakest?.tile || !strongest?.tile) break;

    const weakestPools = args.swapPoolsOf(weakest);

    // 1. Upgrade the weakest seat within its own (first/regional) pool.
    const regionalUpgrade = weakestPools.length
      ? bestInBand(weakest, weakestPools[0]!, weakest.tile.score, Number.POSITIVE_INFINITY)
      : null;
    if (regionalUpgrade) {
      applySwap(weakest, regionalUpgrade);
      gap = worstPairGapOf(args.selections);
      continue;
    }

    // 2. Level the strongest seat down into the tolerance band, staying regional.
    const band = weakest.tile.score + args.tolerance;
    const strongestPools = args.swapPoolsOf(strongest);
    const leveled = strongestPools.length
      ? bestInBand(strongest, strongestPools[0]!, weakest.tile.score, band)
      : null;
    if (leveled && leveled.score < strongest.tile.score) {
      relaxations.push({
        seatIndex: strongest.seat.seatIndex,
        kind: "quality",
        from: strongest.tile.score,
        to: leveled.score,
      });
      applySwap(strongest, leveled);
      gap = worstPairGapOf(args.selections);
      continue;
    }

    // 3. Last resort: upgrade the weakest seat across regions (open-pool rung).
    let crossRegion: SelectableTile | null = null;
    for (const pool of weakestPools.slice(1)) {
      crossRegion = bestInBand(weakest, pool, weakest.tile.score, Number.POSITIVE_INFINITY);
      if (crossRegion) break;
    }
    if (!crossRegion) break;
    if (crossRegion.regionSlot !== weakest.seat.regionSlot && weakest.rung === "regional") {
      relaxations.push({
        seatIndex: weakest.seat.seatIndex,
        kind: "region",
        from: weakest.seat.regionSlot,
        to: crossRegion.regionSlot,
      });
      weakest.rung = "open-pool";
    }
    applySwap(weakest, crossRegion);
    gap = worstPairGapOf(args.selections);
  }

  return {
    worstPairGap: gap,
    balanced: gap === null || gap <= args.tolerance,
    swaps,
    relaxations,
  };
}
