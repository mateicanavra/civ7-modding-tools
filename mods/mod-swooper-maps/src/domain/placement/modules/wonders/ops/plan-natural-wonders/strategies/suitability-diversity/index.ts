/**
 * plan-natural-wonders / suitability-diversity strategy — the pure natural-wonder planner.
 *
 * Selects a subset of the catalog's natural wonders for one map and assigns each
 * a primary anchor (plus fallback anchors), deterministically and with NO RNG.
 * It emits intent only; the `place-natural-wonders` step stamps it and the
 * engine is the final legality authority. The three passes:
 *
 *   1. per-tile suitability  — `suitabilityAt` scores each (requirement-group,
 *      tile) pair in [0,1] from forwarded physical signals (never recomputed).
 *   2. per-wonder ranking     — `isCandidateCompatibleWithFeature` keeps each
 *      wonder's constraint-passing tiles, sorted by suitability; the top score
 *      is the wonder's `bestSuitability`.
 *   3. cross-wonder selection — a diminishing-returns greedy (`effectiveScore` /
 *      `isBetterPick`) that decays repeat picks from the same requirement group,
 *      so the chosen set is a physically-grounded cross-TYPE mix that tracks the
 *      map's terrain instead of collapsing onto the most abundant group.
 *
 * BOUNDARY (load-bearing, `kind:plan`): this op imports only
 * `@swooper/mapgen-core`. It MUST NOT import `@civ7/map-policy` or the engine.
 * Footprint geometry crosses the boundary as contract DATA
 * (`footprintOffsetsByParity`, computed in plan-natural-wonders); the op
 * resolves odd-R parity at each concrete anchor via that data.
 *
 * Adjacency: the predicate neighborhood uses mapgen-core's
 * `getHexNeighborIndicesOddQ`, whose `OddQ` name is LEGACY — the implementation
 * is odd-R (keyed on `y & 1`) and live-calibrated to the engine, so hard
 * adjacency tags (ADJACENTMOUNTAIN) already match stamp-time legality. See the
 * system reference (§6).
 *
 * @see openspec/changes/natural-wonders-full-set-parity-suitability/workstream/natural-wonders-system-reference.md
 */

