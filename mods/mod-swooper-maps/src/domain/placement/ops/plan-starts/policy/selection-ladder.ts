import { dispersionTerm } from "@civ7/map-policy";
import { clamp01 } from "@swooper/mapgen-core";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import type { SeatIdentity } from "./seat-identity.js";
import type { SeatBias, SeatBiasContext } from "./start-bias.js";
import { seatBiasTerm } from "./start-bias.js";

/**
 * Four-rung start selection ladder (placement-realignment S4, target card):
 *
 *   regional → open-pool → quality-relaxed → spacing-relaxed
 *
 * Never throws. Every rung is scored (the last resort ranks by the same
 * blended quality function, never by pure distance), every spacing/region/
 * quality relaxation is recorded, and a seat that cannot be placed at all is
 * returned as an unseated record (plotIndex -1) instead of an exception.
 *
 * Spacing semantics: selection starts at desiredSpacingTiles (score taper
 * target) and relaxes one tile at a time down to spacingFloorTiles (official
 * 6-tile required buffer) with each step recorded. Only the spacing-relaxed
 * last-resort rung may go below the hard floor, and only because the
 * alternative is an unseated player — recorded loudly per seat.
 */

export type StartComponents = {
  freshwater: number;
  fertility: number;
  expansion: number;
  climate: number;
  resource: number;
  roughness: number;
};

export type SelectableTile = {
  plotIndex: number;
  regionSlot: 1 | 2;
  tier: "primary" | "islandCluster" | "marginal" | "none";
  score: number;
  components: StartComponents;
};

export type SeatRung = "regional" | "open-pool" | "quality-relaxed" | "spacing-relaxed";

export type RelaxationEntry = {
  seatIndex: number;
  kind: "spacing" | "region" | "quality";
  from: number;
  to: number;
};

export type SeatSelection = {
  seat: SeatIdentity;
  tile: SelectableTile | null;
  rung: SeatRung;
};

export type SelectionLadderResult = {
  selections: SeatSelection[];
  relaxations: RelaxationEntry[];
};

const TIER_ORDER = ["primary", "islandCluster", "marginal", "none"] as const;

/** Maps an admitted start tier to its stable quality rank; `none` remains the last resort. */
export function tierValue(tier: SelectableTile["tier"]): number {
  if (tier === "primary") return 3;
  if (tier === "islandCluster") return 2;
  if (tier === "marginal") return 1;
  return 0;
}

/**
 * Orders start candidates by admitted terrain tier, then descending blended quality, then
 * ascending plot index. The final plot-index tie-break makes candidate order reproducible
 * across runtimes.
 */
export function compareSelectableTiles(a: SelectableTile, b: SelectableTile): number {
  const tierDiff = tierValue(b.tier) - tierValue(a.tier);
  if (tierDiff !== 0) return tierDiff;
  if (b.score !== a.score) return b.score - a.score;
  return a.plotIndex - b.plotIndex;
}

type LadderArgs = {
  seats: readonly SeatIdentity[];
  /** Tier-admitted candidates, any order (sorted internally). */
  candidates: readonly SelectableTile[];
  /**
   * Scored settleable tiles that failed tier admission (tier "none"),
   * used by the quality-relaxed and spacing-relaxed rungs.
   */
  reserve: readonly SelectableTile[];
  width: number;
  spacingFloorTiles: number;
  desiredSpacingTiles: number;
  rankingBlend: number;
  startBiasWeight: number;
  seatBiasOf: (seatIndex: number) => SeatBias | undefined;
  biasContextOf: (plotIndex: number) => SeatBiasContext;
  /**
   * Settleable-land tiles per working selection region (D3). When a region has room to
   * spread (more land per seat than the fixed desired buffer covers), the
   * dispersion reward saturates at the even-dispersion distance rather than the
   * fixed buffer — recovering global spread without lowering the spacing floor.
   */
  landByRegion?: { 1: number; 2: number };
};

/**
 * Seats players through the regional, open-pool, quality-relaxed, and spacing-relaxed rungs
 * without throwing. It preserves unique plots, records every relaxation, and returns an
 * explicit unseated entry when even the deterministic last-resort pool cannot place a seat.
 */
