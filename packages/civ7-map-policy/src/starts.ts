/**
 * Civ7 start-distribution policy primitives.
 *
 * Pure, deterministic, zero-dependency helpers that encode how Civ7 wants
 * homeland starts distributed:
 *   - two balanced homeland hemispheres (engine WEST/EAST LandmassRegionId),
 *   - players apportioned to each hemisphere in proportion to its real
 *     settleable capacity, clamped to spacing feasibility,
 *   - the official fixed spacing buffers (g_Required / g_Desired).
 *
 * The mod's `plan-starts` op COMPOSES these; this package owns no orchestration
 * and — being `kind:library` — no engine/grid adjacency. Hex distances are
 * computed by the caller (engine odd-R model) and passed into `dispersionTerm`,
 * so the adjacency model stays owned by the engine substrate, not duplicated
 * here.
 *
 * Why this exists: a fixed width/2 partition + fixed 4/4 player split crowds
 * half the civs into one small landmass whenever morphology is asymmetric.
 * Background + math: docs/projects/start-distribution-homeland-rebalance/design.md.
 */

export const HOMELAND_REGION_WEST = 1;
export const HOMELAND_REGION_EAST = 2;
export type HomelandRegionSlot = typeof HOMELAND_REGION_WEST | typeof HOMELAND_REGION_EAST;

/** Local clamp (foundation is zero-dep; no mapgen-core import). */
function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/**
 * Official Civ7 start-placement policy facts plus the rebalance tunables. The
 * spacing buffers are the engine's FIXED g_Required / g_Desired (not map-size
 * scaled). `balanceBias` and `spacingFootprintFactor` are this mod's rebalance
 * tunables, calibrated against the S2 baseline in S7.
 */
export const CIV7_START_PLACEMENT_POLICY_V0 = {
  version: 0,
  /** Civ7's homeland model is two hemispheres (WEST/EAST). */
  homelandRegionCount: 2,
  /** Hard minimum spacing between starts (official g_Required). */
  requiredSpacingTiles: 6,
  /** Desired spacing; the spacing score tapers up to here (official g_Desired). */
  desiredSpacingTiles: 12,
  /**
   * Player-allocation blend: 0 = pure capacity-proportional, 1 = equal split.
   * Civ7 prefers near-equal homelands WHEN FEASIBLE; feasibility (the ceiling)
   * always overrides this bias.
   */
  balanceBias: 0.5,
  /**
   * Approx. settleable tiles one start "occupies" per unit of spacing-floor²,
   * used only for the feasibility CEILING (max starts a region can hold).
   * Hex min-distance packing area ≈ (√3/2)·d²; this factor is intentionally
   * generous (ceiling is a guard, not a hard quota).
   */
  spacingFootprintFactor: 0.75,
  source: ["Base/modules/base-standard/maps/assign-starting-plots.js (g_Required/g_Desired)"],
  rationale:
    "Civ7 splits starts across two homeland hemispheres at fixed 6/12 spacing; this mod additionally apportions players to homelands by real settleable capacity so asymmetric morphology cannot crowd half the civs into one small landmass.",
} as const;

/** Settleable-tile footprint of one start at the given spacing floor (>= 1). */
export function startFootprintTiles(
  spacingFloorTiles: number,
  footprintFactor: number = CIV7_START_PLACEMENT_POLICY_V0.spacingFootprintFactor
): number {
  const d = Math.max(0, spacingFloorTiles);
  return Math.max(1, Math.round(footprintFactor * d * d));
}

/**
 * Max well-spaced starts a region of `settleableTiles` can host at the floor.
 * An area/footprint approximation (region SHAPE is ignored): a soft ceiling the
 * selection ladder still validates exactly. 0 settleable tiles → 0; any
 * non-empty region → ≥ 1 (a single start needs no mutual spacing, so the
 * footprint divisor must not zero out a small-but-real homeland).
 */
export function feasibleStartCeiling(
  settleableTiles: number,
  spacingFloorTiles: number,
  footprintFactor?: number
): number {
  if (settleableTiles <= 0) return 0;
  const footprint = startFootprintTiles(spacingFloorTiles, footprintFactor);
  return Math.max(1, Math.floor(settleableTiles / footprint));
}

/**
 * Offset of the meridian that best halves settleable land across the X-wrapping
 * map. The west homeland is the half-width column band [offset, offset+⌊w/2⌋);
 * the east homeland is the rest. Replaces a fixed width/2 midline so two
 * asymmetric-but-real homelands stay as balanced as the land allows.
 *
 * Slides a half-map window over the circular per-column land histogram and picks
 * the rotation minimizing |west − total/2|. O(width); deterministic (lowest
 * offset wins ties). `imbalance` is the residual |west − total/2| / total (0 =
 * perfectly halved; large when one landmass exceeds half the land — D2
 * allocation absorbs that residual).
 *
 * @param columnWeights settleable-land tile count per X column (length width)
 */