import {
  isAnyRiverClass,
  RIVER_CLASS_MAJOR,
} from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { getHexNeighborIndicesOddQ, hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import { NATURAL_WONDER_FALLBACK_LIMIT } from "../../../../model/atoms/natural-wonder-plan-intent.schema.js";
import {
  type GroupSuitabilitySignals,
  WONDER_GROUPS,
  type WonderGroup,
  wonderGroup,
} from "../../../../model/policy/natural-wonder-groups.js";
import PlanNaturalWondersContract from "../../contract.js";
import SuitabilityDiversityDefinition from "./config.js";

type Candidate = {
  plotIndex: number;
  relief: number;
  elevation: number;
};

type RankedCandidate = {
  candidate: Candidate;
  suitability: number;
};

type SelectedCandidate = RankedCandidate & {
  footprint: readonly number[];
};

type FootprintOffset = { dx: number; dy: number };
type FootprintOffsetsByParity = {
  even: readonly FootprintOffset[];
  odd: readonly FootprintOffset[];
};

type NaturalWonderFeatureCandidate = {
  readonly featureType: number;
  readonly direction: number;
  readonly placeFirst: boolean;
  readonly validTerrainTypes: readonly number[];
  readonly validBiomeTypes: readonly number[];
  readonly minimumElevation: number | null;
  readonly noLake: boolean;
  readonly featureTags: readonly string[];
  readonly footprintOffsetsByParity: FootprintOffsetsByParity;
};

/**
 * Runs the pure natural-wonder planner over admitted dimensioned inputs: ranks legal anchors by
 * physical suitability, then applies deterministic cross-group diversity and spacing. It uses no
 * RNG or engine access and preserves fallback anchors for materialization refusals.
 */
const suitabilityDiversity = createStrategy(
  PlanNaturalWondersContract,
  SuitabilityDiversityDefinition,
  {
    run: (input, config) => {
      const width = input.width;
      const height = input.height;
      const size = width * height;

      const wondersCount = input.wondersCount;
      const noFeatureType = input.noFeatureType;
      const featureCatalog = [...input.featureCatalog].sort((a, b) => {
        // Deterministic, stable catalog order (placeFirst first, then by
        // featureType). This only fixes iteration order; WHICH wonders place
        // and in what order is decided by the diminishing-returns greedy below
        // (argmax over effectiveScore), not by this sort.
        if (a.placeFirst !== b.placeFirst) return a.placeFirst ? -1 : 1;
        return a.featureType - b.featureType;
      });

      if (wondersCount <= 0 || featureCatalog.length === 0) {
        return {
          width,
          height,
          wondersCount,
          targetCount: 0,
          plannedCount: 0,
          placements: [],
        };
      }

      const reliefByTile = new Float32Array(size);
      let maxRelief = 0;
      for (let i = 0; i < size; i++) {
        const y = (i / width) | 0;
        const x = i - y * width;
        let minElev = input.elevation[i]!;
        let maxElev = minElev;
        for (const ni of getHexNeighborIndicesOddQ(x, y, width, height)) {
          const elev = input.elevation[ni]!;
          if (elev < minElev) minElev = elev;
          if (elev > maxElev) maxElev = elev;
        }
        const relief = Math.max(0, maxElev - minElev);
        reliefByTile[i] = relief;
        if (relief > maxRelief) maxRelief = relief;
      }

      const reliefScale = Math.max(1, maxRelief);

      const {
        vegetationDensity,
        effectiveMoisture,
        surfaceTemperature,
        fertility,
        discharge,
        slopeClass,
      } = input;

      let maxElevAbs = 1;
      let maxDischarge = 0;
      for (let i = 0; i < size; i++) {
        const e = Math.abs(input.elevation[i]!);
        if (e > maxElevAbs) maxElevAbs = e;
        const d = discharge[i]!;
        if (d > maxDischarge) maxDischarge = d;
      }
      const coastTerrainType = input.coastTerrainType;

      /**
       * Physical suitability of `candidate` for a wonder's requirement `group`, in
       * [0,1]. Builds the tile's normalized signal vector (relief, elev, aridity,
       * discharge/river, moisture, temperature bands, vegetation, fertility, slope,
       * coastal shelf vs deep water) from the forwarded truth signals, then delegates
       * to the group's pure formula in {@link WONDER_GROUPS} (whose weights are
       * load-bearing).
       *
       * This only RANKS tiles that already pass the hard constraints
       * (`isCandidateCompatibleWithFeature`); it never overrides legality. Its
       * outputs feed two decisions: the per-wonder tile sort and `bestSuitability`,
       * which ranks WHICH wonders are selected — so the selected set tracks terrain
       * (a mountainous map surfaces mountain wonders). Deterministic, no RNG: signal
       * values are seed-derived but the scoring is a pure function of them.
       */
      const suitabilityAt = (group: WonderGroup, candidate: Candidate): number => {
        const i = candidate.plotIndex;
        const relief = candidate.relief;
        const riverN = clamp01(input.riverClass[i]! / RIVER_CLASS_MAJOR);
        const temp = surfaceTemperature[i]!;
        const isWater = input.landMask[i] === 0;
        const isCoast = input.terrainType[i] === coastTerrainType;
        const signals: GroupSuitabilitySignals = {
          relief,
          elevN: clamp01(input.elevation[i]! / maxElevAbs),
          arid: clamp01(input.aridityIndex[i]!),
          warm: clamp01(temp / 35),
          temperate: clamp01(1 - Math.abs(temp - 15) / 20),
          vegN: clamp01(vegetationDensity[i]!),
          fertN: clamp01(fertility[i]!),
          dischN: maxDischarge > 0 ? clamp01(discharge[i]! / maxDischarge) : riverN,
          slopeN: clamp01(slopeClass[i]! / 4),
          shelfN: isWater && isCoast ? 1 : 0,
          deepN: isWater && !isCoast ? 1 : 0,
          moist: clamp01(effectiveMoisture[i]!),
        };
        return WONDER_GROUPS[group].suitability(signals);
      };

      const allTiles: Candidate[] = new Array(size);
      for (let i = 0; i < size; i++) {
        allTiles[i] = {
          plotIndex: i,
          relief: clamp01(reliefByTile[i]! / reliefScale),
          elevation: input.elevation[i]!,
        };
      }

      const compatibilityContext = {
        width,
        height,
        terrainType: input.terrainType,
        biomeType: input.biomeType,
        featureType: input.featureType,
        landMask: input.landMask,
        riverClass: input.riverClass,
        coastTerrainType,
        mountainTerrainType: input.mountainTerrainType,
        iceFeatureType: input.iceFeatureType,
        noFeatureType,
        naturalWonderBlockedMask: input.naturalWonderBlockedMask,
        lakeMask: input.lakeMask,
      };

      // Per-wonder candidate ranking: each wonder's constraint-passing tiles sorted
      // by its own suitability. `bestSuitability` (the top tile's score) ranks WHICH
      // wonders are placed.
      type WonderPlan = {
        feature: NaturalWonderFeatureCandidate;
        sorted: RankedCandidate[];
        bestSuitability: number;
      };
      const plans: WonderPlan[] = featureCatalog.map((feature) => {
        const group = wonderGroup(feature.featureType);
        const scored: RankedCandidate[] = [];
        for (const candidate of allTiles) {
          if (!isCandidateCompatibleWithFeature({ feature, candidate, ...compatibilityContext })) {
            continue;
          }
          scored.push({ candidate, suitability: suitabilityAt(group, candidate) });
        }
        scored.sort(
          (a, b) => b.suitability - a.suitability || a.candidate.plotIndex - b.candidate.plotIndex
        );
        return {
          feature,
          sorted: scored,
          bestSuitability: scored.length > 0 ? scored[0]!.suitability : -1,
        };
      });

      const minSpacingTiles = config.minSpacingTiles;
      const targetCount = Math.min(wondersCount, featureCatalog.length, size);
      const selected: Array<{
        plotIndex: number;
        featureType: number;
        direction: number;
        elevation: number;
        priority: number;
        fallbacks?: Array<{ plotIndex: number; elevation: number }>;
      }> = [];
      const usedPlots = new Set<number>();

      /**
       * Highest-suitability anchor still available for `plan`, or `null` if none
       * fits. Walks the wonder's suitability-descending tile list and returns the
       * first whose entire parity-aware footprint is free (no cell in `usedPlots`)
       * and which sits at least `minSpacing` hexes from every already-placed wonder.
       * Callers retry with `minSpacing = 0` to relax the spacing floor when the
       * spaced pass finds nothing (the floor is a preference, not a hard rule).
       */
      const pickTile = (plan: WonderPlan, minSpacing: number): SelectedCandidate | null => {
        for (const ranked of plan.sorted) {
          const { candidate } = ranked;
          if (usedPlots.has(candidate.plotIndex)) continue;
          const footprint = getFootprintIndices({
            plotIndex: candidate.plotIndex,
            width,
            height,
            footprintOffsetsByParity: plan.feature.footprintOffsetsByParity,
          });
          if (!footprint || footprint.some((p) => usedPlots.has(p))) continue;
          if (minSpacing > 0) {
            let tooClose = false;
            for (const placed of selected) {
              if (
                hexDistanceOddQPeriodicX(candidate.plotIndex, placed.plotIndex, width) < minSpacing
              ) {
                tooClose = true;
                break;
              }
            }
            if (tooClose) continue;
          }
          return { ...ranked, footprint };
        }
        return null;
      };

      /**
       * Next-best anchors for a wonder after its primary is chosen — the recovery
       * list the materialize step retries in order when the engine refuses the
       * primary anchor (`canHaveFeatureParam`-true does NOT guarantee
       * `setFeatureType`-success, especially for multi-tile wonders).
       *
       * Fallbacks are ALTERNATIVES to the primary (only one is ever stamped), so
       * they may sit near it; each must have a free parity-aware footprint that
       * avoids every already-placed wonder AND the primary's own footprint
       * (`excluded`). Spaced candidates (>= `minSpacingTiles` from placed wonders)
       * are preferred and returned first, then unspaced ones fill up to
       * `NATURAL_WONDER_FALLBACK_LIMIT`. Suitability-descending (walks `plan.sorted`).
       *
       * MUST be called BEFORE the primary footprint is added to `usedPlots`, so
       * fallbacks are scored as alternatives to the primary rather than as tiles
       * forbidden by it.
       */
      const collectFallbacks = (
        plan: WonderPlan,
        primaryPlotIndex: number,
        primaryFootprint: readonly number[]
      ): Array<{ plotIndex: number; elevation: number }> => {
        const excluded = new Set(primaryFootprint);
        const spaced: Array<{ plotIndex: number; elevation: number }> = [];
        const unspaced: Array<{ plotIndex: number; elevation: number }> = [];
        for (const { candidate } of plan.sorted) {
          if (candidate.plotIndex === primaryPlotIndex) continue;
          if (usedPlots.has(candidate.plotIndex) || excluded.has(candidate.plotIndex)) continue;
          const footprint = getFootprintIndices({
            plotIndex: candidate.plotIndex,
            width,
            height,
            footprintOffsetsByParity: plan.feature.footprintOffsetsByParity,
          });
          if (!footprint) continue;
          if (footprint.some((p) => usedPlots.has(p) || excluded.has(p))) continue;
          let tooClose = false;
          if (minSpacingTiles > 0) {
            for (const placed of selected) {
              if (
                hexDistanceOddQPeriodicX(candidate.plotIndex, placed.plotIndex, width) <
                minSpacingTiles
              ) {
                tooClose = true;
                break;
              }
            }
          }
          (tooClose ? unspaced : spaced).push({
            plotIndex: candidate.plotIndex,
            elevation: candidate.elevation,
          });
          if (spaced.length >= NATURAL_WONDER_FALLBACK_LIMIT) break;
        }
        return [...spaced, ...unspaced].slice(0, NATURAL_WONDER_FALLBACK_LIMIT);
      };

      // Cross-wonder selection: diminishing-returns greedy. Each iteration places
      // the remaining wonder with the highest effective score, where a wonder's
      // best-achievable suitability decays by GROUP_DISCOUNT for every wonder
      // already placed from its requirement group:
      //   effectiveScore = placeFirstBonus + bestSuitability * GROUP_DISCOUNT^groupCount
      // placeFirst wonders carry a large additive bonus so the engine
      // base-generator ordering is preserved, but the per-group decay still
      // applies. The decay makes a 2nd water wonder (1.0 * 0.5 = 0.5) lose to a
      // fresh land wonder (~0.7), so the selected set is a cross-type MIX whose
      // composition tracks the map's terrain (more mountains → more mountain
      // wonders) instead of collapsing to the abundant-water groups. Fully
      // deterministic — argmax with a stable tie-break, no RNG.
      const PLACE_FIRST_BONUS = 1000;
      const GROUP_DISCOUNT = 0.5;
      const groupSelectedCount = new Map<WonderGroup, number>();
      const remaining = plans.filter((plan) => plan.bestSuitability >= 0);

      /**
       * The greedy's per-iteration ranking key for a wonder: its `bestSuitability`
       * decayed by `GROUP_DISCOUNT` once per wonder already placed from the same
       * requirement group, plus a large additive `PLACE_FIRST_BONUS` for
       * base-generator `placeFirst` wonders. The decay is the variety mechanism — it
       * lets a fresh group's wonder out-rank a second wonder from an already-served
       * group even at lower raw suitability. Recomputed each iteration because
       * `groupSelectedCount` changes as wonders are placed.
       */
      const effectiveScore = (plan: WonderPlan): number => {
        const alreadyFromGroup = groupSelectedCount.get(wonderGroup(plan.feature.featureType)) ?? 0;
        const bonus = plan.feature.placeFirst ? PLACE_FIRST_BONUS : 0;
        return bonus + plan.bestSuitability * GROUP_DISCOUNT ** alreadyFromGroup;
      };
      /**
       * Total ordering for the greedy's argmax: is `a` a strictly better pick than
       * `b`? Compares `effectiveScore`, then `bestSuitability`, then LOWER
       * `featureType` as a stable last resort. featureType is unique per catalog
       * entry, so every tie resolves deterministically — there is no RNG fallback.
       */
      const isBetterPick = (a: WonderPlan, b: WonderPlan): boolean => {
        const sa = effectiveScore(a);
        const sb = effectiveScore(b);
        if (sa !== sb) return sa > sb;
        if (a.bestSuitability !== b.bestSuitability) return a.bestSuitability > b.bestSuitability;
        return a.feature.featureType < b.feature.featureType;
      };

      while (selected.length < targetCount && remaining.length > 0) {
        let bestIdx = 0;
        for (let i = 1; i < remaining.length; i++) {
          if (isBetterPick(remaining[i]!, remaining[bestIdx]!)) bestIdx = i;
        }
        const plan = remaining[bestIdx]!;
        const selectedCandidate = pickTile(plan, minSpacingTiles) ?? pickTile(plan, 0);
        if (!selectedCandidate) {
          // No free, in-bounds footprint remains for this wonder: drop it.
          remaining.splice(bestIdx, 1);
          continue;
        }
        const { candidate, footprint: primaryFootprint, suitability } = selectedCandidate;
        // Collect fallbacks BEFORE the primary footprint is marked used, so they
        // are scored as alternatives to the primary (excluding the primary's own
        // footprint), not as tiles forbidden by it.
        const fallbacks = collectFallbacks(plan, candidate.plotIndex, primaryFootprint);
        for (const plotIndex of primaryFootprint) usedPlots.add(plotIndex);
        const group = wonderGroup(plan.feature.featureType);
        groupSelectedCount.set(group, (groupSelectedCount.get(group) ?? 0) + 1);
        selected.push({
          plotIndex: candidate.plotIndex,
          featureType: plan.feature.featureType,
          direction: plan.feature.direction,
          elevation: candidate.elevation,
          priority: clamp01(suitability),
          ...(fallbacks.length > 0 ? { fallbacks } : {}),
        });
        remaining.splice(bestIdx, 1);
      }

      return {
        width,
        height,
        wondersCount,
        targetCount,
        plannedCount: selected.length,
        placements: selected,
      };
    },
  }
);

export default suitabilityDiversity;

function wrappedX(x: number, width: number): number {
  return ((x % width) + width) % width;
}

/**
 * Resolves a wonder's footprint to concrete plot indices at one anchor. Picks the
 * offset list for the ANCHOR row's parity (`y & 1`) — odd and even rows carry
 * distinct offsets because the engine grid is odd-R (the byParity data forwarded
 * by plan-natural-wonders from map-policy) — then walks it from the anchor,
 * wrapping in X (cylinder) and rejecting any footprint that runs off the top/
 * bottom edge.
 *
 * Returns `null` when the footprint is out of bounds in Y; callers treat `null`
 * as "this anchor cannot host the wonder". The op's single
 * source of footprint geometry — used by candidate compatibility, the primary
 * pick, and fallback collection so all three reserve the same cells. For a
 * self-orienting 4-tile wonder the forwarded offsets are anchor-only, so this
 * returns just `[anchor]` (the engine owns the other three cells).
 */
function getFootprintIndices(args: {
  plotIndex: number;
  width: number;
  height: number;
  footprintOffsetsByParity: Readonly<FootprintOffsetsByParity>;
}): number[] | null {
  const y = (args.plotIndex / args.width) | 0;
  const x = args.plotIndex - y * args.width;
  // Resolve parity at the concrete anchor (odd-R): odd rows and even rows use
  // distinct offset sets (map-policy byParity helper).
  const offsets =
    (y & 1) === 1 ? args.footprintOffsetsByParity.odd : args.footprintOffsetsByParity.even;
  const indices: number[] = [];
  const seen = new Set<number>();
  for (const offset of offsets) {
    const fy = y + offset.dy;
    if (fy < 0 || fy >= args.height) return null;
    const fx = wrappedX(x + offset.dx, args.width);
    const index = fy * args.width + fx;
    if (seen.has(index)) continue;
    seen.add(index);
    indices.push(index);
  }
  return indices;
}

function forEachFootprintNeighbor(args: {
  footprint: readonly number[];
  width: number;
  height: number;
  fn: (plotIndex: number) => void;
}): void {
  const seen = new Set(args.footprint);
  for (const plotIndex of args.footprint) {
    const y = (plotIndex / args.width) | 0;
    const x = plotIndex - y * args.width;
    for (const ni of getHexNeighborIndicesOddQ(x, y, args.width, args.height)) {
      if (seen.has(ni)) continue;
      seen.add(ni);
      args.fn(ni);
    }
  }
}

function hasTerrainWithinHexDistance(args: {
  centerIndex: number;
  width: number;
  height: number;
  terrainType: ArrayLike<number>;
  targetTerrainType: number;
  maxDistance: number;
}): boolean {
  const queue: Array<{ index: number; distance: number }> = [
    { index: args.centerIndex, distance: 0 },
  ];
  const seen = new Set<number>([args.centerIndex]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.distance > 0 && args.terrainType[current.index]! === args.targetTerrainType) {
      return true;
    }
    if (current.distance >= args.maxDistance) continue;
    const y = (current.index / args.width) | 0;
    const x = current.index - y * args.width;
    for (const ni of getHexNeighborIndicesOddQ(x, y, args.width, args.height)) {
      if (seen.has(ni)) continue;
      seen.add(ni);
      queue.push({ index: ni, distance: current.distance + 1 });
    }
  }
  return false;
}