export function runSelectionLadder(args: LadderArgs): SelectionLadderResult {
  const floor = Math.max(0, args.spacingFloorTiles | 0);
  const desired = Math.max(floor, args.desiredSpacingTiles | 0);
  const blend = clamp01(args.rankingBlend);

  const candidates = [...args.candidates].sort(compareSelectableTiles);
  const reserve = [...args.reserve].sort(compareSelectableTiles);

  // D3 dispersion target per region: the even-dispersion distance for the seats
  // this region will hold over its land area (sqrt of area-per-seat), clamped so
  // the reward never saturates below the desired buffer and never pushes past
  // 1.5x it into worse land. A single-seat region keeps the fixed desired buffer.
  const seatsPerRegion: Record<1 | 2, number> = { 1: 0, 2: 0 };
  for (const seat of args.seats) {
    seatsPerRegion[seat.selectionRegionSlot] += 1;
  }
  const dispersionTargetFor = (slot: 1 | 2): number => {
    const land = args.landByRegion?.[slot] ?? 0;
    const seats = seatsPerRegion[slot];
    if (land <= 0 || seats <= 1) return desired;
    const idealEven = Math.sqrt(land / seats);
    return Math.max(desired, Math.min(idealEven, desired * 1.5));
  };
  let activeDispersionTarget = desired;

  const used = new Set<number>();
  const seatedPlots: number[] = [];
  const relaxations: RelaxationEntry[] = [];
  const selections: SeatSelection[] = [];

  const minDistanceToSeated = (plotIndex: number): number => {
    if (!seatedPlots.length) return Infinity;
    let best = Infinity;
    for (const other of seatedPlots) {
      const dist = hexDistanceOddQPeriodicX(plotIndex, other, args.width);
      if (dist < best) best = dist;
    }
    return best;
  };

  const pickBest = (
    seat: SeatIdentity,
    pool: readonly SelectableTile[],
    requirement: number
  ): SelectableTile | null => {
    let best: SelectableTile | null = null;
    let bestRank = Number.NEGATIVE_INFINITY;
    const bias = args.seatBiasOf(seat.seatIndex);
    for (const tile of pool) {
      if (used.has(tile.plotIndex)) continue;
      const distance = minDistanceToSeated(tile.plotIndex);
      if (distance < requirement) continue;
      const spacingScore = dispersionTerm(
        seatedPlots.length ? distance : null,
        activeDispersionTarget
      );
      const biasTerm =
        args.startBiasWeight > 0 && bias
          ? args.startBiasWeight * seatBiasTerm(bias, args.biasContextOf(tile.plotIndex))
          : 0;
      const rank = (tile.score + biasTerm) * blend + spacingScore * (1 - blend);
      if (
        rank > bestRank ||
        (rank === bestRank && tile.score > (best?.score ?? -1)) ||
        (rank === bestRank &&
          tile.score === (best?.score ?? -1) &&
          tile.plotIndex < (best?.plotIndex ?? Infinity))
      ) {
        best = tile;
        bestRank = rank;
      }
    }
    return best;
  };

  /** Relax spacing from `desired` down to `minRequirement`, recording each step. */
  const pickWithSpacingRelaxation = (
    seat: SeatIdentity,
    pool: readonly SelectableTile[],
    minRequirement: number
  ): SelectableTile | null => {
    for (let requirement = desired; requirement >= minRequirement; requirement--) {
      const tile = pickBest(seat, pool, requirement);
      if (tile) {
        for (let step = desired; step > requirement; step--) {
          relaxations.push({
            seatIndex: seat.seatIndex,
            kind: "spacing",
            from: step,
            to: step - 1,
          });
        }
        return tile;
      }
    }
    return null;
  };

  /** Tier-major pick: a higher tier at relaxed spacing beats a lower tier at desired spacing. */
  const pickTierMajor = (
    seat: SeatIdentity,
    pool: readonly SelectableTile[],
    minRequirement: number
  ): SelectableTile | null => {
    for (const tier of TIER_ORDER) {
      const tierPool = pool.filter((tile) => tile.tier === tier);
      if (!tierPool.length) continue;
      const tile = pickWithSpacingRelaxation(seat, tierPool, minRequirement);
      if (tile) return tile;
    }
    return null;
  };

  for (const seat of args.seats) {
    activeDispersionTarget = dispersionTargetFor(seat.selectionRegionSlot);
    const regionPool = candidates.filter((tile) => tile.regionSlot === seat.selectionRegionSlot);
    let rung: SeatRung = "regional";
    let tile = pickTierMajor(seat, regionPool, floor);

    if (!tile) {
      rung = "open-pool";
      tile = pickTierMajor(seat, candidates, floor);
      if (tile) {
        relaxations.push({
          seatIndex: seat.seatIndex,
          kind: "region",
          from: seat.selectionRegionSlot,
          to: tile.regionSlot,
        });
      }
    }

    if (!tile) {
      rung = "quality-relaxed";
      tile = pickTierMajor(seat, reserve, floor);
      if (tile) {
        relaxations.push({ seatIndex: seat.seatIndex, kind: "quality", from: 1, to: 0 });
      }
    }

    if (!tile) {
      rung = "spacing-relaxed";
      const fullPool = [...candidates, ...reserve];
      for (let requirement = Math.max(0, floor - 1); requirement >= 0; requirement--) {
        tile = pickBest(seat, fullPool, requirement);
        if (tile) {
          relaxations.push({
            seatIndex: seat.seatIndex,
            kind: "spacing",
            from: floor,
            to: requirement,
          });
          break;
        }
      }
    }

    if (tile) {
      used.add(tile.plotIndex);
      seatedPlots.push(tile.plotIndex);
    }
    selections.push({ seat, tile: tile ?? null, rung });
  }

  return { selections, relaxations };
}