export function balancedHemisphereMeridian(
  columnWeights: ArrayLike<number>,
  width: number
): { meridianOffset: number; westWeight: number; imbalance: number } {
  const w = Math.max(0, width | 0);
  if (w <= 0) return { meridianOffset: 0, westWeight: 0, imbalance: 0 };
  const col = (x: number): number => Math.max(0, columnWeights[x] ?? 0);

  let total = 0;
  for (let x = 0; x < w; x++) total += col(x);
  const half = Math.max(1, Math.floor(w / 2)); // west band width (columns)

  let windowWeight = 0;
  for (let x = 0; x < half; x++) windowWeight += col(x);
  let bestOffset = 0;
  let bestWindow = windowWeight;
  let bestDiff = Math.abs(windowWeight - total / 2);

  for (let m = 1; m < w; m++) {
    // Slide [m-1, m-1+half) → [m, m+half): drop the trailing column, add the leading one.
    windowWeight -= col((m - 1) % w);
    windowWeight += col((m - 1 + half) % w);
    const diff = Math.abs(windowWeight - total / 2);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestOffset = m;
      bestWindow = windowWeight;
    }
  }

  return {
    meridianOffset: bestOffset,
    westWeight: bestWindow,
    imbalance: total > 0 ? bestDiff / total : 0,
  };
}

/** Homeland slot (1=west, 2=east) of a column given the balanced meridian. */
export function hemisphereSlotForColumn(
  columnX: number,
  meridianOffset: number,
  width: number
): HomelandRegionSlot {
  const w = Math.max(1, width | 0);
  const half = Math.max(1, Math.floor(w / 2));
  const rel = (((columnX - meridianOffset) % w) + w) % w;
  return rel < half ? HOMELAND_REGION_WEST : HOMELAND_REGION_EAST;
}

export type StartApportionmentInput = {
  /** Per-region capacity weights (e.g. settleable tiles, viability-weighted). */
  capacities: ReadonlyArray<number>;
  /** Optional per-region hard ceilings (e.g. feasibleStartCeiling per region). */
  ceilings?: ReadonlyArray<number>;
  /** Total players to seat. */
  total: number;
  /** 0 = capacity-proportional, 1 = equal split. Defaults to policy balanceBias. */
  balanceBias?: number;
};

/**
 * Apportion `total` starts across regions ∝ capacity, blended toward an equal
 * split by `balanceBias`, then clamped to per-region ceilings with the overflow
 * redistributed to regions that still have room. Uses largest-remainder
 * (Hamilton) rounding so the integer counts sum exactly; deterministic ties
 * (larger fractional remainder first, then lower index).
 *
 * Returns integer counts whose sum is `min(total, Σ ceilings)`. Any remainder
 * that no region can feasibly hold is left unallocated — the caller records it
 * as a shortfall rather than this primitive forcing an over-subscribed region.
 */
export function apportionStartsByCapacity(input: StartApportionmentInput): number[] {
  const n = input.capacities.length;
  const out = new Array<number>(n).fill(0);
  const total = Math.max(0, Math.floor(input.total));
  if (n === 0 || total === 0) return out;

  const bias = clamp01(input.balanceBias ?? CIV7_START_PLACEMENT_POLICY_V0.balanceBias);
  const equalShare = total / n;
  const capSum = input.capacities.reduce((sum, c) => sum + Math.max(0, c), 0);

  // Blended real-valued targets (proportional ↔ equal).
  const targets = input.capacities.map((c) => {
    const proportional = capSum > 0 ? (total * Math.max(0, c)) / capSum : equalShare;
    return (1 - bias) * proportional + bias * equalShare;
  });

  // Largest-remainder rounding to a sum of exactly `total`.
  let assigned = 0;
  for (let i = 0; i < n; i++) {
    out[i] = Math.floor(targets[i]!);
    assigned += out[i]!;
  }
  let remaining = total - assigned;
  const byRemainder = targets
    .map((t, i) => ({ i, frac: t - Math.floor(t) }))
    .sort((a, b) => (b.frac !== a.frac ? b.frac - a.frac : a.i - b.i));
  for (let k = 0; k < byRemainder.length && remaining > 0; k++) {
    out[byRemainder[k]!.i]! += 1;
    remaining -= 1;
  }

  const ceilings = input.ceilings;
  if (!ceilings) return out;

  // Clamp to ceilings, then redistribute overflow to spare-ceiling regions,
  // ranked by remaining capacity (deterministic). Stops when placed or all full
  // (leftover = caller's recorded shortfall).
  let overflow = 0;
  for (let i = 0; i < n; i++) {
    const cap = Math.max(0, Math.floor(ceilings[i] ?? 0));
    if (out[i]! > cap) {
      overflow += out[i]! - cap;
      out[i] = cap;
    }
  }
  while (overflow > 0) {
    const spare: Array<{ i: number; capacity: number }> = [];
    for (let i = 0; i < n; i++) {
      const cap = Math.max(0, Math.floor(ceilings[i] ?? 0));
      if (out[i]! < cap) spare.push({ i, capacity: Math.max(0, input.capacities[i] ?? 0) });
    }
    if (spare.length === 0) break;
    spare.sort((a, b) => (b.capacity !== a.capacity ? b.capacity - a.capacity : a.i - b.i));
    let placed = 0;
    for (const region of spare) {
      if (overflow <= 0) break;
      out[region.i]! += 1;
      overflow -= 1;
      placed += 1;
    }
    if (placed === 0) break;
  }
  return out;
}

/**
 * 0..1 spread reward for a candidate whose nearest already-seated start is
 * `nearestDistanceTiles` away (caller computes the engine odd-R hex distance).
 * Saturates at the desired spacing; returns 1 when no start is seated yet (the
 * first seat in a region is maximally free to spread).
 */
export function dispersionTerm(
  nearestDistanceTiles: number | null,
  desiredSpacingTiles: number = CIV7_START_PLACEMENT_POLICY_V0.desiredSpacingTiles
): number {
  if (nearestDistanceTiles == null) return 1;
  const d = Math.max(0, desiredSpacingTiles);
  if (d <= 0) return 1;
  return clamp01(nearestDistanceTiles / d);
}