/**
 * Conservative offline check of a wonder's `Feature_Placement` predicate tags
 * against the tile/footprint neighborhood. Returns true only if EVERY tag the
 * wonder declares is satisfied (a hard AND); a single failing tag drops the
 * candidate. Called by `isCandidateCompatibleWithFeature` as part of the
 * pass/fail constraint gate, before suitability ranking.
 *
 * Two tag categories:
 *  - Adjacency/distance predicates resolvable offline (ADJACENTTOCOAST,
 *    NOTADJACENTTOLAND, ADJACENTMOUNTAIN, WATERFALL, NOTNEARCOAST, …) are
 *    evaluated against the footprint and its neighbors.
 *  - Engine-deferred tags with no offline signal (FEATURE_FOREST/REEF,
 *    SHALLOWWATER, VOLCANO, ADJACENTCLIFF, NOLANDOPPOSITECLIFF) pass through
 *    here; the engine's stamp-time `canHaveFeatureParam` is their authority.
 *
 * An UNKNOWN tag returns false (fail-closed) — a wonder with a tag this op does
 * not understand is dropped rather than placed on an unvalidated neighborhood.
 *
 * Adjacency: the neighbor walk uses mapgen-core's `getHexNeighborIndicesOddQ`,
 * whose `OddQ` name is LEGACY — it is odd-R (keyed on `y & 1`), live-calibrated to
 * the engine — so hard adjacency tags (notably ADJACENTMOUNTAIN) agree with the
 * engine's stamp-time adjacency.
 */
function satisfiesFeatureTags(args: {
  feature: NaturalWonderFeatureCandidate;
  candidate: Candidate;
  footprint: readonly number[];
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  terrainType: ArrayLike<number>;
  biomeType: ArrayLike<number>;
  featureType: ArrayLike<number>;
  riverClass: ArrayLike<number>;
  coastTerrainType: number;
  mountainTerrainType: number;
  iceFeatureType: number;
}): boolean {
  for (const tag of args.feature.featureTags) {
    switch (tag) {
      // Engine-deferred tags: the pure op has no shelf/reef/forest signal and no
      // cliff oracle (cliffs are engine edge state, unavailable offline), so these
      // are pass-through pre-filters; the engine `canHaveFeatureParam` at stamp
      // time is the legality authority. FEATURE_FOREST/SHALLOWWATER/VOLCANO are
      // wired to real physical signals in the suitability pass (Task 5).
      case "FEATURE_FOREST":
      case "FEATURE_REEF":
      case "SHALLOWWATER":
      case "VOLCANO":
      case "ADJACENTCLIFF":
      case "NOLANDOPPOSITECLIFF":
        break;
      case "ADJACENTTOCOAST": {
        let adjacentToCoast = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.terrainType[plotIndex]! === args.coastTerrainType) {
              adjacentToCoast = true;
            }
          },
        });
        if (!adjacentToCoast) return false;
        break;
      }
      case "NOTADJACENTTOLAND": {
        let adjacentToLand = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.landMask[plotIndex] === 1) adjacentToLand = true;
          },
        });
        if (adjacentToLand) return false;
        break;
      }
      case "ADJACENTTOSAMETERRAIN": {
        const terrain = args.terrainType[args.candidate.plotIndex]!;
        let adjacentSameTerrain = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.terrainType[plotIndex]! === terrain) adjacentSameTerrain = true;
          },
        });
        if (!adjacentSameTerrain) return false;
        break;
      }
      case "ADJACENTTOLAND": {
        let adjacentToLand = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.landMask[plotIndex] === 1) adjacentToLand = true;
          },
        });
        if (!adjacentToLand) return false;
        break;
      }
      case "ADJACENTMOUNTAIN": {
        let adjacentMountain = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.terrainType[plotIndex]! === args.mountainTerrainType) {
              adjacentMountain = true;
            }
          },
        });
        if (!adjacentMountain) return false;
        break;
      }
      case "ADJACENTTOSAMEBIOME": {
        const biome = args.biomeType[args.candidate.plotIndex]!;
        let adjacentSameBiome = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.biomeType[plotIndex]! === biome) adjacentSameBiome = true;
          },
        });
        if (!adjacentSameBiome) return false;
        break;
      }
      case "NOTADJACENTMOUNTAIN": {
        let adjacentMountain = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.terrainType[plotIndex]! === args.mountainTerrainType) {
              adjacentMountain = true;
            }
          },
        });
        if (adjacentMountain) return false;
        break;
      }
      case "NOTADJACENTTOICE": {
        let adjacentIce = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.featureType[plotIndex]! === args.iceFeatureType) adjacentIce = true;
          },
        });
        if (adjacentIce) return false;
        break;
      }
      case "NOTADJACENTTORIVER": {
        let adjacentRiver = false;
        for (const plotIndex of args.footprint) {
          if (isAnyRiverClass(args.riverClass[plotIndex])) adjacentRiver = true;
        }
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (isAnyRiverClass(args.riverClass[plotIndex])) adjacentRiver = true;
          },
        });
        if (adjacentRiver) return false;
        break;
      }
      case "NOTNEARCOAST":
        for (const plotIndex of args.footprint) {
          if (
            hasTerrainWithinHexDistance({
              centerIndex: plotIndex,
              width: args.width,
              height: args.height,
              terrainType: args.terrainType,
              targetTerrainType: args.coastTerrainType,
              maxDistance: 2,
            })
          ) {
            return false;
          }
        }
        break;
      case "WATERFALL": {
        let adjacentRiver = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (isAnyRiverClass(args.riverClass[plotIndex])) adjacentRiver = true;
          },
        });
        if (!adjacentRiver) return false;
        break;
      }
      default:
        return false;
    }
  }
  return true;
}

/**
 * The hard-constraint gate: can this wonder legally be reserved at this anchor,
 * offline? Returns true only when EVERY footprint cell clears all checks —
 * in-bounds footprint, not in `naturalWonderBlockedMask` (polar water rows), no
 * existing feature, valid terrain/biome (when the wonder restricts them), no lake
 * (when `noLake`) — AND the predicate tags pass (`satisfiesFeatureTags`) AND the
 * anchor meets `minimumElevation`.
 *
 * This is pass/fail and is the filter the planner runs before any suitability
 * ranking: tiles that fail are never scored or selected. It is a CONSERVATIVE
 * pre-filter, not the final word — the engine's `canHaveFeatureParam` + readback
 * at stamp time is the legality authority, so a tile that passes here can still
 * be refused later (recovered via the materialize fallback retry).
 */
function isCandidateCompatibleWithFeature(args: {
  feature: NaturalWonderFeatureCandidate;
  candidate: Candidate;
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  terrainType: ArrayLike<number>;
  biomeType: ArrayLike<number>;
  featureType: ArrayLike<number>;
  riverClass: ArrayLike<number>;
  coastTerrainType: number;
  mountainTerrainType: number;
  iceFeatureType: number;
  noFeatureType: number;
  naturalWonderBlockedMask: ArrayLike<number>;
  lakeMask: ArrayLike<number>;
}): boolean {
  const footprint = getFootprintIndices({
    plotIndex: args.candidate.plotIndex,
    width: args.width,
    height: args.height,
    footprintOffsetsByParity: args.feature.footprintOffsetsByParity,
  });
  if (!footprint) return false;
  for (const plotIndex of footprint) {
    if (args.naturalWonderBlockedMask[plotIndex] === 1) return false;
    if (args.featureType[plotIndex]! !== args.noFeatureType) {
      return false;
    }
    const terrain = args.terrainType[plotIndex]!;
    if (
      args.feature.validTerrainTypes.length > 0 &&
      !args.feature.validTerrainTypes.includes(terrain)
    ) {
      return false;
    }
    const biome = args.biomeType[plotIndex]!;
    if (args.feature.validBiomeTypes.length > 0 && !args.feature.validBiomeTypes.includes(biome)) {
      return false;
    }
    if (args.feature.noLake && args.lakeMask[plotIndex] === 1) return false;
  }
  if (
    !satisfiesFeatureTags({
      feature: args.feature,
      candidate: args.candidate,
      footprint,
      width: args.width,
      height: args.height,
      landMask: args.landMask,
      terrainType: args.terrainType,
      biomeType: args.biomeType,
      featureType: args.featureType,
      riverClass: args.riverClass,
      coastTerrainType: args.coastTerrainType,
      mountainTerrainType: args.mountainTerrainType,
      iceFeatureType: args.iceFeatureType,
    })
  ) {
    return false;
  }
  if (
    args.feature.minimumElevation !== null &&
    args.candidate.elevation < args.feature.minimumElevation
  ) {
    return false;
  }
  return true;
}
